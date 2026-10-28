-- TAGTOP Supabase PostgreSQL RLS Policies: 20261028000001_tagtop_rls_policies.sql
-- Description: Comprehensive Row Level Security (RLS) policies protecting tenant data isolation and administrative functions.

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- =============================================================================
-- 1. USERS TABLE RLS
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Customers can view their own record
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id OR public.is_founder_admin());

-- Customers can update their own personal info (role changes forbidden by policy check)
CREATE POLICY "Users can update their own personal profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id OR public.is_founder_admin())
  WITH CHECK (
    (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()))
    OR public.is_founder_admin()
  );

-- Only founder admin can delete or manage all user accounts
CREATE POLICY "Founder admin full access on users"
  ON public.users
  FOR ALL
  USING (public.is_founder_admin());

-- =============================================================================
-- 2. BUSINESS PROFILES TABLE RLS
-- =============================================================================
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Public can view active, renewal_due, grace_period, and expired_suspended profiles (suspended show discreet notice)
CREATE POLICY "Public can view active and public profiles"
  ON public.business_profiles
  FOR SELECT
  USING (
    access_state IN ('active', 'renewal_due', 'grace_period', 'expired_suspended')
    OR owner_id = auth.uid()
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

-- Profile owner can update their own profile (access_state changes restricted to admin/rpc)
CREATE POLICY "Owners can update their profiles"
  ON public.business_profiles
  FOR UPDATE
  USING (owner_id = auth.uid() OR public.is_founder_admin())
  WITH CHECK (
    (owner_id = auth.uid() AND access_state = (SELECT access_state FROM public.business_profiles WHERE id = id))
    OR public.is_founder_admin()
  );

-- Profile owner can delete their own profile
CREATE POLICY "Owners can delete their profiles"
  ON public.business_profiles
  FOR DELETE
  USING (owner_id = auth.uid() OR public.is_founder_admin());

-- =============================================================================
-- 3. ORDERS TABLE RLS
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
    OR auth.role() = 'anon' -- Allows unauthenticated guest checkout with email
    OR public.is_founder_admin()
  );

-- Customers can only approve artwork proofs or submit change requests
CREATE POLICY "Customers can update artwork proof approval"
  ON public.orders
  FOR UPDATE
  USING (customer_id = auth.uid() OR public.is_founder_admin())
  WITH CHECK (
    -- Normal customers cannot modify prices or order statuses directly
    (customer_id = auth.uid() AND price_mad = (SELECT price_mad FROM public.orders WHERE id = id))
    OR public.is_founder_admin()
  );

-- Founder admin full access on orders
CREATE POLICY "Founder admin full access on orders"
  ON public.orders
  FOR ALL
  USING (public.is_founder_admin());

-- =============================================================================
-- 4. NFC CARDS TABLE RLS
-- =============================================================================
ALTER TABLE public.nfc_cards ENABLE ROW LEVEL SECURITY;

-- Anyone can resolve active NFC cards by UID for physical taps
CREATE POLICY "Public can resolve active NFC cards by UID"
  ON public.nfc_cards
  FOR SELECT
  USING (
    status = 'active'
    OR customer_id = auth.uid()
    OR public.is_founder_admin()
  );

-- Only founder admin can provision, link, or edit NFC cards
CREATE POLICY "Founder admin manage NFC cards"
  ON public.nfc_cards
  FOR ALL
  USING (public.is_founder_admin());

-- =============================================================================
-- 5. LEADS TABLE RLS
-- =============================================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a lead on an active public profile with consent
CREATE POLICY "Public can submit leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (
    promotional_consent = TRUE
    AND EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = leads.profile_id
        AND bp.access_state IN ('active', 'renewal_due', 'grace_period')
    )
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
-- 6. BANK TRANSFERS TABLE RLS
-- =============================================================================
ALTER TABLE public.bank_transfers ENABLE ROW LEVEL SECURITY;

-- Customers can view transfers they submitted
CREATE POLICY "Customers view own transfers"
  ON public.bank_transfers
  FOR SELECT
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = bank_transfers.profile_id
        AND bp.owner_id = auth.uid()
    )
    OR public.is_founder_admin()
  );

-- Customers can submit renewal transfers for their own profiles
CREATE POLICY "Customers submit renewal transfers"
  ON public.bank_transfers
  FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = bank_transfers.profile_id
        AND bp.owner_id = auth.uid()
    )
    OR public.is_founder_admin()
  );

-- Only founder admin can update transfer verification status
CREATE POLICY "Founder admin manage bank transfers"
  ON public.bank_transfers
  FOR UPDATE
  USING (public.is_founder_admin());

-- =============================================================================
-- 7. ANALYTICS TABLE RLS
-- =============================================================================
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_analytics_summary ENABLE ROW LEVEL SECURITY;

-- Anyone can log an interaction event on a public profile
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
