-- TAGTOP Supabase PostgreSQL RLS Policies: 20261028000001_tagtop_rls_policies.sql
-- Description: Comprehensive Row Level Security (RLS) policies and Column-Level Immutability Triggers.
-- Hardened for Phase 2A.1 Final:
-- 1. Raw business_profiles table is restricted to owners and admin (public uses public_business_profiles view or get_public_profile RPC).
-- 2. Server-side price calculation and validation on orders INSERT (never trust client prices).
-- 3. Anonymous orders audited against unauthorized profile linking.
-- 4. Bank transfers require authenticated caller and strict profile ownership.
-- 5. Immutability triggers on users, profiles, orders, and transfers.

-- =============================================================================
-- AUTH HELPER FUNCTIONS
-- =============================================================================

-- Determine if current user is an authenticated founder admin
CREATE OR REPLACE FUNCTION public.is_founder_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role = 'founder_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Automatically provision a public.users row whenever an auth.users record is created
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone, role, preferred_language)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'customer',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'fr')
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- =============================================================================
-- 1. USERS TABLE RLS & IMMUTABILITY TRIGGER
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Customers can view their own record
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id OR public.is_founder_admin());

-- Customers can update their own personal info
CREATE POLICY "Users can update their own personal profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id OR public.is_founder_admin())
  WITH CHECK (auth.uid() = id OR public.is_founder_admin());

-- Only founder admin can delete or insert arbitrary user accounts
CREATE POLICY "Founder admin full access on users"
  ON public.users
  FOR ALL
  USING (public.is_founder_admin());

-- Column-Level Immutability Trigger on public.users
CREATE OR REPLACE FUNCTION public.enforce_user_immutability()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_founder_admin() THEN
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

DROP TRIGGER IF EXISTS trg_enforce_user_immutability ON public.users;
CREATE TRIGGER trg_enforce_user_immutability
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.enforce_user_immutability();

-- =============================================================================
-- 2. BUSINESS PROFILES TABLE RLS & IMMUTABILITY TRIGGER
-- =============================================================================
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- PRIVACY FIX: Raw business_profiles table SELECT is strictly limited to profile owner or founder admin.
-- Anonymous visitors and other customers CANNOT query the raw table directly.
-- Public profile consumption is routed through public.public_business_profiles view or get_public_profile RPC.
DROP POLICY IF EXISTS "Public can view active and public profiles" ON public.business_profiles;
DROP POLICY IF EXISTS "Owners and admins can view profiles" ON public.business_profiles;

CREATE POLICY "Owners and admins can view profiles"
  ON public.business_profiles
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR public.is_founder_admin()
  );

-- Profile owner can create their own profile
CREATE POLICY "Owners can insert their profiles"
  ON public.business_profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    OR public.is_founder_admin()
  );

-- Profile owner can update their own profile
CREATE POLICY "Owners can update their profiles"
  ON public.business_profiles
  FOR UPDATE
  USING (owner_id = auth.uid() OR public.is_founder_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_founder_admin());

-- Profile owner can delete their own profile
CREATE POLICY "Owners can delete their profiles"
  ON public.business_profiles
  FOR DELETE
  USING (owner_id = auth.uid() OR public.is_founder_admin());

-- Column-Level Immutability Trigger on public.business_profiles
CREATE OR REPLACE FUNCTION public.enforce_business_profile_immutability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT public.is_founder_admin() THEN
      NEW.owner_id := auth.uid();
      NEW.access_state := 'private_preview';
      NEW.expiry_date := (CURRENT_DATE + INTERVAL '180 days')::DATE;
      NEW.grace_deadline_date := NULL;
      NEW.linked_card_count := 0;
      NEW.is_demo := FALSE;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NOT public.is_founder_admin() THEN
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

DROP TRIGGER IF EXISTS trg_enforce_business_profile_immutability ON public.business_profiles;
CREATE TRIGGER trg_enforce_business_profile_immutability
  BEFORE INSERT OR UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_business_profile_immutability();

-- Restricted Public View for Public Profiles (Safe projection with suspended data masking)
CREATE OR REPLACE VIEW public.public_business_profiles
WITH (security_invoker = false) AS
SELECT
  id,
  handle,
  display_name,
  job_title,
  company,
  bio,
  city,
  address,
  avatar_url,
  logo_url,
  cover_color,
  template_id,
  access_state,
  expiry_date,
  -- Redact private contacts and documents if profile is expired_suspended
  CASE WHEN access_state = 'expired_suspended' THEN '' ELSE phone END AS phone,
  CASE WHEN access_state = 'expired_suspended' THEN '' ELSE whatsapp END AS whatsapp,
  CASE WHEN access_state = 'expired_suspended' THEN '' ELSE email END AS email,
  CASE WHEN access_state = 'expired_suspended' THEN '' ELSE website END AS website,
  CASE WHEN access_state = 'expired_suspended' THEN '{}'::jsonb ELSE socials END AS socials,
  CASE WHEN access_state = 'expired_suspended' THEN '[]'::jsonb ELSE products END AS products,
  CASE WHEN access_state = 'expired_suspended' THEN '[]'::jsonb ELSE documents END AS documents,
  CASE WHEN access_state = 'expired_suspended' THEN '[]'::jsonb ELSE videos END AS videos,
  CASE WHEN access_state = 'expired_suspended' THEN '[]'::jsonb ELSE lead_fields END AS lead_fields,
  digital_tagtop_branding,
  linked_card_count
FROM public.business_profiles
WHERE access_state IN ('active', 'renewal_due', 'grace_period', 'expired_suspended');

GRANT SELECT ON public.public_business_profiles TO anon, authenticated, service_role;

-- =============================================================================
-- 3. ORDERS TABLE RLS & SERVER-SIDE PRICING VALIDATION TRIGGER
-- =============================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders
CREATE POLICY "Customers can view own orders"
  ON public.orders
  FOR SELECT
  USING (
    customer_id = auth.uid()
    OR customer_email = (SELECT email FROM public.users WHERE id = auth.uid())
    OR public.is_founder_admin()
  );

-- Customers can insert new orders
CREATE POLICY "Customers can insert orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    OR auth.role() = 'anon' -- Guest checkout permitted
    OR public.is_founder_admin()
  );

-- Customers can update proof review status
CREATE POLICY "Customers can update artwork proof approval"
  ON public.orders
  FOR UPDATE
  USING (customer_id = auth.uid() OR public.is_founder_admin())
  WITH CHECK (customer_id = auth.uid() OR public.is_founder_admin());

-- Founder admin full access on orders
CREATE POLICY "Founder admin full access on orders"
  ON public.orders
  FOR ALL
  USING (public.is_founder_admin());

-- Server-Side Pricing, Immutability & Guest Audit Trigger on public.orders
CREATE OR REPLACE FUNCTION public.enforce_order_immutability()
RETURNS TRIGGER AS $$
DECLARE
  v_settings RECORD;
  v_unit_card_price NUMERIC(10, 2);
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT public.is_founder_admin() THEN
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
        IF NEW.profile_id IS NOT NULL THEN
          IF NOT EXISTS (
            SELECT 1 FROM public.business_profiles
            WHERE id = NEW.profile_id AND owner_id = auth.uid()
          ) THEN
            RAISE EXCEPTION 'Security violation: Cannot link order to a profile you do not own';
          END IF;
        END IF;
      ELSE
        -- Guest checkout: customer_id is null; verify profile_id if supplied
        NEW.customer_id := NULL;
        IF NEW.profile_id IS NOT NULL THEN
          IF NOT EXISTS (
            SELECT 1 FROM public.business_profiles
            WHERE id = NEW.profile_id
              AND (access_state = 'private_preview' OR email = NEW.customer_email)
          ) THEN
            RAISE EXCEPTION 'Security violation: Cannot link guest order to an existing verified customer profile';
          END IF;
        END IF;
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NOT public.is_founder_admin() THEN
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

DROP TRIGGER IF EXISTS trg_enforce_order_immutability ON public.orders;
CREATE TRIGGER trg_enforce_order_immutability
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_order_immutability();

-- =============================================================================
-- 4. NFC CARDS TABLE RLS (PRIVACY HARDENING)
-- =============================================================================
ALTER TABLE public.nfc_cards ENABLE ROW LEVEL SECURITY;

-- Normal users can ONLY see cards they own.
-- Public NFC card resolution is performed exclusively through the secure resolve_nfc_card RPC.
CREATE POLICY "Card owners and admin can view NFC cards"
  ON public.nfc_cards
  FOR SELECT
  USING (
    customer_id = auth.uid()
    OR public.is_founder_admin()
  );

-- Only founder admin can provision, link, or edit NFC cards
CREATE POLICY "Founder admin manage NFC cards"
  ON public.nfc_cards
  FOR ALL
  USING (public.is_founder_admin());

-- =============================================================================
-- 5. LEADS TABLE RLS (SEPARATE PROMOTIONAL CONSENT)
-- =============================================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a normal business inquiry regardless of promotional consent.
-- promotional_consent is stored faithfully as TRUE or FALSE without blocking legitimate leads.
CREATE POLICY "Public can submit leads"
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

-- Only the profile owner or founder admin can view leads collected on their profiles
CREATE POLICY "Owners can view leads on their profiles"
  ON public.leads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = leads.profile_id
        AND bp.owner_id = auth.uid()
    )
    OR public.is_founder_admin()
  );

-- Profile owner can delete leads from their dashboard
CREATE POLICY "Owners can delete leads on their profiles"
  ON public.leads
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = leads.profile_id
        AND bp.owner_id = auth.uid()
    )
    OR public.is_founder_admin()
  );

-- =============================================================================
-- 6. BANK TRANSFERS TABLE RLS & STRICT OWNERSHIP TRIGGER
-- =============================================================================
ALTER TABLE public.bank_transfers ENABLE ROW LEVEL SECURITY;

-- Customers can view only their own verified transfers
CREATE POLICY "Customers view own transfers"
  ON public.bank_transfers
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      (
        customer_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM public.business_profiles bp
          WHERE bp.id = bank_transfers.profile_id
            AND bp.owner_id = auth.uid()
        )
      )
      OR public.is_founder_admin()
    )
  );

-- Customers can submit renewal transfers for their own profiles
CREATE POLICY "Customers submit renewal transfers"
  ON public.bank_transfers
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM public.business_profiles bp
        WHERE bp.id = bank_transfers.profile_id
          AND bp.owner_id = auth.uid()
      )
      OR public.is_founder_admin()
    )
  );

-- Only founder admin can update transfer verification status
CREATE POLICY "Founder admin manage bank transfers"
  ON public.bank_transfers
  FOR UPDATE
  USING (public.is_founder_admin());

-- Immutability & Ownership Verification Trigger on public.bank_transfers
CREATE OR REPLACE FUNCTION public.enforce_bank_transfer_immutability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT public.is_founder_admin() THEN
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
    IF NOT public.is_founder_admin() THEN
      RAISE EXCEPTION 'Security violation: Bank transfer status can only be modified by founder admin';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_enforce_bank_transfer_immutability ON public.bank_transfers;
CREATE TRIGGER trg_enforce_bank_transfer_immutability
  BEFORE INSERT OR UPDATE ON public.bank_transfers
  FOR EACH ROW EXECUTE FUNCTION public.enforce_bank_transfer_immutability();

-- =============================================================================
-- 7. ANALYTICS TABLE RLS
-- =============================================================================
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_analytics_summary ENABLE ROW LEVEL SECURITY;

-- Anyone can log an interaction event on an existing profile
CREATE POLICY "Public can log analytics event"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = analytics_events.profile_id
    )
  );

-- Profile owner can read analytics for their profile
CREATE POLICY "Profile owners view analytics summary"
  ON public.profile_analytics_summary
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = profile_analytics_summary.profile_id
        AND bp.owner_id = auth.uid()
    )
    OR public.is_founder_admin()
  );

-- =============================================================================
-- 8. SYSTEM SETTINGS TABLE RLS
-- =============================================================================
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can view system pricing and launch settings
CREATE POLICY "Public can read system settings"
  ON public.system_settings
  FOR SELECT
  USING (TRUE);

-- Only founder admin can update settings
CREATE POLICY "Founder admin update system settings"
  ON public.system_settings
  FOR UPDATE
  USING (public.is_founder_admin());
