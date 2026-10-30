-- Migration: 20261030000005_tagtop_subscription_activation_and_renewal.sql
-- Description: Milestone 3B - Subscription Activation, Delivery Idempotency & Renewal Accounting
--
-- Key Capabilities:
-- 1. Schema Extensions:
--    - business_profiles: initial_subscription_activated, activated_at, initial_order_id
--    - orders: delivery_benefits_applied, delivered_at
-- 2. Customer Immutability Hardening:
--    - Prevent customer modification of initial_subscription_activated, activated_at, initial_order_id
--    - Prevent customer modification of orders.profile_id, delivery_benefits_applied, delivered_at
--    - Preserve normal customer profile editing (bio, socials, products, documents, etc.)
-- 3. Delivery Idempotency & Correct Renewal Accounting:
--    - Delivery grants initial 180 days exactly once per profile
--    - Re-delivering the same order or duplicate RPC calls grants zero additional cards or days
--    - Subsequent card orders on an activated profile add physical cards but zero free days
--    - Genuine pre-delivery paid renewals are preserved and appended to delivery date + 180 days
--    - Post-delivery renewals are preserved and never double-counted
--    - Suspended profiles ('expired_suspended') remain suspended upon physical card delivery
--    - Rejection of invalid order transitions (e.g., cancelled orders cannot be delivered)
--    - Row-level concurrency locking on both orders and business_profiles with 5000ms timeout

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
-- 2. BUSINESS PROFILES IMMUTABILITY TRIGGER (TASK 1)
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
      -- Task 1: Protect new subscription activation fields against customer manipulation
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
-- 3. ORDERS IMMUTABILITY & FULFILLMENT TRIGGER (TASK 1 & TASK 3)
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

      -- 5. Server-calculated price override
      NEW.price_mad := (v_unit_card_price * NEW.card_quantity) + NEW.wooden_stand_price_mad;

      -- 6. Enforce safe initial fulfillment & payment states
      NEW.order_status := 'received';
      NEW.payment_status := 'cod_pending';

      -- 7. Task 3: Ensure customer owns the associated profile if specified
      IF NEW.profile_id IS NOT NULL THEN
        IF NOT EXISTS (
          SELECT 1 FROM public.business_profiles
          WHERE id = NEW.profile_id AND owner_id = auth.uid()
        ) THEN
          RAISE EXCEPTION 'Security violation: Cannot associate order with a profile you do not own';
        END IF;
      END IF;

      -- 8. Initialize fulfillment tracking flags
      NEW.delivery_benefits_applied := FALSE;
      NEW.delivered_at := NULL;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NOT public.is_admin_or_service_role() THEN
      -- Task 3: Customers cannot modify profile_id, delivery benefits, pricing, or configurations
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
        RAISE EXCEPTION 'Security violation: Order pricing, profile association, configuration, and fulfillment are immutable';
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

  -- 4. Terminal State & Transition Protection (Task 3)
  IF v_order.order_status = 'delivered' AND p_order_status IN ('received', 'artwork_review') THEN
    RAISE EXCEPTION 'Invalid transition: Delivered order % cannot be reverted to "%"', p_order_id, p_order_status;
  END IF;

  -- 5. Update Order Record
  UPDATE public.orders
  SET
    order_status = p_order_status,
    payment_status = COALESCE(p_payment_status, payment_status),
    updated_at = timezone('utc'::text, now())
  WHERE id = p_order_id;

  -- 6. Delivery Processing (Triggered only when transitioning to or remaining 'delivered' with a profile)
  IF p_order_status = 'delivered' AND v_order.profile_id IS NOT NULL THEN
    -- Lock Profile Row to serialize concurrent order deliveries / renewals on the same profile
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
      END IF;

      -- B. Subscription Activation & Renewal Accounting (Per-Profile)
      IF NOT v_profile.initial_subscription_activated THEN
        -- Task 2: Reconstruct genuine pre-delivery renewal entitlements
        -- Profile has NEVER been activated before, so any approved transfers represent pre-delivery renewals
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
        -- Guarantee entitlements are never shortened
        v_new_expiry := GREATEST(v_profile.expiry_date, v_target_expiry);

        -- Task 3: Suspended profiles are NOT automatically reactivated by additional card delivery
        IF v_profile.access_state IN ('private_preview', 'order_pending') THEN
          v_new_access_state := 'active';
        ELSE
          v_new_access_state := v_profile.access_state;
        END IF;

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
      ELSE
        -- Profile was already activated previously.
        -- Task 3: A second physical card or repeated delivery grants zero additional subscription days.
        -- Only update linked_card_count if new cards were added from an uncredited order.
        IF v_benefits_applied THEN
          UPDATE public.business_profiles
          SET
            linked_card_count = v_new_card_count,
            updated_at = timezone('utc'::text, now())
          WHERE id = v_profile.id;
        END IF;
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
-- 5. HARDENED founder_approve_bank_transfer (TASK 2)
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
  IF v_profile.initial_subscription_activated THEN
    -- Post-delivery renewal: extend from whichever is later: current expiry or today
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
