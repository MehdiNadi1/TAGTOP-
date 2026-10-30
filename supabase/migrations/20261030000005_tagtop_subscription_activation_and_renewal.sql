-- Migration: 20261030000005_tagtop_subscription_activation_and_renewal.sql
-- Description: Milestone 3B - Subscription Activation, Delivery Idempotency & Renewal Accounting
--
-- Key Capabilities & Protections:
-- 1. Schema Extensions:
--    - business_profiles: initial_subscription_activated, activated_at, initial_order_id
--    - orders: delivery_benefits_applied, delivered_at
-- 2. Customer Immutability Hardening (Task 1):
--    - Strict restoration of all baseline Migration 000003 security guarantees
--    - Authoritative server pricing, customer_id assignment, anonymous checkout blocking
--    - Reset proof_approved, proof_rejection_reason, proof_url, card_uid, is_demo on insert
--    - Customer immutability on update for all pricing, configuration, fulfillment, and profile_id
-- 3. Explicit Permitted-State Delivery Transitions (Task 2):
--    - Terminal state protection: Delivered orders cannot be transitioned to any other status
--    - No delivery directly from 'received' or intermediate review/production states
--    - Permitted delivery sources: 'shipped' (standard logistics) or 'linked' (in-person handoff)
--    - Prerequisite fulfillment check: Branded cards strictly require customer proof approval
--    - Full idempotency: Duplicate delivery calls return success without duplicate cards or days
--    - Support orders with NULL profile_id cleanly without errors or phantom activation
-- 4. Safe Renewal Accounting & Legacy Profile Reconciliation (Task 3):
--    - Genuine unactivated profiles start 180 included days upon delivery + genuine pre-delivery renewals
--    - Legacy profiles and existing active/suspended profiles are recognized without assumption
--    - Historical approved bank transfers on legacy profiles are never double-counted into new entitlements
--    - Ambiguous transfer amounts fail safely for founder review
-- 5. Multi-Resource Concurrency Hardening:
--    - Row-level exclusive locks with 5000ms timeout on both orders and business_profiles

-- =============================================================================
-- 1. SCHEMA EXTENSIONS
-- =============================================================================

-- 1.1 Business Profiles Subscription Activation Columns
ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS initial_subscription_activated BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS initial_order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_business_profiles_initial_order_id
  ON public.business_profiles(initial_order_id);

CREATE INDEX IF NOT EXISTS idx_business_profiles_initial_activated
  ON public.business_profiles(initial_subscription_activated);

-- 1.2 Orders Delivery Fulfillment Tracking Columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_benefits_applied BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_delivery_benefits
  ON public.orders(delivery_benefits_applied);


-- =============================================================================
-- 2. BUSINESS PROFILES IMMUTABILITY TRIGGER
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
-- 3. ORDERS IMMUTABILITY & FULFILLMENT TRIGGER (TASK 1: COMPLETE BASELINE RESTORATION)
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
        -- SECURITY FIX: Anonymous guests CANNOT associate orders with existing business profiles.
        -- Profile linking requires authenticated ownership.
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
-- 4. HARDENED founder_update_order_status (TASK 2 & TASK 3)
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

  -- 4. Terminal State & Permitted-State Transition Protection (Task 2)
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
    -- 6.1 Account for orders with NULL profile_id (Task 2)
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

      -- B. Subscription Activation & Renewal Accounting (Task 3)
      -- Determine if the profile was ALREADY previously activated or is a legacy profile
      -- Check for prior activation evidence:
      -- 1) Flag already TRUE
      -- 2) Access state is active, renewal_due, grace_period, expired_suspended, restored
      -- 3) Profile already has linked cards (linked_card_count > 0 before this order's benefits)
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
        -- Do NOT grant a new 180-day subscription.
        -- Do NOT sum historical approved transfers into an additional entitlement.
        -- Ensure initial_subscription_activated is set to TRUE to reconcile state without mutating expiration.
        IF NOT v_profile.initial_subscription_activated THEN
          UPDATE public.business_profiles
          SET
            initial_subscription_activated = TRUE,
            activated_at = COALESCE(activated_at, timezone('utc'::text, now())),
            initial_order_id = COALESCE(initial_order_id, p_order_id),
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
-- 5. HARDENED founder_approve_bank_transfer (TASK 3)
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
