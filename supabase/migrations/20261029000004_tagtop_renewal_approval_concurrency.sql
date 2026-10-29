-- Migration: 20261029000004_tagtop_renewal_approval_concurrency.sql
-- Description: 1. Replace 1-second timestamp ID default with collision-resistant UUID generator.
--              2. Harden bank transfer approval & rejection against race conditions,
--                 deadlocks, lost updates, and invalid terminal-state transitions.

-- =============================================================================
-- 1. Collision-Resistant Bank Transfer ID Generator
-- =============================================================================
-- Preserves existing column type (TEXT), foreign keys, RLS policies, and historical records.
ALTER TABLE public.bank_transfers
  ALTER COLUMN id SET DEFAULT ('trn-' || gen_random_uuid()::text);


-- =============================================================================
-- 2. Hardened founder_approve_bank_transfer
-- =============================================================================
CREATE OR REPLACE FUNCTION public.founder_approve_bank_transfer(
  p_transfer_id TEXT,
  p_founder_notes TEXT DEFAULT ''
)
RETURNS JSONB AS $$
DECLARE
  v_transfer RECORD;
  v_current_expiry DATE;
  v_days_to_add INTEGER;
  v_new_expiry DATE;
BEGIN
  -- 1. Authorization: Verified Founder Admin or Service Role only
  IF NOT public.is_admin_or_service_role() THEN
    RAISE EXCEPTION 'Unauthorized: Only founder admin or service role can approve bank transfers';
  END IF;

  -- 2. Concurrency Safety: Limit lock acquisition wait time to 5 seconds
  PERFORM set_config('lock_timeout', '5000ms', TRUE);

  -- 3. Lock Transfer Row: Exclusive row-level lock
  SELECT * INTO v_transfer
  FROM public.bank_transfers
  WHERE id = p_transfer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transfer % not found', p_transfer_id;
  END IF;

  -- 4. Terminal State Protection: Only pending transfers can be approved
  IF v_transfer.status != 'pending' THEN
    IF v_transfer.status = 'approved' THEN
      RAISE EXCEPTION 'Transfer % has already been approved', p_transfer_id;
    ELSIF v_transfer.status = 'rejected' THEN
      RAISE EXCEPTION 'Transfer % has already been rejected and cannot be approved', p_transfer_id;
    ELSE
      RAISE EXCEPTION 'Transfer % cannot be approved: current status is "%" (only pending transfers can be approved)', p_transfer_id, v_transfer.status;
    END IF;
  END IF;

  -- 5. Strict Amount & Duration Validation (150 MAD -> 180 days, 200 MAD -> 365 days)
  IF v_transfer.amount_mad = 150.00 THEN
    v_days_to_add := 180;
  ELSIF v_transfer.amount_mad = 200.00 THEN
    v_days_to_add := 365;
  ELSE
    RAISE EXCEPTION 'Unrecognized transfer amount: % MAD', v_transfer.amount_mad;
  END IF;

  -- 6. Lock Profile Row: Exclusive lock to serialize concurrent renewals on the same profile
  SELECT expiry_date INTO v_current_expiry
  FROM public.business_profiles
  WHERE id = v_transfer.profile_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile % not found for transfer %', v_transfer.profile_id, p_transfer_id;
  END IF;

  -- 7. Calculate New Expiry Date Based on Locked Record
  IF v_current_expiry > CURRENT_DATE THEN
    v_new_expiry := v_current_expiry + v_days_to_add;
  ELSE
    v_new_expiry := CURRENT_DATE + v_days_to_add;
  END IF;

  -- 8. Mark Transfer as Approved
  UPDATE public.bank_transfers
  SET
    status = 'approved',
    founder_notes = p_founder_notes,
    verified_at = timezone('utc'::text, now()),
    verified_by = auth.uid()
  WHERE id = p_transfer_id;

  -- 9. Update Business Profile Expiry & Access State
  UPDATE public.business_profiles
  SET
    access_state = 'active',
    expiry_date = v_new_expiry,
    grace_deadline_date = NULL,
    updated_at = timezone('utc'::text, now())
  WHERE id = v_transfer.profile_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'transfer_id', p_transfer_id,
    'profile_id', v_transfer.profile_id,
    'days_added', v_days_to_add,
    'new_expiry_date', v_new_expiry
  );

EXCEPTION
  WHEN lock_not_available THEN
    RAISE EXCEPTION 'Concurrency conflict: Lock not available for transfer % or profile %. Please retry.', p_transfer_id, v_transfer.profile_id;
  WHEN deadlock_detected THEN
    RAISE EXCEPTION 'Concurrency conflict: Deadlock detected while processing transfer %. Transaction aborted.', p_transfer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.founder_approve_bank_transfer(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.founder_approve_bank_transfer(TEXT, TEXT) TO authenticated, service_role;


-- =============================================================================
-- 3. Hardened founder_reject_bank_transfer
-- =============================================================================
CREATE OR REPLACE FUNCTION public.founder_reject_bank_transfer(
  p_transfer_id TEXT,
  p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_transfer RECORD;
BEGIN
  -- 1. Authorization: Verified Founder Admin or Service Role only
  IF NOT public.is_admin_or_service_role() THEN
    RAISE EXCEPTION 'Unauthorized: Only founder admin or service role can reject bank transfers';
  END IF;

  -- 2. Concurrency Safety: Limit lock acquisition wait time to 5 seconds
  PERFORM set_config('lock_timeout', '5000ms', TRUE);

  -- 3. Lock Transfer Row: Strict exclusive row-level lock
  SELECT * INTO v_transfer
  FROM public.bank_transfers
  WHERE id = p_transfer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transfer % not found', p_transfer_id;
  END IF;

  -- 4. Terminal State Protection: Only pending transfers can be rejected
  IF v_transfer.status != 'pending' THEN
    IF v_transfer.status = 'approved' THEN
      RAISE EXCEPTION 'Transfer % has already been approved and cannot be rejected', p_transfer_id;
    ELSIF v_transfer.status = 'rejected' THEN
      RAISE EXCEPTION 'Transfer % has already been rejected', p_transfer_id;
    ELSE
      RAISE EXCEPTION 'Transfer % cannot be rejected: current status is "%" (only pending transfers can be rejected)', p_transfer_id, v_transfer.status;
    END IF;
  END IF;

  -- 5. Mark Transfer as Rejected
  UPDATE public.bank_transfers
  SET
    status = 'rejected',
    founder_notes = p_reason,
    verified_at = timezone('utc'::text, now()),
    verified_by = auth.uid()
  WHERE id = p_transfer_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'transfer_id', p_transfer_id,
    'status', 'rejected'
  );

EXCEPTION
  WHEN lock_not_available THEN
    RAISE EXCEPTION 'Concurrency conflict: Lock not available for transfer %. Please retry.', p_transfer_id;
  WHEN deadlock_detected THEN
    RAISE EXCEPTION 'Concurrency conflict: Deadlock detected while processing transfer %. Transaction aborted.', p_transfer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.founder_reject_bank_transfer(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.founder_reject_bank_transfer(TEXT, TEXT) TO authenticated, service_role;

