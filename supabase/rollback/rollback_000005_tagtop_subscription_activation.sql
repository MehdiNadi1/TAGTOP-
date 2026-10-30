-- =============================================================================
-- TAGTOP TARGETED SCHEMA ROLLBACK: Migration 000005
-- Target File: supabase/rollback/rollback_000005_tagtop_subscription_activation.sql
-- Target Migration Reverted: 20261030000005_tagtop_subscription_activation_and_renewal.sql
-- Restored State Source of Truth:
--   - Functions: Migration 000003 (enforce_order_immutability, enforce_business_profile_immutability)
--   - Order Fulfillment Base: Migration 000003 (founder_update_order_status with duplicate benefit avoidance)
--   - Concurrency Base: Migration 000004 (founder_approve_bank_transfer UUID/FOR UPDATE)
-- Execution Mode: TRANSACTIONAL (Single Atomic Transaction with Strict Assertions)
-- DO NOT EXECUTE AUTOMATICALLY - REQUIRES EXPLICIT OPERATOR APPROVAL
-- =============================================================================
--
-- ARCHITECTURAL NOTICE & SAFETY SAFEGUARDS (TASK 5):
-- -----------------------------------------------------------------------------
-- 1. PRESERVATION OF AUDIT TRAILS & TRACKING COLUMNS:
--    This rollback deliberately DOES NOT drop columns (initial_subscription_activated,
--    activated_at, initial_order_id, delivery_benefits_applied, delivered_at).
--    Silently dropping columns would destroy audit records, fulfillment tracking,
--    and delivery timestamps for cards manufactured and shipped.
--    Instead, the rollback restores procedural logic while keeping data intact.
--
-- 2. PRESERVATION OF CONCURRENCY HARDENING:
--    Migration 000004 fixed critical primary key collisions on bank_transfers.id
--    and added FOR UPDATE row locks. This rollback reverts only the 000005
--    subscription activation extensions in founder_approve_bank_transfer and
--    founder_update_order_status, strictly preserving 000004 concurrency safety.
--
-- 3. STRICT PRESERVATION OF ORDER INSERTION & AUTHENTICATION PROTECTIONS:
--    Strictly preserves all baseline security guarantees from Migration 000003,
--    including server-calculated pricing, customer_id assignment, anonymous
--    guest checkout restrictions, and zero-trust resets of proof and card flags.
--
-- 4. AVOIDANCE OF FUTURE DUPLICATE DELIVERY BENEFITS:
--    Checks orders.delivery_benefits_applied so orders delivered under Migration
--    000005 will not re-credit physical card counts if updated after rollback.
--
-- 5. EXPLICIT OPERATOR APPROVAL REQUIREMENT:
--    The transaction will immediately abort unless the session configuration:
--      SET LOCAL tagtop.operator_approved_rollback = 'APPROVED';
--    has been explicitly executed in the transaction prior to execution.
-- =============================================================================

BEGIN;

-- =============================================================================
-- STEP 1: OPERATOR APPROVAL CHECK
-- =============================================================================
DO $$
BEGIN
  IF current_setting('tagtop.operator_approved_rollback', TRUE) IS DISTINCT FROM 'APPROVED' THEN
    RAISE EXCEPTION 'Rollback refused: Operator approval setting "tagtop.operator_approved_rollback" must be set to "APPROVED" before executing this rollback script.';
  END IF;
END;
$$;


-- =============================================================================
-- STEP 2: PRECONDITION ASSERTIONS (STRICT SCHEMA VERIFICATION)
-- =============================================================================
DO $$
DECLARE
  v_missing TEXT := '';
BEGIN
  -- Verify target procedures exist
  IF to_regprocedure('public.founder_update_order_status(text, tagtop_order_status, tagtop_payment_status)') IS NULL THEN
    v_missing := v_missing || 'founder_update_order_status; ';
  END IF;
  IF to_regprocedure('public.founder_approve_bank_transfer(text, text)') IS NULL THEN
    v_missing := v_missing || 'founder_approve_bank_transfer; ';
  END IF;
  IF to_regprocedure('public.enforce_business_profile_immutability()') IS NULL THEN
    v_missing := v_missing || 'enforce_business_profile_immutability; ';
  END IF;
  IF to_regprocedure('public.enforce_order_immutability()') IS NULL THEN
    v_missing := v_missing || 'enforce_order_immutability; ';
  END IF;

  -- Verify tracking columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'business_profiles' AND column_name = 'initial_subscription_activated'
  ) THEN
    v_missing := v_missing || 'business_profiles.initial_subscription_activated; ';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'delivery_benefits_applied'
  ) THEN
    v_missing := v_missing || 'orders.delivery_benefits_applied; ';
  END IF;

  IF length(v_missing) > 0 THEN
    RAISE EXCEPTION 'Precondition failed: Database does not match Migration 000005 baseline. Missing objects: %', v_missing;
  END IF;
END;
$$;


-- =============================================================================
-- STEP 3: RESTORE BASELINE PROCEDURES
-- =============================================================================

-- 3.1 Restore founder_update_order_status (Migration 000003 baseline logic with duplicate benefit protection)
CREATE OR REPLACE FUNCTION public.founder_update_order_status(
  p_order_id TEXT,
  p_order_status tagtop_order_status,
  p_payment_status tagtop_payment_status DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
BEGIN
  IF NOT public.is_admin_or_service_role() THEN
    RAISE EXCEPTION 'Unauthorized: Only founder admin or service role can modify order status';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  UPDATE public.orders
  SET
    order_status = p_order_status,
    payment_status = COALESCE(p_payment_status, payment_status),
    updated_at = timezone('utc'::text, now())
  WHERE id = p_order_id;

  -- Avoid future duplicate delivery benefits for orders previously credited
  IF p_order_status = 'delivered' AND v_order.profile_id IS NOT NULL THEN
    IF NOT COALESCE(v_order.delivery_benefits_applied, FALSE) THEN
      UPDATE public.business_profiles
      SET
        access_state = 'active',
        linked_card_count = linked_card_count + v_order.card_quantity,
        updated_at = timezone('utc'::text, now())
      WHERE id = v_order.profile_id
        AND access_state IN ('private_preview', 'order_pending');

      UPDATE public.orders
      SET
        delivery_benefits_applied = TRUE,
        delivered_at = COALESCE(delivered_at, timezone('utc'::text, now()))
      WHERE id = p_order_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'order_id', p_order_id,
    'order_status', p_order_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.founder_update_order_status(TEXT, tagtop_order_status, tagtop_payment_status) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.founder_update_order_status(TEXT, tagtop_order_status, tagtop_payment_status) TO authenticated, service_role;


-- 3.2 Restore founder_approve_bank_transfer (Migration 000004 concurrency-safe baseline)
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
  IF NOT public.is_admin_or_service_role() THEN
    RAISE EXCEPTION 'Unauthorized: Only founder admin or service role can approve bank transfers';
  END IF;

  PERFORM set_config('lock_timeout', '5000ms', TRUE);

  SELECT * INTO v_transfer
  FROM public.bank_transfers
  WHERE id = p_transfer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transfer % not found', p_transfer_id;
  END IF;

  IF v_transfer.status != 'pending' THEN
    IF v_transfer.status = 'approved' THEN
      RAISE EXCEPTION 'Transfer % has already been approved', p_transfer_id;
    ELSIF v_transfer.status = 'rejected' THEN
      RAISE EXCEPTION 'Transfer % has already been rejected and cannot be approved', p_transfer_id;
    ELSE
      RAISE EXCEPTION 'Transfer % cannot be approved: current status is "%" (only pending transfers can be approved)', p_transfer_id, v_transfer.status;
    END IF;
  END IF;

  IF v_transfer.amount_mad = 150.00 THEN
    v_days_to_add := 180;
  ELSIF v_transfer.amount_mad = 200.00 THEN
    v_days_to_add := 365;
  ELSE
    RAISE EXCEPTION 'Unrecognized transfer amount: % MAD', v_transfer.amount_mad;
  END IF;

  SELECT expiry_date INTO v_current_expiry
  FROM public.business_profiles
  WHERE id = v_transfer.profile_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile % not found for transfer %', v_transfer.profile_id, p_transfer_id;
  END IF;

  IF v_current_expiry > CURRENT_DATE THEN
    v_new_expiry := v_current_expiry + v_days_to_add;
  ELSE
    v_new_expiry := CURRENT_DATE + v_days_to_add;
  END IF;

  UPDATE public.bank_transfers
  SET
    status = 'approved',
    founder_notes = p_founder_notes,
    verified_at = timezone('utc'::text, now()),
    verified_by = auth.uid()
  WHERE id = p_transfer_id;

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


-- 3.3 Restore enforce_business_profile_immutability (Migration 000003 baseline)
CREATE OR REPLACE FUNCTION public.enforce_business_profile_immutability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT public.is_admin_or_service_role() THEN
      NEW.owner_id := auth.uid();
      NEW.access_state := 'private_preview';
      NEW.expiry_date := (CURRENT_DATE + INTERVAL '180 days')::DATE;
      NEW.grace_deadline_date := NULL;
      NEW.linked_card_count := 0;
      NEW.is_demo := FALSE;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NOT public.is_admin_or_service_role() THEN
      IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
        RAISE EXCEPTION 'Security violation: Profile ownership cannot be transferred directly';
      END IF;
      IF NEW.access_state IS DISTINCT FROM OLD.access_state THEN
        RAISE EXCEPTION 'Security violation: Profile access state can only be modified by system/admin';
      END IF;
      IF NEW.expiry_date IS DISTINCT FROM OLD.expiry_date THEN
        RAISE EXCEPTION 'Security violation: Expiry date is immutable by customer';
      END IF;
      IF NEW.grace_deadline_date IS DISTINCT FROM OLD.grace_deadline_date THEN
        RAISE EXCEPTION 'Security violation: Grace period deadline is immutable by customer';
      END IF;
      IF NEW.linked_card_count IS DISTINCT FROM OLD.linked_card_count THEN
        RAISE EXCEPTION 'Security violation: Linked card count is managed by card provisioning';
      END IF;
      IF NEW.is_demo IS DISTINCT FROM OLD.is_demo THEN
        RAISE EXCEPTION 'Security violation: Demo flag is immutable by customer';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- 3.4 Restore enforce_order_immutability (Migration 000003 complete baseline with all protections)
CREATE OR REPLACE FUNCTION public.enforce_order_immutability()
RETURNS TRIGGER AS $$
DECLARE
  v_settings RECORD;
  v_unit_card_price NUMERIC(10, 2);
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT public.is_admin_or_service_role() THEN
      SELECT
        starter_branded_price_mad,
        starter_unbranded_price_mad,
        wooden_stand_enabled,
        wooden_stand_price_mad
      INTO v_settings
      FROM public.system_settings
      WHERE id = 1;

      IF NEW.package_tier = 'starter' THEN
        IF NEW.card_branding = 'branded' THEN
          v_unit_card_price := COALESCE(v_settings.starter_branded_price_mad, 250.00);
        ELSIF NEW.card_branding = 'unbranded' THEN
          v_unit_card_price := COALESCE(v_settings.starter_unbranded_price_mad, 350.00);
        ELSE
          RAISE EXCEPTION 'Invalid card branding: %', NEW.card_branding;
        END IF;
      ELSIF NEW.package_tier IN ('pro', 'enterprise') THEN
        RAISE EXCEPTION 'Unauthorized: Pro and Enterprise packages require quote approval by sales';
      ELSE
        RAISE EXCEPTION 'Invalid package tier: %', NEW.package_tier;
      END IF;

      IF NEW.card_quantity IS NULL OR NEW.card_quantity < 1 THEN
        NEW.card_quantity := 1;
      END IF;

      IF NEW.wooden_stand_selected THEN
        IF COALESCE(v_settings.wooden_stand_enabled, FALSE) THEN
          NEW.wooden_stand_price_mad := COALESCE(v_settings.wooden_stand_price_mad, 0.00);
        ELSE
          NEW.wooden_stand_selected := FALSE;
          NEW.wooden_stand_price_mad := 0.00;
        END IF;
      ELSE
        NEW.wooden_stand_price_mad := 0.00;
      END IF;

      NEW.price_mad := (v_unit_card_price * NEW.card_quantity) + NEW.wooden_stand_price_mad;
      NEW.order_status := 'received';
      NEW.payment_status := 'cod_pending';
      NEW.proof_approved := FALSE;
      NEW.proof_rejection_reason := NULL;
      NEW.proof_url := NULL;
      NEW.card_uid := NULL;
      NEW.is_demo := FALSE;

      IF auth.uid() IS NOT NULL THEN
        NEW.customer_id := auth.uid();
        IF NEW.profile_id IS NOT NULL THEN
          IF NOT EXISTS (
            SELECT 1 FROM public.business_profiles
            WHERE id = NEW.profile_id AND owner_id = auth.uid()
          ) THEN
            RAISE EXCEPTION 'Security violation: Cannot link order to a profile you do not own';
          END IF;
        END IF;
      ELSE
        NEW.customer_id := NULL;
        IF NEW.profile_id IS NOT NULL THEN
          RAISE EXCEPTION 'Security violation: Anonymous orders cannot be linked to existing business profiles. Please authenticate first.';
        END IF;
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NOT public.is_admin_or_service_role() THEN
      IF NEW.customer_id IS DISTINCT FROM OLD.customer_id OR
         NEW.price_mad IS DISTINCT FROM OLD.price_mad OR
         NEW.wooden_stand_price_mad IS DISTINCT FROM OLD.wooden_stand_price_mad OR
         NEW.card_quantity IS DISTINCT FROM OLD.card_quantity OR
         NEW.package_tier IS DISTINCT FROM OLD.package_tier OR
         NEW.card_color IS DISTINCT FROM OLD.card_color OR
         NEW.card_branding IS DISTINCT FROM OLD.card_branding OR
         NEW.wooden_stand_selected IS DISTINCT FROM OLD.wooden_stand_selected OR
         NEW.payment_status IS DISTINCT FROM OLD.payment_status OR
         NEW.card_uid IS DISTINCT FROM OLD.card_uid OR
         NEW.is_demo IS DISTINCT FROM OLD.is_demo THEN
        RAISE EXCEPTION 'Security violation: Order pricing, configuration, and fulfillment are immutable';
      END IF;

      IF NEW.order_status IS DISTINCT FROM OLD.order_status THEN
        IF OLD.order_status NOT IN ('received', 'artwork_review') THEN
          RAISE EXCEPTION 'Security violation: Order status cannot be modified once in production or delivery';
        END IF;
        IF NEW.order_status NOT IN ('customer_approved', 'artwork_review') THEN
          RAISE EXCEPTION 'Security violation: Customer can only approve proof or request revision';
        END IF;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- =============================================================================
-- STEP 4: POSTCONDITION ASSERTIONS (VERIFY SUCCESSFUL RESTORATION)
-- =============================================================================
DO $$
BEGIN
  -- Verify all procedures are valid and SECURITY DEFINER
  IF NOT (
    SELECT prosecdef FROM pg_proc
    WHERE oid = to_regprocedure('public.founder_update_order_status(text, tagtop_order_status, tagtop_payment_status)')
  ) THEN
    RAISE EXCEPTION 'Postcondition failed: founder_update_order_status is not SECURITY DEFINER';
  END IF;

  IF NOT (
    SELECT prosecdef FROM pg_proc
    WHERE oid = to_regprocedure('public.founder_approve_bank_transfer(text, text)')
  ) THEN
    RAISE EXCEPTION 'Postcondition failed: founder_approve_bank_transfer is not SECURITY DEFINER';
  END IF;

  IF NOT (
    SELECT prosecdef FROM pg_proc
    WHERE oid = to_regprocedure('public.enforce_order_immutability()')
  ) THEN
    RAISE EXCEPTION 'Postcondition failed: enforce_order_immutability is not SECURITY DEFINER';
  END IF;
END;
$$;

COMMIT;
