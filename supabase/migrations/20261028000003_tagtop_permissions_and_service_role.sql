-- TAGTOP Supabase PostgreSQL Migration: 20261028000003_tagtop_permissions_and_service_role.sql
-- Description: Grants, Permissions, and Service Role Compatibility for TAGTOP NFC Platform.
-- Hardened for Migration 3:
-- 1. Resolves "permission denied for table users" by granting explicit table privileges to service_role and authenticated.
-- 2. Updates Column-Level Immutability Triggers to recognize service_role and founder_admin, allowing backend administration while strictly blocking customer tampering.
-- 3. Grants least-privilege SQL permissions to anon and authenticated across all existing TAGTOP tables.
-- 4. Enables guest checkout INSERT ... RETURNING while maintaining strict customer isolation (unauthenticated SELECT cannot view other orders).
-- 5. Enables guest lead submission INSERT ... RETURNING while keeping leads private to profile owners.
-- 6. Preserves server-side pricing, guest checkout protections, and subscription rules.

-- =============================================================================
-- 1. ADMINISTRATIVE CONTEXT & HELPER FUNCTIONS
-- =============================================================================

-- Determine if current execution context is founder admin or service role
CREATE OR REPLACE FUNCTION public.is_admin_or_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  -- 1. Check if caller is authenticated founder admin
  IF public.is_founder_admin() THEN
    RETURN TRUE;
  END IF;

  -- 2. Check if caller is service_role via Supabase auth context
  IF auth.role() = 'service_role' THEN
    RETURN TRUE;
  END IF;

  -- 3. Check JWT claims if present
  IF coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role' THEN
    RETURN TRUE;
  END IF;

  -- 4. Check PostgreSQL session user / current user for administrative contexts
  IF current_user IN ('postgres', 'service_role', 'supabase_admin') THEN
    RETURN TRUE;
  END IF;

  IF session_user IN ('postgres', 'service_role', 'supabase_admin') THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.is_admin_or_service_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_or_service_role() TO anon, authenticated, service_role;

-- Helper to safely distinguish INSERT ... RETURNING statements from standalone SELECT queries
CREATE OR REPLACE FUNCTION public.is_current_insert_returning()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_query() ~* '^\s*(with\s+.*\s+)?insert\s+into';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.is_current_insert_returning() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_current_insert_returning() TO anon, authenticated, service_role;

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
-- 3. ADMINISTRATIVE RPCS (SERVICE ROLE COMPATIBLE)
-- =============================================================================

-- 3.1: Approve Bank Transfer
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

-- 3.2: Reject Bank Transfer
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

-- 3.3: Update Order Status
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

-- =============================================================================
-- 4. RLS POLICIES FOR ORDERS & LEADS (GUEST RETURNING & CUSTOMER ISOLATION)
-- =============================================================================

-- Ensure orders SELECT allows customer to view their orders, admin to view all,
-- and anonymous callers to receive the row on INSERT ... RETURNING without exposing existing orders.
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders"
  ON public.orders
  FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND customer_id = auth.uid())
    OR (auth.uid() IS NOT NULL AND customer_email = (SELECT email FROM public.users WHERE id = auth.uid()))
    OR public.is_admin_or_service_role()
    OR (auth.role() = 'anon' AND public.is_current_insert_returning())
  );

-- Ensure leads SELECT allows profile owners and admin to view leads,
-- and anonymous callers to receive the inserted record on INSERT ... RETURNING.
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
    OR (auth.role() = 'anon' AND public.is_current_insert_returning())
  );

-- =============================================================================
-- 5. LEAST-PRIVILEGE SQL GRANTS FOR ALL ROLES
-- =============================================================================

-- Ensure schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 5.1: public.users
-- service_role: full control for administrative provisioning and elevation
-- authenticated: select and update own record (enforced by RLS & immutability trigger)
-- anon: NO access (revoked)
-- -----------------------------------------------------------------------------
REVOKE ALL ON TABLE public.users FROM PUBLIC, anon;
GRANT ALL ON TABLE public.users TO service_role;
GRANT SELECT, UPDATE ON TABLE public.users TO authenticated;

-- -----------------------------------------------------------------------------
-- 5.2: public.business_profiles
-- service_role: full control
-- authenticated: select, insert, update, delete own profiles (enforced by RLS)
-- anon: select only (RLS enforces 0 rows on raw table; public view/RPC handles public access)
-- -----------------------------------------------------------------------------
GRANT ALL ON TABLE public.business_profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.business_profiles TO authenticated;
GRANT SELECT ON TABLE public.business_profiles TO anon;

-- -----------------------------------------------------------------------------
-- 5.3: public.public_business_profiles (View)
-- Safe projection view available to all clients
-- -----------------------------------------------------------------------------
GRANT ALL ON TABLE public.public_business_profiles TO service_role;
GRANT SELECT ON TABLE public.public_business_profiles TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 5.4: public.orders
-- service_role: full control
-- authenticated: select own orders, insert new orders, update proof approval
-- anon: insert orders (guest checkout) and select (strictly constrained by RLS)
-- -----------------------------------------------------------------------------
GRANT ALL ON TABLE public.orders TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.orders TO authenticated;
GRANT SELECT, INSERT ON TABLE public.orders TO anon;

-- -----------------------------------------------------------------------------
-- 5.5: public.nfc_cards
-- service_role: full control
-- authenticated: select own nfc_cards (enforced by RLS)
-- anon: select only (RLS returns 0 rows; public uses resolve_nfc_card RPC)
-- -----------------------------------------------------------------------------
GRANT ALL ON TABLE public.nfc_cards TO service_role;
GRANT SELECT ON TABLE public.nfc_cards TO authenticated;
GRANT SELECT ON TABLE public.nfc_cards TO anon;

-- -----------------------------------------------------------------------------
-- 5.6: public.leads
-- service_role: full control
-- authenticated: select and delete own leads, submit inquiries
-- anon: insert inquiries and select (strictly constrained by RLS)
-- -----------------------------------------------------------------------------
GRANT ALL ON TABLE public.leads TO service_role;
GRANT SELECT, INSERT, DELETE ON TABLE public.leads TO authenticated;
GRANT SELECT, INSERT ON TABLE public.leads TO anon;

-- -----------------------------------------------------------------------------
-- 5.7: public.bank_transfers
-- service_role: full control
-- authenticated: select own transfers, submit renewal transfers (enforced by RLS)
-- anon: select only (RLS returns 0 rows)
-- -----------------------------------------------------------------------------
GRANT ALL ON TABLE public.bank_transfers TO service_role;
GRANT SELECT, INSERT ON TABLE public.bank_transfers TO authenticated;
GRANT SELECT ON TABLE public.bank_transfers TO anon;

-- -----------------------------------------------------------------------------
-- 5.8: public.analytics_events & public.profile_analytics_summary
-- service_role: full control
-- authenticated: insert events, select own profile summary
-- anon: insert events, select summary (RLS returns 0 rows)
-- -----------------------------------------------------------------------------
GRANT ALL ON TABLE public.analytics_events TO service_role;
GRANT INSERT ON TABLE public.analytics_events TO authenticated, anon;

GRANT ALL ON TABLE public.profile_analytics_summary TO service_role;
GRANT SELECT ON TABLE public.profile_analytics_summary TO authenticated;
GRANT SELECT ON TABLE public.profile_analytics_summary TO anon;

-- -----------------------------------------------------------------------------
-- 5.9: public.system_settings
-- service_role: full control
-- authenticated: select (read prices), update (restricted to founder admin via RLS)
-- anon: select only (read launch pricing)
-- -----------------------------------------------------------------------------
GRANT ALL ON TABLE public.system_settings TO service_role;
GRANT SELECT, UPDATE ON TABLE public.system_settings TO authenticated;
GRANT SELECT ON TABLE public.system_settings TO anon;

-- =============================================================================
-- 6. SEQUENCES & DEFAULT PRIVILEGES
-- =============================================================================

-- Sequences in public schema
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Routines in public schema
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Future default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;
