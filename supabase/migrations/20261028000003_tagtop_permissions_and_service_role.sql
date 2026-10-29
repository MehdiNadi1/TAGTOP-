-- TAGTOP Supabase PostgreSQL Migration: 20261028000003_tagtop_permissions_and_service_role.sql
-- Description: Hardened Grants, Permissions, Service Role Compatibility, and Narrowly Scoped RPCs for TAGTOP.
--
-- Security Hardening:
-- 1. Corrects `is_admin_or_service_role()`: Removed current_user and session_user entirely to prevent function-owner
--    privilege leakage in SECURITY DEFINER contexts. Authorizes founder admins strictly via verified auth identity (auth.uid())
--    and the protected public.users.role record, and recognizes service-role operations strictly through the trusted
--    execution context (auth.role() = 'service_role').
-- 2. Removed `is_current_insert_returning()` and current_query() inspection.
-- 3. Anonymous visitors are granted NO SELECT or INSERT access to public.orders and public.leads, completely eliminating
--    table enumeration and data scraping vectors.
-- 4. Narrowly scoped SECURITY DEFINER RPC `submit_guest_order()` for guest checkout: validates inputs, enforces server-side
--    authoritative pricing (250 MAD branded / 350 MAD unbranded), rejects Pro/Enterprise direct checkout, blocks guest
--    profile linking, inserts the order with customer_id IS NULL and profile_id IS NULL, and returns only safe confirmation data.
-- 5. Narrowly scoped SECURITY DEFINER RPC `submit_public_lead()` for public leads: validates inputs, verifies active target profile,
--    records promotional consent, inserts the lead, and returns only confirmation data.
-- 6. Updated Column-Level Immutability Triggers to check `is_admin_or_service_role()`.
-- 7. Minimal PostgreSQL grants across all tables.

-- =============================================================================
-- 1. ADMINISTRATIVE CONTEXT & HELPER FUNCTIONS
-- =============================================================================

-- Determine if current execution context is authenticated founder admin
CREATE OR REPLACE FUNCTION public.is_founder_admin()
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role = 'founder_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.is_founder_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_founder_admin() TO anon, authenticated, service_role;

-- Determine if current execution context is founder admin or service role
-- CRITICAL SECURITY FIX: Never uses current_user or session_user (prevents function-owner privilege leakage).
-- Strictly checks:
-- - Verified founder admin identity via auth.uid() and public.users.role = 'founder_admin'
-- - Trusted Supabase execution context via signed JWT role (auth.role() = 'service_role')
CREATE OR REPLACE FUNCTION public.is_admin_or_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  -- 1. Check if caller is authenticated founder admin with verified role record
  IF public.is_founder_admin() THEN
    RETURN TRUE;
  END IF;

  -- 2. Check if caller is executing with verified service_role JWT
  IF auth.role() = 'service_role' THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.is_admin_or_service_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_or_service_role() TO anon, authenticated, service_role;

-- =============================================================================
-- 2. UPDATED COLUMN-LEVEL IMMUTABILITY TRIGGERS (SERVICE ROLE COMPATIBLE)
-- =============================================================================

-- 2.1: Immutability Trigger on public.users
-- Allows service_role and founder admin to elevate roles; blocks customer role/id/email tampering.
CREATE OR REPLACE FUNCTION public.enforce_user_immutability()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin_or_service_role() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Security violation: Role cannot be modified by customer';
    END IF;
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'Security violation: User ID is immutable';
    END IF;
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'Security violation: Email must be updated through authenticated email change flow';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 2.2: Immutability Trigger on public.business_profiles
-- Allows service_role and founder admin to update access_state, expiry, card count; blocks customer tampering.
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
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 2.3: Server-Side Pricing, Immutability & Guest Audit Trigger on public.orders
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

      -- 6. Enforce safe initial fulfillment & payment states
      NEW.order_status := 'received';
      NEW.payment_status := 'cod_pending';
      NEW.proof_approved := FALSE;
      NEW.proof_rejection_reason := NULL;
      NEW.proof_url := NULL;
      NEW.card_uid := NULL;
      NEW.is_demo := FALSE;

      -- 7. Identity & Profile Ownership Audit
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
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NOT public.is_admin_or_service_role() THEN
      -- Customer cannot modify prices, accessories, quantities, or fulfillment states
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

-- 2.4: Immutability & Ownership Verification Trigger on public.bank_transfers
CREATE OR REPLACE FUNCTION public.enforce_bank_transfer_immutability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT public.is_admin_or_service_role() THEN
      IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Anonymous bank transfer renewal submissions are not permitted';
      END IF;

      NEW.customer_id := auth.uid();

      -- Verify profile ownership: caller MUST own the profile being renewed
      IF NOT EXISTS (
        SELECT 1 FROM public.business_profiles
        WHERE id = NEW.profile_id AND owner_id = auth.uid()
      ) THEN
        RAISE EXCEPTION 'Security violation: Cannot submit renewal transfer for a profile you do not own';
      END IF;

      NEW.status := 'pending';
      NEW.founder_notes := NULL;
      NEW.verified_at := NULL;
      NEW.verified_by := NULL;
      NEW.is_demo := FALSE;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NOT public.is_admin_or_service_role() THEN
      RAISE EXCEPTION 'Security violation: Bank transfer status can only be modified by founder admin';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- =============================================================================
-- 3. NARROWLY SCOPED SECURITY DEFINER RPCS (GUEST CHECKOUT & LEADS)
-- =============================================================================

-- 3.1: Guest Checkout Order RPC
-- Validates inputs, calculates server-side price from system_settings, inserts order without profile linking,
-- and returns ONLY safe confirmation data. Does not give anonymous callers SELECT access to other orders.
CREATE OR REPLACE FUNCTION public.submit_guest_order(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_email TEXT,
  p_city TEXT,
  p_address TEXT,
  p_package_tier tagtop_package_tier DEFAULT 'starter',
  p_card_color tagtop_card_color DEFAULT 'black',
  p_card_branding tagtop_card_branding DEFAULT 'branded',
  p_card_quantity INTEGER DEFAULT 1,
  p_wooden_stand_selected BOOLEAN DEFAULT FALSE,
  p_profile_name TEXT DEFAULT '',
  p_logo_file_name TEXT DEFAULT NULL,
  p_logo_preview_url TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_settings RECORD;
  v_unit_card_price NUMERIC(10, 2);
  v_stand_price NUMERIC(10, 2) := 0.00;
  v_final_price_mad NUMERIC(10, 2);
  v_order_id TEXT;
  v_card_qty INTEGER;
BEGIN
  -- 1. Input Validation
  IF p_customer_name IS NULL OR length(trim(p_customer_name)) = 0 THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;
  IF p_customer_phone IS NULL OR length(trim(p_customer_phone)) = 0 THEN
    RAISE EXCEPTION 'Customer phone is required';
  END IF;
  IF p_customer_email IS NULL OR length(trim(p_customer_email)) = 0 THEN
    RAISE EXCEPTION 'Customer email is required';
  END IF;
  IF p_city IS NULL OR length(trim(p_city)) = 0 THEN
    RAISE EXCEPTION 'City is required';
  END IF;
  IF p_address IS NULL OR length(trim(p_address)) = 0 THEN
    RAISE EXCEPTION 'Address is required';
  END IF;

  v_card_qty := COALESCE(p_card_quantity, 1);
  IF v_card_qty < 1 THEN
    v_card_qty := 1;
  END IF;

  -- 2. Authoritative Server-Side Pricing Lookup from public.system_settings
  SELECT
    starter_branded_price_mad,
    starter_unbranded_price_mad,
    wooden_stand_enabled,
    wooden_stand_price_mad
  INTO v_settings
  FROM public.system_settings
  WHERE id = 1;

  -- 3. Validate package tier (starter only for direct web checkout; pro/enterprise strictly require quote)
  IF p_package_tier = 'starter' THEN
    IF p_card_branding = 'branded' THEN
      v_unit_card_price := COALESCE(v_settings.starter_branded_price_mad, 250.00);
    ELSIF p_card_branding = 'unbranded' THEN
      v_unit_card_price := COALESCE(v_settings.starter_unbranded_price_mad, 350.00);
    ELSE
      RAISE EXCEPTION 'Invalid card branding: %', p_card_branding;
    END IF;
  ELSIF p_package_tier IN ('pro', 'enterprise') THEN
    RAISE EXCEPTION 'Unauthorized: Pro and Enterprise packages require quote approval by sales';
  ELSE
    RAISE EXCEPTION 'Invalid package tier: %', p_package_tier;
  END IF;

  -- 4. Stand accessory validation
  IF COALESCE(p_wooden_stand_selected, FALSE) THEN
    IF COALESCE(v_settings.wooden_stand_enabled, FALSE) THEN
      v_stand_price := COALESCE(v_settings.wooden_stand_price_mad, 0.00);
    ELSE
      v_stand_price := 0.00;
    END IF;
  ELSE
    v_stand_price := 0.00;
  END IF;

  -- 5. Calculate Server Price
  v_final_price_mad := (v_unit_card_price * v_card_qty) + v_stand_price;

  -- 6. Insert Order Record
  -- Notice: customer_id is NULL (guest), profile_id is NULL (guest cannot link profile)
  INSERT INTO public.orders (
    customer_id,
    customer_name,
    customer_phone,
    customer_email,
    city,
    address,
    package_tier,
    card_color,
    card_branding,
    card_quantity,
    price_mad,
    wooden_stand_selected,
    wooden_stand_price_mad,
    profile_id,
    profile_name,
    logo_file_name,
    logo_preview_url,
    order_status,
    payment_status,
    proof_approved,
    is_demo
  )
  VALUES (
    NULL,
    trim(p_customer_name),
    trim(p_customer_phone),
    trim(p_customer_email),
    trim(p_city),
    trim(p_address),
    p_package_tier,
    COALESCE(p_card_color, 'black'),
    p_card_branding,
    v_card_qty,
    v_final_price_mad,
    COALESCE(p_wooden_stand_selected, FALSE),
    v_stand_price,
    NULL, -- Guest orders cannot be linked to existing business profiles
    COALESCE(p_profile_name, ''),
    p_logo_file_name,
    p_logo_preview_url,
    'received',
    'cod_pending',
    FALSE,
    FALSE
  )
  RETURNING id INTO v_order_id;

  -- 7. Return safe confirmation data ONLY
  RETURN jsonb_build_object(
    'success', TRUE,
    'order_id', v_order_id,
    'price_mad', v_final_price_mad,
    'card_quantity', v_card_qty,
    'package_tier', p_package_tier,
    'card_branding', p_card_branding,
    'card_color', COALESCE(p_card_color, 'black'),
    'order_status', 'received',
    'payment_status', 'cod_pending',
    'profile_id', NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.submit_guest_order(
  TEXT, TEXT, TEXT, TEXT, TEXT, tagtop_package_tier, tagtop_card_color, tagtop_card_branding, INTEGER, BOOLEAN, TEXT, TEXT, TEXT
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_guest_order(
  TEXT, TEXT, TEXT, TEXT, TEXT, tagtop_package_tier, tagtop_card_color, tagtop_card_branding, INTEGER, BOOLEAN, TEXT, TEXT, TEXT
) TO anon, authenticated, service_role;

-- 3.2: Public Lead Submission RPC
-- Validates inputs, verifies target profile exists and is active, records consent, and returns only confirmation data.
-- Does not give anonymous callers SELECT access to the leads table.
CREATE OR REPLACE FUNCTION public.submit_public_lead(
  p_profile_id TEXT,
  p_name TEXT,
  p_phone TEXT,
  p_email TEXT DEFAULT '',
  p_company TEXT DEFAULT '',
  p_notes TEXT DEFAULT '',
  p_promotional_consent BOOLEAN DEFAULT FALSE
)
RETURNS JSONB AS $$
DECLARE
  v_lead_id UUID;
  v_profile_name TEXT;
BEGIN
  -- 1. Input Validation
  IF p_name IS NULL OR length(trim(p_name)) = 0 THEN
    RAISE EXCEPTION 'Name is required';
  END IF;
  IF p_phone IS NULL OR length(trim(p_phone)) = 0 THEN
    RAISE EXCEPTION 'Phone number is required';
  END IF;
  IF p_profile_id IS NULL OR length(trim(p_profile_id)) = 0 THEN
    RAISE EXCEPTION 'Profile ID is required';
  END IF;

  -- 2. Verify target profile exists and is active / in grace period
  SELECT display_name INTO v_profile_name
  FROM public.business_profiles
  WHERE id = p_profile_id
    AND access_state IN ('active', 'renewal_due', 'grace_period');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target profile % is not accepting inquiries or does not exist', p_profile_id;
  END IF;

  -- 3. Insert Lead Record
  INSERT INTO public.leads (
    profile_id,
    profile_name,
    name,
    phone,
    email,
    company,
    notes,
    promotional_consent,
    submitted_at,
    is_demo
  )
  VALUES (
    p_profile_id,
    COALESCE(v_profile_name, ''),
    trim(p_name),
    trim(p_phone),
    trim(COALESCE(p_email, '')),
    trim(COALESCE(p_company, '')),
    trim(COALESCE(p_notes, '')),
    COALESCE(p_promotional_consent, FALSE),
    timezone('utc'::text, now()),
    FALSE
  )
  RETURNING id INTO v_lead_id;

  -- 4. Return safe confirmation data ONLY
  RETURN jsonb_build_object(
    'success', TRUE,
    'lead_id', v_lead_id,
    'profile_id', p_profile_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.submit_public_lead(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_public_lead(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN
) TO anon, authenticated, service_role;

-- =============================================================================
-- 4. ADMINISTRATIVE RPCS (SERVICE ROLE COMPATIBLE)
-- =============================================================================

-- 4.1: Approve Bank Transfer
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
  IF NOT public.is_admin_or_service_role() THEN
    RAISE EXCEPTION 'Unauthorized: Only founder admin or service role can approve bank transfers';
  END IF;

  SELECT * INTO v_transfer FROM public.bank_transfers WHERE id = p_transfer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transfer % not found', p_transfer_id;
  END IF;

  IF v_transfer.status = 'approved' THEN
    RAISE EXCEPTION 'Transfer % has already been approved', p_transfer_id;
  END IF;

  IF v_transfer.amount_mad = 150.00 THEN
    v_days_to_add := 180;
  ELSIF v_transfer.amount_mad = 200.00 THEN
    v_days_to_add := 365;
  ELSE
    RAISE EXCEPTION 'Unrecognized transfer amount: % MAD', v_transfer.amount_mad;
  END IF;

  UPDATE public.bank_transfers
  SET
    status = 'approved',
    founder_notes = p_founder_notes,
    verified_at = timezone('utc'::text, now()),
    verified_by = auth.uid()
  WHERE id = p_transfer_id;

  SELECT
    CASE
      WHEN expiry_date > CURRENT_DATE THEN (expiry_date + v_days_to_add)
      ELSE (CURRENT_DATE + v_days_to_add)
    END INTO v_new_expiry
  FROM public.business_profiles
  WHERE id = v_transfer.profile_id;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.founder_approve_bank_transfer(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.founder_approve_bank_transfer(TEXT, TEXT) TO authenticated, service_role;

-- 4.2: Reject Bank Transfer
CREATE OR REPLACE FUNCTION public.founder_reject_bank_transfer(
  p_transfer_id TEXT,
  p_reason TEXT
)
RETURNS JSONB AS $$
BEGIN
  IF NOT public.is_admin_or_service_role() THEN
    RAISE EXCEPTION 'Unauthorized: Only founder admin or service role can reject bank transfers';
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.founder_reject_bank_transfer(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.founder_reject_bank_transfer(TEXT, TEXT) TO authenticated, service_role;

-- 4.3: Update Order Status
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.founder_update_order_status(TEXT, tagtop_order_status, tagtop_payment_status) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.founder_update_order_status(TEXT, tagtop_order_status, tagtop_payment_status) TO authenticated, service_role;

-- 4.4: Evaluate Profile Subscriptions
CREATE OR REPLACE FUNCTION public.evaluate_profile_subscriptions()
RETURNS JSONB AS $$
DECLARE
  v_now DATE := CURRENT_DATE;
  v_grace_count INTEGER := 0;
  v_suspended_count INTEGER := 0;
BEGIN
  IF NOT public.is_admin_or_service_role() THEN
    RAISE EXCEPTION 'Unauthorized: Subscription evaluation restricted to service_role or founder admin';
  END IF;

  -- Step 1: Active or renewal_due profiles within their 14-day grace window enter grace_period
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

  -- Step 2: ANY profile past the 14-day grace period immediately transitions to expired_suspended
  WITH transitioned_to_suspended AS (
    UPDATE public.business_profiles
    SET
      access_state = 'expired_suspended',
      updated_at = timezone('utc'::text, now())
    WHERE (
      (access_state = 'grace_period' AND (grace_deadline_date IS NULL OR v_now > grace_deadline_date))
      OR
      (access_state IN ('active', 'renewal_due') AND v_now > (expiry_date + INTERVAL '14 days')::DATE)
    )
    RETURNING id
  )
  SELECT count(*) INTO v_suspended_count FROM transitioned_to_suspended;

  RETURN jsonb_build_object(
    'evaluated_date', v_now,
    'profiles_in_grace', v_grace_count,
    'profiles_suspended', v_suspended_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.evaluate_profile_subscriptions() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.evaluate_profile_subscriptions() TO authenticated, service_role;

-- =============================================================================
-- 5. RLS POLICIES FOR ORDERS & LEADS (PREVENTING ANONYMOUS ENUMERATION)
-- =============================================================================

-- Ensure orders SELECT allows authenticated customers to view own orders, admin to view all.
-- Anonymous callers have ZERO SELECT policy and ZERO table grants (cannot enumerate or view any orders).
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders"
  ON public.orders
  FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND customer_id = auth.uid())
    OR (auth.uid() IS NOT NULL AND customer_email = (SELECT email FROM public.users WHERE id = auth.uid()))
    OR public.is_admin_or_service_role()
  );

-- Direct table INSERT restricted to authenticated customers inserting own orders or admin.
DROP POLICY IF EXISTS "Customers can insert orders" ON public.orders;
CREATE POLICY "Customers can insert orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    OR public.is_admin_or_service_role()
  );

-- Ensure leads SELECT allows only profile owners and admin to view leads.
-- Anonymous callers have ZERO SELECT policy and ZERO table grants (cannot enumerate or view any leads).
DROP POLICY IF EXISTS "Owners can view leads on their profiles" ON public.leads;
CREATE POLICY "Owners can view leads on their profiles"
  ON public.leads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = leads.profile_id
        AND bp.owner_id = auth.uid()
    )
    OR public.is_admin_or_service_role()
  );

DROP POLICY IF EXISTS "Public can submit leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated can submit leads" ON public.leads;
CREATE POLICY "Authenticated can submit leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = leads.profile_id
        AND bp.access_state IN ('active', 'renewal_due', 'grace_period')
    )
    AND length(trim(name)) > 0
    AND length(trim(phone)) > 0
  );

-- =============================================================================
-- 6. LEAST-PRIVILEGE SQL GRANTS FOR ALL ROLES
-- =============================================================================

-- Ensure schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 6.1: public.users
-- service_role: full control for administrative provisioning and elevation
-- authenticated: select and update own record (enforced by RLS & immutability trigger)
-- anon: NO access (revoked)
-- -----------------------------------------------------------------------------
REVOKE ALL ON TABLE public.users FROM PUBLIC, anon;
GRANT ALL ON TABLE public.users TO service_role;
GRANT SELECT, UPDATE ON TABLE public.users TO authenticated;

-- -----------------------------------------------------------------------------
-- 6.2: public.business_profiles
-- service_role: full control
-- authenticated: select, insert, update, delete own profiles (enforced by RLS)
-- anon: NO access to raw table (public uses public_business_profiles view or get_public_profile RPC)
-- -----------------------------------------------------------------------------
REVOKE ALL ON TABLE public.business_profiles FROM PUBLIC, anon;
GRANT ALL ON TABLE public.business_profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.business_profiles TO authenticated;

-- -----------------------------------------------------------------------------
-- 6.3: public.public_business_profiles (View)
-- Safe projection view available to all clients
-- -----------------------------------------------------------------------------
GRANT ALL ON TABLE public.public_business_profiles TO service_role;
GRANT SELECT ON TABLE public.public_business_profiles TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 6.4: public.orders
-- service_role: full control
-- authenticated: select own orders, insert own orders, update proof approval
-- anon: NO access (guest checkout strictly routed through submit_guest_order RPC)
-- -----------------------------------------------------------------------------
REVOKE ALL ON TABLE public.orders FROM PUBLIC, anon;
GRANT ALL ON TABLE public.orders TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.orders TO authenticated;

-- -----------------------------------------------------------------------------
-- 6.5: public.nfc_cards
-- service_role: full control
-- authenticated: select own provisioned cards (enforced by RLS)
-- anon: NO access (public tap resolution strictly routed through resolve_nfc_card RPC)
-- -----------------------------------------------------------------------------
REVOKE ALL ON TABLE public.nfc_cards FROM PUBLIC, anon;
GRANT ALL ON TABLE public.nfc_cards TO service_role;
GRANT SELECT ON TABLE public.nfc_cards TO authenticated;

-- -----------------------------------------------------------------------------
-- 6.6: public.leads
-- service_role: full control
-- authenticated: select and delete own leads, submit inquiries
-- anon: NO access (inquiries strictly routed through submit_public_lead RPC)
-- -----------------------------------------------------------------------------
REVOKE ALL ON TABLE public.leads FROM PUBLIC, anon;
GRANT ALL ON TABLE public.leads TO service_role;
GRANT SELECT, INSERT, DELETE ON TABLE public.leads TO authenticated;

-- -----------------------------------------------------------------------------
-- 6.7: public.bank_transfers
-- service_role: full control
-- authenticated: select own transfers, submit renewal transfers (enforced by RLS)
-- anon: NO access
-- -----------------------------------------------------------------------------
REVOKE ALL ON TABLE public.bank_transfers FROM PUBLIC, anon;
GRANT ALL ON TABLE public.bank_transfers TO service_role;
GRANT SELECT, INSERT ON TABLE public.bank_transfers TO authenticated;

-- -----------------------------------------------------------------------------
-- 6.8: public.analytics_events & public.profile_analytics_summary
-- service_role: full control
-- authenticated: insert events, select own profile summary
-- anon: insert events only (no access to summary)
-- -----------------------------------------------------------------------------
GRANT ALL ON TABLE public.analytics_events TO service_role;
GRANT INSERT ON TABLE public.analytics_events TO authenticated, anon;

REVOKE ALL ON TABLE public.profile_analytics_summary FROM PUBLIC, anon;
GRANT ALL ON TABLE public.profile_analytics_summary TO service_role;
GRANT SELECT ON TABLE public.profile_analytics_summary TO authenticated;

-- -----------------------------------------------------------------------------
-- 6.9: public.system_settings
-- service_role: full control
-- authenticated: select (read prices), update (restricted to founder admin via RLS)
-- anon: select only (read launch pricing)
-- -----------------------------------------------------------------------------
REVOKE ALL ON TABLE public.system_settings FROM PUBLIC;
GRANT ALL ON TABLE public.system_settings TO service_role;
GRANT SELECT, UPDATE ON TABLE public.system_settings TO authenticated;
GRANT SELECT ON TABLE public.system_settings TO anon;

-- =============================================================================
-- 7. SEQUENCES & DEFAULT PRIVILEGES
-- =============================================================================

-- Sequences in public schema
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Routines in public schema
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Future default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;
