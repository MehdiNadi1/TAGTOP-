-- TAGTOP Supabase PostgreSQL Stored Procedures & RPCs: 20261028000002_tagtop_rpc_and_admin.sql
-- Description: Server-side secure functions for atomic operations (order delivery, transfer verification, analytics, access state transitions).

-- =============================================================================
-- 1. ATOMIC ANALYTICS LOGGING RPC
-- =============================================================================
CREATE OR REPLACE FUNCTION public.record_profile_event(
  p_profile_id TEXT,
  p_event_type TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Validate event type
  IF p_event_type NOT IN ('tap', 'whatsapp_click', 'vcard_download') THEN
    RAISE EXCEPTION 'Invalid event type: %', p_event_type;
  END IF;

  -- Ensure profile exists
  IF NOT EXISTS (SELECT 1 FROM public.business_profiles WHERE id = p_profile_id) THEN
    RETURN;
  END IF;

  -- Insert individual event log
  INSERT INTO public.analytics_events (profile_id, event_type)
  VALUES (p_profile_id, p_event_type);

  -- Upsert aggregate counters atomically
  INSERT INTO public.profile_analytics_summary (
    profile_id,
    taps,
    whatsapp_clicks,
    vcard_downloads,
    updated_at
  )
  VALUES (
    p_profile_id,
    CASE WHEN p_event_type = 'tap' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'whatsapp_click' THEN 1 ELSE 0 END,
    CASE WHEN p_event_type = 'vcard_download' THEN 1 ELSE 0 END,
    timezone('utc'::text, now())
  )
  ON CONFLICT (profile_id) DO UPDATE SET
    taps = public.profile_analytics_summary.taps + (CASE WHEN p_event_type = 'tap' THEN 1 ELSE 0 END),
    whatsapp_clicks = public.profile_analytics_summary.whatsapp_clicks + (CASE WHEN p_event_type = 'whatsapp_click' THEN 1 ELSE 0 END),
    vcard_downloads = public.profile_analytics_summary.vcard_downloads + (CASE WHEN p_event_type = 'vcard_download' THEN 1 ELSE 0 END),
    updated_at = timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================================================
-- 2. FOUNDER ADMIN: APPROVE BANK TRANSFER & EXTEND SUBSCRIPTION
-- =============================================================================
CREATE OR REPLACE FUNCTION public.founder_approve_bank_transfer(
  p_transfer_id TEXT,
  p_founder_notes TEXT DEFAULT ''
)
RETURNS JSONB AS $$
DECLARE
  v_transfer RECORD;
  v_days_to_add INTEGER;
  v_new_expiry DATE;
BEGIN
  -- Security check: caller must be founder admin
  IF NOT public.is_founder_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only founder admin can approve bank transfers';
  END IF;

  -- Retrieve transfer record
  SELECT * INTO v_transfer FROM public.bank_transfers WHERE id = p_transfer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transfer % not found', p_transfer_id;
  END IF;

  IF v_transfer.status = 'approved' THEN
    RAISE EXCEPTION 'Transfer % has already been approved', p_transfer_id;
  END IF;

  -- Business Rule: 150 MAD = 6 months (180 days), 200 MAD = 1 year (365 days)
  IF v_transfer.amount_mad = 150.00 THEN
    v_days_to_add := 180;
  ELSIF v_transfer.amount_mad = 200.00 THEN
    v_days_to_add := 365;
  ELSE
    RAISE EXCEPTION 'Unrecognized transfer amount: % MAD', v_transfer.amount_mad;
  END IF;

  -- Update transfer status
  UPDATE public.bank_transfers
  SET
    status = 'approved',
    founder_notes = p_founder_notes,
    verified_at = timezone('utc'::text, now()),
    verified_by = auth.uid()
  WHERE id = p_transfer_id;

  -- Calculate new expiry: extend from current expiry date if future, or from current date if already expired
  SELECT
    CASE
      WHEN expiry_date > CURRENT_DATE THEN (expiry_date + v_days_to_add)
      ELSE (CURRENT_DATE + v_days_to_add)
    END INTO v_new_expiry
  FROM public.business_profiles
  WHERE id = v_transfer.profile_id;

  -- Reactivate profile
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
    'new_expiry_date', v_new_expiry
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================================================
-- 3. FOUNDER ADMIN: REJECT BANK TRANSFER
-- =============================================================================
CREATE OR REPLACE FUNCTION public.founder_reject_bank_transfer(
  p_transfer_id TEXT,
  p_reason TEXT
)
RETURNS JSONB AS $$
BEGIN
  IF NOT public.is_founder_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only founder admin can reject bank transfers';
  END IF;

  UPDATE public.bank_transfers
  SET
    status = 'rejected',
    founder_notes = p_reason,
    verified_at = timezone('utc'::text, now()),
    verified_by = auth.uid()
  WHERE id = p_transfer_id;

  RETURN jsonb_build_object('success', TRUE, 'transfer_id', p_transfer_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================================================
-- 4. FOUNDER ADMIN: UPDATE ORDER STATUS & UNLOCK DELIVERED PROFILES
-- =============================================================================
CREATE OR REPLACE FUNCTION public.founder_update_order_status(
  p_order_id TEXT,
  p_order_status tagtop_order_status,
  p_payment_status tagtop_payment_status DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
BEGIN
  IF NOT public.is_founder_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only founder admin can modify order status';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  UPDATE public.orders
  SET
    order_status = p_order_status,
    payment_status = COALESCE(p_payment_status, payment_status),
    updated_at = timezone('utc'::text, now())
  WHERE id = p_order_id;

  -- If order has been delivered and associated profile was pending, activate it
  IF p_order_status = 'delivered' AND v_order.profile_id IS NOT NULL THEN
    UPDATE public.business_profiles
    SET
      access_state = 'active',
      linked_card_count = linked_card_count + v_order.card_quantity,
      updated_at = timezone('utc'::text, now())
    WHERE id = v_order.profile_id
      AND access_state IN ('private_preview', 'order_pending');
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'order_id', p_order_id,
    'order_status', p_order_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================================================
-- 5. DAILY SUBSCRIPTION EVALUATION (Cron / Scheduled Job)
-- =============================================================================
-- Can be called via pg_cron (e.g. SELECT cron.schedule('0 0 * * *', 'SELECT public.evaluate_profile_subscriptions()'))
CREATE OR REPLACE FUNCTION public.evaluate_profile_subscriptions()
RETURNS JSONB AS $$
DECLARE
  v_now DATE := CURRENT_DATE;
  v_grace_count INTEGER := 0;
  v_suspended_count INTEGER := 0;
BEGIN
  -- Step 1: Active or renewal_due profiles past expiry enter 14-day grace period
  WITH transitioned_to_grace AS (
    UPDATE public.business_profiles
    SET
      access_state = 'grace_period',
      grace_deadline_date = (expiry_date + INTERVAL '14 days')::DATE,
      updated_at = timezone('utc'::text, now())
    WHERE access_state IN ('active', 'renewal_due')
      AND expiry_date < v_now
      AND v_now <= (expiry_date + INTERVAL '14 days')::DATE
    RETURNING id
  )
  SELECT count(*) INTO v_grace_count FROM transitioned_to_grace;

  -- Step 2: Profiles past the 14-day grace period become suspended (customer data preserved!)
  WITH transitioned_to_suspended AS (
    UPDATE public.business_profiles
    SET
      access_state = 'expired_suspended',
      updated_at = timezone('utc'::text, now())
    WHERE access_state = 'grace_period'
      AND v_now > grace_deadline_date
    RETURNING id
  )
  SELECT count(*) INTO v_suspended_count FROM transitioned_to_suspended;

  RETURN jsonb_build_object(
    'evaluated_date', v_now,
    'profiles_in_grace', v_grace_count,
    'profiles_suspended', v_suspended_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
