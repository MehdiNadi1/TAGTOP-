-- Migration: 20261030000005_tagtop_subscription_activation_and_renewal.sql
-- Description: Milestone 3B - Subscription Activation, Delivery Idempotency & Renewal Accounting
-- Release Gate: Atomic Transaction with Strict Precondition/Postcondition Assertions & Conservative Legacy Reconciliation
--
-- Key Capabilities & Protections:
-- 1. Single Atomic Transaction:
--    - Strict precondition assertions verifying Migration 000004 baseline, tables, enums, triggers, and state
--    - Migration operations wrapped in BEGIN ... COMMIT with zero partial schema changes on failure
--    - Strict postcondition assertions verifying tracking columns, immutability, signatures, and permissions
-- 2. Schema Extensions:
--    - business_profiles: initial_subscription_activated, activated_at, initial_order_id
--    - orders: delivery_benefits_applied, delivered_at
-- 3. Customer Immutability Hardening (Task 1):
--    - Strict restoration of all baseline Migration 000003 security guarantees
--    - Authoritative server pricing, customer_id assignment, anonymous checkout blocking
--    - Reset proof_approved, proof_rejection_reason, proof_url, card_uid, is_demo on insert
--    - Customer immutability on update for all pricing, configuration, fulfillment, and profile_id
-- 4. Explicit Permitted-State Delivery Transitions (Task 2):
--    - Terminal state protection: Delivered orders cannot be transitioned to any other status
--    - No delivery directly from 'received' or intermediate review/production states
--    - Permitted delivery sources: 'shipped' (standard logistics) or 'linked' (in-person handoff)
--    - Prerequisite fulfillment check: Branded cards strictly require customer proof approval
--    - Full idempotency: Duplicate delivery calls return success without duplicate cards or days
--    - Support orders with NULL profile_id cleanly without errors or phantom activation
-- 5. Safe Renewal Accounting & Conservative Legacy Profile Reconciliation (Task 3):
--    - Genuine unactivated profiles start 180 included days upon delivery + genuine pre-delivery renewals
--    - Legacy profiles and existing active/suspended profiles are recognized without assumption
--    - Ambiguous legacy profiles DO NOT receive fabricated activated_at or initial_order_id values
--    - Expiration dates and paid entitlements are NEVER altered during legacy reconciliation
--    - Dedicated founder procedures for reviewing and classifying historical profiles
-- 6. Multi-Resource Concurrency Hardening:
--    - Row-level exclusive locks with 5000ms timeout on both orders and business_profiles

BEGIN;

-- =============================================================================
-- 1. PRECONDITION ASSERTIONS
-- =============================================================================
DO $$
DECLARE
  v_missing TEXT := '';
  v_bt_default TEXT;
  v_col_count INTEGER := 0;
BEGIN
  -- 1.1 Verify Migration 000004 functions and expected behavior are present
  IF to_regprocedure('public.founder_approve_bank_transfer(text, text)') IS NULL THEN
    v_missing := v_missing || 'public.founder_approve_bank_transfer(text, text); ';
  END IF;
  IF to_regprocedure('public.founder_reject_bank_transfer(text, text)') IS NULL THEN
    v_missing := v_missing || 'public.founder_reject_bank_transfer(text, text); ';
  END IF;

  -- Verify Migration 000004 bank_transfers.id hardened UUID default
  SELECT column_default INTO v_bt_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'bank_transfers' AND column_name = 'id';

  IF v_bt_default IS NULL OR v_bt_default NOT ILIKE '%gen_random_uuid%' THEN
    v_missing := v_missing || 'bank_transfers.id default must use gen_random_uuid() (Migration 000004 baseline); ';
  END IF;

  -- 1.2 Verify required tables, enums, triggers, and helper functions exist
  IF to_regclass('public.business_profiles') IS NULL THEN
    v_missing := v_missing || 'table public.business_profiles; ';
  END IF;
  IF to_regclass('public.orders') IS NULL THEN
    v_missing := v_missing || 'table public.orders; ';
  END IF;
  IF to_regclass('public.bank_transfers') IS NULL THEN
    v_missing := v_missing || 'table public.bank_transfers; ';
  END IF;
  IF to_regclass('public.system_settings') IS NULL THEN
    v_missing := v_missing || 'table public.system_settings; ';
  END IF;

  IF to_regtype('public.tagtop_order_status') IS NULL THEN
    v_missing := v_missing || 'enum tagtop_order_status; ';
  END IF;
  IF to_regtype('public.tagtop_payment_status') IS NULL THEN
    v_missing := v_missing || 'enum tagtop_payment_status; ';
  END IF;
  IF to_regtype('public.tagtop_profile_access_state') IS NULL THEN
    v_missing := v_missing || 'enum tagtop_profile_access_state; ';
  END IF;

  IF to_regprocedure('public.is_admin_or_service_role()') IS NULL THEN
    v_missing := v_missing || 'public.is_admin_or_service_role(); ';
  END IF;
  IF to_regprocedure('public.enforce_business_profile_immutability()') IS NULL THEN
    v_missing := v_missing || 'public.enforce_business_profile_immutability(); ';
  END IF;
  IF to_regprocedure('public.enforce_order_immutability()') IS NULL THEN
    v_missing := v_missing || 'public.enforce_order_immutability(); ';
  END IF;
  IF to_regprocedure('public.founder_update_order_status(text, tagtop_order_status, tagtop_payment_status)') IS NULL THEN
    v_missing := v_missing || 'public.founder_update_order_status(text, tagtop_order_status, tagtop_payment_status); ';
  END IF;

  -- 1.3 Verify Migration 000005 is not already applied or partially applied
  SELECT COUNT(*) INTO v_col_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND (
      (table_name = 'business_profiles' AND column_name IN ('initial_subscription_activated', 'activated_at', 'initial_order_id'))
      OR
      (table_name = 'orders' AND column_name IN ('delivery_benefits_applied', 'delivered_at'))
    );

  -- If migration 000005 reconcile procedure already exists AND all columns exist, it is fully applied
  IF to_regprocedure('public.founder_reconcile_legacy_profile(text, text, timestamptz, text)') IS NOT NULL
     AND v_col_count = 5 THEN
    v_missing := v_missing || 'Migration 000005 has already been fully applied; ';
  END IF;

  -- If some but not all columns exist, schema is in an inconsistent partial state
  IF v_col_count > 0 AND v_col_count < 5 THEN
    v_missing := v_missing || 'Migration 000005 is partially applied (' || v_col_count || ' of 5 tracking columns exist); ';
  END IF;

  -- 1.4 Existing function signatures and permissions match expectations
  IF NOT (
    SELECT prosecdef FROM pg_proc
    WHERE oid = to_regprocedure('public.founder_approve_bank_transfer(text, text)')
  ) THEN
    v_missing := v_missing || 'founder_approve_bank_transfer must be SECURITY DEFINER; ';
  END IF;
  IF NOT (
    SELECT prosecdef FROM pg_proc
    WHERE oid = to_regprocedure('public.founder_reject_bank_transfer(text, text)')
  ) THEN
    v_missing := v_missing || 'founder_reject_bank_transfer must be SECURITY DEFINER; ';
  END IF;

  IF length(v_missing) > 0 THEN
    RAISE EXCEPTION 'Migration 000005 precondition assertion failed: %', v_missing;
  END IF;
END;
$$;


-- =============================================================================
-- 2. SCHEMA EXTENSIONS
-- =============================================================================

-- 2.1 Business Profiles Subscription Activation Columns
ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS initial_subscription_activated BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS initial_order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_business_profiles_initial_order_id
  ON public.business_profiles(initial_order_id);

CREATE INDEX IF NOT EXISTS idx_business_profiles_initial_activated
  ON public.business_profiles(initial_subscription_activated);

-- 2.2 Orders Delivery Fulfillment Tracking Columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_benefits_applied BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_delivery_benefits
  ON public.orders(delivery_benefits_applied);


-- =============================================================================
-- 3. BUSINESS PROFILES IMMUTABILITY TRIGGER
-- =============================================================================

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
      NEW.initial_subscription_activated := FALSE;
      NEW.activated_at := NULL;
      NEW.initial_order_id := NULL;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NOT public.is_admin_or_service_role() THEN
      -- Customer cannot transfer ownership
      IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
        RAISE EXCEPTION 'Security violation: Profile ownership cannot be transferred directly';
      END IF;
      -- Customer cannot manipulate subscription status or expiry dates
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
      -- Protect subscription activation fields against customer manipulation
      IF NEW.initial_subscription_activated IS DISTINCT FROM OLD.initial_subscription_activated THEN
        RAISE EXCEPTION 'Security violation: Subscription activation flag is immutable by customer';
      END IF;
      IF NEW.activated_at IS DISTINCT FROM OLD.activated_at THEN
        RAISE EXCEPTION 'Security violation: Activation timestamp is immutable by customer';
      END IF;
      IF NEW.initial_order_id IS DISTINCT FROM OLD.initial_order_id THEN
        RAISE EXCEPTION 'Security violation: Initial order association is immutable by customer';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_enforce_business_profile_immutability ON public.business_profiles;
CREATE TRIGGER trg_enforce_business_profile_immutability
  BEFORE INSERT OR UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_business_profile_immutability();


-- =============================================================================
-- 4. ORDERS IMMUTABILITY & FULFILLMENT TRIGGER (COMPLETE BASELINE RESTORATION)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.enforce_order_immutability()
RETURNS TRIGGER AS $$
DECLARE
  v_settings RECORD;
  v_unit_card_price NUMERIC(10, 2);
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT public.is_admin_or_service_role() THEN
      -- 1. Authoritative Pricing Lookup from public.system_settings
      SELECT
        starter_branded_price_mad,
        starter_unbranded_price_mad,
        wooden_stand_enabled,
        wooden_stand_price_mad
      INTO v_settings
      FROM public.system_settings
      WHERE id = 1;

      -- 2. Validate package tier (starter only for direct web checkout; pro/enterprise strictly require quote)
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

      -- 3. Quantity check
      IF NEW.card_quantity IS NULL OR NEW.card_quantity < 1 THEN
        NEW.card_quantity := 1;
      END IF;

      -- 4. Stand accessory validation
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

      -- 5. SERVER-CALCULATED PRICE OVERRIDE (Never trust client-supplied price_mad)
      NEW.price_mad := (v_unit_card_price * NEW.card_quantity) + NEW.wooden_stand_price_mad;

      -- 6. Enforce safe initial fulfillment & payment states (Baseline Security Guarantee)
      NEW.order_status := 'received';
      NEW.payment_status := 'cod_pending';
      NEW.proof_approved := FALSE;
      NEW.proof_rejection_reason := NULL;
      NEW.proof_url := NULL;
      NEW.card_uid := NULL;
      NEW.is_demo := FALSE;

      -- 7. Identity & Profile Ownership Audit (Baseline Security Guarantee)
      IF auth.uid() IS NOT NULL THEN
        NEW.customer_id := auth.uid();
        -- If an authenticated user links a profile, verify they own it
        IF NEW.profile_id IS NOT NULL THEN
          IF NOT EXISTS (
            SELECT 1 FROM public.business_profiles
            WHERE id = NEW.profile_id AND owner_id = auth.uid()
          ) THEN
            RAISE EXCEPTION 'Security violation: Cannot link order to a profile you do not own';
          END IF;
        END IF;
      ELSE
        -- Guest checkout: customer_id is NULL.
        -- Anonymous guests CANNOT associate orders with existing business profiles.
        NEW.customer_id := NULL;
        IF NEW.profile_id IS NOT NULL THEN
          RAISE EXCEPTION 'Security violation: Anonymous orders cannot be linked to existing business profiles. Please authenticate first.';
        END IF;
      END IF;

      -- 8. Initialize fulfillment tracking flags
      NEW.delivery_benefits_applied := FALSE;
      NEW.delivered_at := NULL;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NOT public.is_admin_or_service_role() THEN
      -- Customer cannot modify prices, accessories, quantities, profile association, or fulfillment states
      IF NEW.customer_id IS DISTINCT FROM OLD.customer_id OR
         NEW.profile_id IS DISTINCT FROM OLD.profile_id OR
         NEW.price_mad IS DISTINCT FROM OLD.price_mad OR
         NEW.wooden_stand_price_mad IS DISTINCT FROM OLD.wooden_stand_price_mad OR
         NEW.card_quantity IS DISTINCT FROM OLD.card_quantity OR
         NEW.package_tier IS DISTINCT FROM OLD.package_tier OR
         NEW.card_color IS DISTINCT FROM OLD.card_color OR
         NEW.card_branding IS DISTINCT FROM OLD.card_branding OR
         NEW.wooden_stand_selected IS DISTINCT FROM OLD.wooden_stand_selected OR
         NEW.payment_status IS DISTINCT FROM OLD.payment_status OR
         NEW.card_uid IS DISTINCT FROM OLD.card_uid OR
         NEW.is_demo IS DISTINCT FROM OLD.is_demo OR
         NEW.delivery_benefits_applied IS DISTINCT FROM OLD.delivery_benefits_applied OR
         NEW.delivered_at IS DISTINCT FROM OLD.delivered_at THEN
        RAISE EXCEPTION 'Security violation: Order pricing, configuration, and fulfillment are immutable';
      END IF;

      -- Customers can only transition order_status between received/artwork_review and customer_approved
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

DROP TRIGGER IF EXISTS trg_enforce_order_immutability ON public.orders;
CREATE TRIGGER trg_enforce_order_immutability
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_order_immutability();


-- =============================================================================
-- 5. HARDENED founder_update_order_status
-- =============================================================================

CREATE OR REPLACE FUNCTION public.founder_update_order_status(
  p_order_id TEXT,
  p_order_status tagtop_order_status,
  p_payment_status tagtop_payment_status DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_profile RECORD;
  v_pre_delivery_renewal_days INTEGER := 0;
  v_target_expiry DATE;
  v_new_expiry DATE;
  v_new_access_state tagtop_profile_access_state;
  v_new_card_count INTEGER;
  v_benefits_applied BOOLEAN := FALSE;
  v_subscription_activated BOOLEAN := FALSE;
  v_invalid_transfer RECORD;
  v_has_delivered_orders BOOLEAN := FALSE;
BEGIN
  -- 1. Authorization: Verified Founder Admin or Service Role only
  IF NOT public.is_admin_or_service_role() THEN
    RAISE EXCEPTION 'Unauthorized: Only founder admin or service role can modify order status';
  END IF;

  -- 2. Concurrency Safety: Limit lock wait time to 5 seconds
  PERFORM set_config('lock_timeout', '5000ms', TRUE);

  -- 3. Lock Order Row
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  -- 4. Terminal State & Permitted-State Transition Protection
  -- 4.1 Delivered is terminal: cannot be transitioned to any other status
  IF v_order.order_status = 'delivered' AND p_order_status != 'delivered' THEN
    RAISE EXCEPTION 'Invalid transition: Delivered order % cannot be transitioned to "%" (delivered is terminal)', p_order_id, p_order_status;
  END IF;

  -- 4.2 Explicit permitted-state transition policy when transitioning TO 'delivered'
  IF p_order_status = 'delivered' AND v_order.order_status != 'delivered' THEN
    -- Prohibit delivery directly from 'received'
    IF v_order.order_status = 'received' THEN
      RAISE EXCEPTION 'Invalid transition: Order % cannot be delivered directly from "received". Must undergo fulfillment.', p_order_id;
    END IF;

    -- Prohibit delivery from artwork_review, customer_approved, or production without shipping/linking
    IF v_order.order_status IN ('artwork_review', 'customer_approved', 'production') THEN
      RAISE EXCEPTION 'Invalid transition: Order % cannot be delivered directly from "%". Fulfillment must reach shipped or linked first.', p_order_id, v_order.order_status;
    END IF;

    -- Permitted source states for delivery are 'shipped' or 'linked'
    IF v_order.order_status NOT IN ('shipped', 'linked') THEN
      RAISE EXCEPTION 'Invalid transition: Order % cannot be delivered from status "%"', p_order_id, v_order.order_status;
    END IF;

    -- Required fulfillment prerequisites:
    -- If card is branded, artwork proof MUST be approved
    IF v_order.card_branding = 'branded' AND NOT v_order.proof_approved THEN
      RAISE EXCEPTION 'Invalid transition: Branded order % cannot be delivered without customer proof approval', p_order_id;
    END IF;
  END IF;

  -- 5. Update Order Record
  UPDATE public.orders
  SET
    order_status = p_order_status,
    payment_status = COALESCE(p_payment_status, payment_status),
    updated_at = timezone('utc'::text, now())
  WHERE id = p_order_id;

  -- 6. Delivery Processing (Triggered only when transitioning to or remaining 'delivered')
  IF p_order_status = 'delivered' THEN
    -- 6.1 Account for orders with NULL profile_id
    IF v_order.profile_id IS NULL THEN
      -- Mark delivery benefits applied on the order itself to ensure duplicate calls remain idempotent
      IF NOT v_order.delivery_benefits_applied THEN
        UPDATE public.orders
        SET
          delivery_benefits_applied = TRUE,
          delivered_at = COALESCE(delivered_at, timezone('utc'::text, now()))
        WHERE id = p_order_id;
        v_benefits_applied := TRUE;
      ELSE
        v_benefits_applied := FALSE;
      END IF;

      RETURN jsonb_build_object(
        'success', TRUE,
        'order_id', p_order_id,
        'order_status', p_order_status,
        'delivery_benefits_applied', v_benefits_applied,
        'initial_subscription_activated', FALSE
      );
    END IF;

    -- 6.2 Order has an associated profile_id: lock profile row
    SELECT * INTO v_profile
    FROM public.business_profiles
    WHERE id = v_order.profile_id
    FOR UPDATE;

    IF FOUND THEN
      -- A. Physical Card Count Idempotency (Per-Order)
      -- Only add cards if delivery benefits have not yet been applied for this specific order
      IF NOT v_order.delivery_benefits_applied THEN
        v_new_card_count := v_profile.linked_card_count + v_order.card_quantity;
        v_benefits_applied := TRUE;

        UPDATE public.orders
        SET
          delivery_benefits_applied = TRUE,
          delivered_at = COALESCE(delivered_at, timezone('utc'::text, now()))
        WHERE id = p_order_id;
      ELSE
        v_new_card_count := v_profile.linked_card_count;
        v_benefits_applied := FALSE;
      END IF;

      -- B. Subscription Activation & Conservative Legacy Profile Handling
      -- Check for prior activation or legacy status:
      -- 1) Flag already TRUE
      -- 2) Access state is active, renewal_due, grace_period, expired_suspended, restored
      -- 3) Profile already has linked cards (linked_card_count > 0 before this order)
      -- 4) Profile already has activated_at set
      -- 5) Profile has another order previously delivered
      SELECT EXISTS (
        SELECT 1 FROM public.orders
        WHERE profile_id = v_profile.id
          AND order_status = 'delivered'
          AND delivery_benefits_applied = TRUE
          AND id != p_order_id
      ) INTO v_has_delivered_orders;

      IF v_profile.initial_subscription_activated OR
         v_profile.access_state NOT IN ('private_preview', 'order_pending') OR
         v_profile.linked_card_count > 0 OR
         v_profile.activated_at IS NOT NULL OR
         v_has_delivered_orders THEN

        -- Profile was ALREADY activated or is a legacy profile!
        -- CRITICAL CONSERVATIVE RULES:
        -- 1. Do NOT grant a new 180-day subscription period.
        -- 2. Do NOT alter existing expiration dates or paid entitlements.
        -- 3. Do NOT automatically assign activated_at or initial_order_id to ambiguous legacy profiles!
        --    Preserve whatever activated_at or initial_order_id already exist (or leave NULL).
        -- 4. Flag initial_subscription_activated = TRUE so it is marked initialized.
        IF NOT v_profile.initial_subscription_activated THEN
          UPDATE public.business_profiles
          SET
            initial_subscription_activated = TRUE,
            linked_card_count = v_new_card_count,
            updated_at = timezone('utc'::text, now())
          WHERE id = v_profile.id;
        ELSIF v_benefits_applied THEN
          -- Only update card count if new physical cards were added
          UPDATE public.business_profiles
          SET
            linked_card_count = v_new_card_count,
            updated_at = timezone('utc'::text, now())
          WHERE id = v_profile.id;
        END IF;

        v_subscription_activated := FALSE;

      ELSE
        -- Profile is GENUINELY NEW (in private_preview/order_pending, 0 linked cards, no previous deliveries)
        -- Validate historical transfers for safety (Fail safely on ambiguous histories):
        SELECT * INTO v_invalid_transfer
        FROM public.bank_transfers
        WHERE profile_id = v_profile.id
          AND status = 'approved'
          AND amount_mad NOT IN (150.00, 200.00)
        LIMIT 1;

        IF FOUND THEN
          RAISE EXCEPTION 'Ambiguous renewal history for profile %: transfer % has non-standard amount % MAD. Founder review required.',
            v_profile.id, v_invalid_transfer.id, v_invalid_transfer.amount_mad;
        END IF;

        -- Sum genuine pre-delivery renewal days
        SELECT COALESCE(SUM(
          CASE
            WHEN amount_mad = 150.00 THEN 180
            WHEN amount_mad = 200.00 THEN 365
            ELSE 0
          END
        ), 0)::INTEGER INTO v_pre_delivery_renewal_days
        FROM public.bank_transfers
        WHERE profile_id = v_profile.id
          AND status = 'approved';

        -- Initial period starts at delivery date (CURRENT_DATE) + 180 included days + genuine pre-delivery renewals
        v_target_expiry := (CURRENT_DATE + INTERVAL '180 days' + (v_pre_delivery_renewal_days || ' days')::INTERVAL)::DATE;
        v_new_expiry := GREATEST(v_profile.expiry_date, v_target_expiry);

        -- Activate profile to 'active'
        v_new_access_state := 'active';

        UPDATE public.business_profiles
        SET
          access_state = v_new_access_state,
          expiry_date = v_new_expiry,
          initial_subscription_activated = TRUE,
          activated_at = timezone('utc'::text, now()),
          initial_order_id = p_order_id,
          linked_card_count = v_new_card_count,
          updated_at = timezone('utc'::text, now())
        WHERE id = v_profile.id;

        v_subscription_activated := TRUE;
      END IF;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'order_id', p_order_id,
    'order_status', p_order_status,
    'delivery_benefits_applied', v_benefits_applied,
    'initial_subscription_activated', v_subscription_activated
  );

EXCEPTION
  WHEN lock_not_available THEN
    RAISE EXCEPTION 'Concurrency conflict: Lock not available for order % or associated profile. Please retry.', p_order_id;
  WHEN deadlock_detected THEN
    RAISE EXCEPTION 'Concurrency conflict: Deadlock detected while updating order %. Transaction aborted.', p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.founder_update_order_status(TEXT, tagtop_order_status, tagtop_payment_status) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.founder_update_order_status(TEXT, tagtop_order_status, tagtop_payment_status) TO authenticated, service_role;


-- =============================================================================
-- 6. HARDENED founder_approve_bank_transfer
-- =============================================================================

CREATE OR REPLACE FUNCTION public.founder_approve_bank_transfer(
  p_transfer_id TEXT,
  p_founder_notes TEXT DEFAULT ''
)
RETURNS JSONB AS $$
DECLARE
  v_transfer RECORD;
  v_profile RECORD;
  v_days_to_add INTEGER;
  v_new_expiry DATE;
  v_new_access_state tagtop_profile_access_state;
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
  SELECT * INTO v_profile
  FROM public.business_profiles
  WHERE id = v_transfer.profile_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile % not found for transfer %', v_transfer.profile_id, p_transfer_id;
  END IF;

  -- 7. Calculate New Expiry Date & Access State based on profile activation state
  -- Check for prior activation or legacy status
  IF v_profile.initial_subscription_activated OR
     v_profile.access_state NOT IN ('private_preview', 'order_pending') OR
     v_profile.linked_card_count > 0 THEN
    -- Post-delivery renewal / Legacy active profile:
    -- extend from whichever is later: current expiry or today
    IF v_profile.expiry_date > CURRENT_DATE THEN
      v_new_expiry := v_profile.expiry_date + v_days_to_add;
    ELSE
      v_new_expiry := CURRENT_DATE + v_days_to_add;
    END IF;
    -- Reactivates expired_suspended or grace_period profiles to active
    v_new_access_state := 'active';
  ELSE
    -- Genuine pre-delivery renewal:
    -- Profile is in private preview waiting for physical card manufacturing/delivery.
    -- Increment provisional expiry without publishing profile before card delivery.
    v_new_expiry := v_profile.expiry_date + v_days_to_add;
    v_new_access_state := v_profile.access_state;
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
    access_state = v_new_access_state,
    expiry_date = v_new_expiry,
    grace_deadline_date = CASE WHEN v_new_access_state = 'active' THEN NULL ELSE grace_deadline_date END,
    updated_at = timezone('utc'::text, now())
  WHERE id = v_transfer.profile_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'transfer_id', p_transfer_id,
    'profile_id', v_transfer.profile_id,
    'days_added', v_days_to_add,
    'new_expiry_date', v_new_expiry,
    'access_state', v_new_access_state
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
-- 7. CONSERVATIVE FOUNDER PROCEDURES FOR HISTORICAL PROFILE RECONCILIATION
-- =============================================================================

-- 7.1 Inspect Unclassified / Ambiguous Historical Profiles
CREATE OR REPLACE FUNCTION public.founder_get_unreconciled_legacy_profiles()
RETURNS TABLE (
  profile_id TEXT,
  handle TEXT,
  display_name TEXT,
  access_state tagtop_profile_access_state,
  expiry_date DATE,
  linked_card_count INTEGER,
  initial_subscription_activated BOOLEAN,
  activated_at TIMESTAMPTZ,
  initial_order_id TEXT
) AS $$
BEGIN
  IF NOT public.is_admin_or_service_role() THEN
    RAISE EXCEPTION 'Unauthorized: Only founder admin or service role can inspect unreconciled profiles';
  END IF;

  RETURN QUERY
  SELECT
    bp.id AS profile_id,
    bp.handle,
    bp.display_name,
    bp.access_state,
    bp.expiry_date,
    bp.linked_card_count,
    bp.initial_subscription_activated,
    bp.activated_at,
    bp.initial_order_id
  FROM public.business_profiles bp
  WHERE
    -- Profiles that have been in service but lack clear activation tracking
    (bp.access_state NOT IN ('private_preview', 'order_pending') OR bp.linked_card_count > 0 OR bp.initial_subscription_activated)
    AND (bp.activated_at IS NULL OR bp.initial_order_id IS NULL)
  ORDER BY bp.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.founder_get_unreconciled_legacy_profiles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.founder_get_unreconciled_legacy_profiles() TO authenticated, service_role;


-- 7.2 Explicit Founder Reconciliation Procedure for Historical Profiles
-- Strictly avoids altering existing expiration dates, access states, or paid entitlements.
CREATE OR REPLACE FUNCTION public.founder_reconcile_legacy_profile(
  p_profile_id TEXT,
  p_initial_order_id TEXT DEFAULT NULL,
  p_activated_at TIMESTAMPTZ DEFAULT NULL,
  p_notes TEXT DEFAULT ''
)
RETURNS JSONB AS $$
DECLARE
  v_profile RECORD;
  v_order RECORD;
BEGIN
  -- 1. Authorization: Verified Founder Admin or Service Role only
  IF NOT public.is_admin_or_service_role() THEN
    RAISE EXCEPTION 'Unauthorized: Only founder admin or service role can reconcile legacy profiles';
  END IF;

  -- 2. Concurrency Safety: Limit lock wait time to 5 seconds
  PERFORM set_config('lock_timeout', '5000ms', TRUE);

  -- 3. Lock Business Profile
  SELECT * INTO v_profile
  FROM public.business_profiles
  WHERE id = p_profile_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile % not found for reconciliation', p_profile_id;
  END IF;

  -- 4. Validate initial order if provided
  IF p_initial_order_id IS NOT NULL THEN
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_initial_order_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Initial order % not found', p_initial_order_id;
    END IF;

    IF v_order.profile_id IS NOT NULL AND v_order.profile_id != p_profile_id THEN
      RAISE EXCEPTION 'Order % belongs to profile %, not %', p_initial_order_id, v_order.profile_id, p_profile_id;
    END IF;
  END IF;

  -- 5. Update Profile Tracking Fields
  -- CONSERVATIVE GUARANTEE: Never alters expiry_date, access_state, or paid bank transfer entitlements.
  UPDATE public.business_profiles
  SET
    initial_subscription_activated = TRUE,
    activated_at = COALESCE(p_activated_at, activated_at),
    initial_order_id = COALESCE(p_initial_order_id, initial_order_id),
    updated_at = timezone('utc'::text, now())
  WHERE id = p_profile_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'profile_id', p_profile_id,
    'initial_subscription_activated', TRUE,
    'activated_at', COALESCE(p_activated_at, v_profile.activated_at),
    'initial_order_id', COALESCE(p_initial_order_id, v_profile.initial_order_id),
    'expiry_date', v_profile.expiry_date,
    'access_state', v_profile.access_state,
    'notes', p_notes
  );

EXCEPTION
  WHEN lock_not_available THEN
    RAISE EXCEPTION 'Concurrency conflict: Lock not available for profile %. Please retry.', p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.founder_reconcile_legacy_profile(TEXT, TEXT, TIMESTAMPTZ, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.founder_reconcile_legacy_profile(TEXT, TEXT, TIMESTAMPTZ, TEXT) TO authenticated, service_role;


-- =============================================================================
-- 8. POSTCONDITION ASSERTIONS
-- =============================================================================
DO $$
DECLARE
  v_missing TEXT := '';
  v_bt_default TEXT;
  v_unauth_count INTEGER;
  v_auth_count INTEGER;
BEGIN
  -- 8.1 Verify new tracking columns exist with correct properties
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'business_profiles' AND column_name = 'initial_subscription_activated' AND data_type = 'boolean'
  ) THEN
    v_missing := v_missing || 'business_profiles.initial_subscription_activated; ';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'business_profiles' AND column_name = 'activated_at'
  ) THEN
    v_missing := v_missing || 'business_profiles.activated_at; ';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'business_profiles' AND column_name = 'initial_order_id'
  ) THEN
    v_missing := v_missing || 'business_profiles.initial_order_id; ';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'delivery_benefits_applied' AND data_type = 'boolean'
  ) THEN
    v_missing := v_missing || 'orders.delivery_benefits_applied; ';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'delivered_at'
  ) THEN
    v_missing := v_missing || 'orders.delivered_at; ';
  END IF;

  -- 8.2 Verify triggers exist and are enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_enforce_business_profile_immutability' AND tgenabled = 'O'
  ) THEN
    v_missing := v_missing || 'trigger trg_enforce_business_profile_immutability; ';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_enforce_order_immutability' AND tgenabled = 'O'
  ) THEN
    v_missing := v_missing || 'trigger trg_enforce_order_immutability; ';
  END IF;

  -- 8.3 Verify function signatures and SECURITY DEFINER configuration
  IF to_regprocedure('public.founder_update_order_status(text, tagtop_order_status, tagtop_payment_status)') IS NULL THEN
    v_missing := v_missing || 'founder_update_order_status; ';
  ELSIF NOT (
    SELECT prosecdef FROM pg_proc
    WHERE oid = to_regprocedure('public.founder_update_order_status(text, tagtop_order_status, tagtop_payment_status)')
  ) THEN
    v_missing := v_missing || 'founder_update_order_status not SECURITY DEFINER; ';
  END IF;

  IF to_regprocedure('public.founder_approve_bank_transfer(text, text)') IS NULL THEN
    v_missing := v_missing || 'founder_approve_bank_transfer; ';
  ELSIF NOT (
    SELECT prosecdef FROM pg_proc
    WHERE oid = to_regprocedure('public.founder_approve_bank_transfer(text, text)')
  ) THEN
    v_missing := v_missing || 'founder_approve_bank_transfer not SECURITY DEFINER; ';
  END IF;

  IF to_regprocedure('public.founder_reconcile_legacy_profile(text, text, timestamptz, text)') IS NULL THEN
    v_missing := v_missing || 'founder_reconcile_legacy_profile; ';
  ELSIF NOT (
    SELECT prosecdef FROM pg_proc
    WHERE oid = to_regprocedure('public.founder_reconcile_legacy_profile(text, text, timestamptz, text)')
  ) THEN
    v_missing := v_missing || 'founder_reconcile_legacy_profile not SECURITY DEFINER; ';
  END IF;

  IF to_regprocedure('public.founder_get_unreconciled_legacy_profiles()') IS NULL THEN
    v_missing := v_missing || 'founder_get_unreconciled_legacy_profiles; ';
  ELSIF NOT (
    SELECT prosecdef FROM pg_proc
    WHERE oid = to_regprocedure('public.founder_get_unreconciled_legacy_profiles()')
  ) THEN
    v_missing := v_missing || 'founder_get_unreconciled_legacy_profiles not SECURITY DEFINER; ';
  END IF;

  -- 8.4 Verify execution privileges (no execute to PUBLIC or anon, granted to authenticated and service_role)
  SELECT COUNT(*) INTO v_unauth_count
  FROM information_schema.routine_privileges
  WHERE routine_schema = 'public'
    AND routine_name IN ('founder_update_order_status', 'founder_approve_bank_transfer', 'founder_reconcile_legacy_profile', 'founder_get_unreconciled_legacy_profiles')
    AND grantee IN ('PUBLIC', 'anon')
    AND privilege_type = 'EXECUTE';

  IF v_unauth_count > 0 THEN
    v_missing := v_missing || 'Unauthorized EXECUTE privilege granted to PUBLIC or anon; ';
  END IF;

  SELECT COUNT(*) INTO v_auth_count
  FROM information_schema.routine_privileges
  WHERE routine_schema = 'public'
    AND routine_name IN ('founder_update_order_status', 'founder_approve_bank_transfer', 'founder_reconcile_legacy_profile', 'founder_get_unreconciled_legacy_profiles')
    AND grantee IN ('authenticated', 'service_role')
    AND privilege_type = 'EXECUTE';

  IF v_auth_count < 8 THEN
    v_missing := v_missing || 'Missing EXECUTE grants for authenticated or service_role (' || v_auth_count || ' < 8); ';
  END IF;

  -- 8.5 Verify preservation of hardened UUID bank-transfer ID default from Migration 000004
  SELECT column_default INTO v_bt_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'bank_transfers' AND column_name = 'id';

  IF v_bt_default IS NULL OR v_bt_default NOT ILIKE '%gen_random_uuid%' THEN
    v_missing := v_missing || 'Preservation failure: bank_transfers.id default must remain gen_random_uuid(); ';
  END IF;

  IF length(v_missing) > 0 THEN
    RAISE EXCEPTION 'Migration 000005 postcondition assertion failed: %', v_missing;
  END IF;
END;
$$;

COMMIT;
