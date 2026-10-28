-- TAGTOP Supabase PostgreSQL Stored Procedures & RPCs: 20261028000002_tagtop_rpc_and_admin.sql
-- Description: Server-side secure functions for atomic operations (order delivery, transfer verification, analytics, access state transitions).
-- Hardened for Phase 2A.1 Final:
-- 1. Explicit search_path = public, pg_temp on all SECURITY DEFINER functions.
-- 2. Revoked public execution on administrative and maintenance RPCs.
-- 3. Robust subscription evaluation: ensures profiles past 14-day grace are suspended even if previous cron runs were missed.
-- 4. Secure public profile & NFC resolution with private contact masking.

-- =============================================================================
-- 1. SAFE NFC CARD RESOLUTION RPC (PUBLIC PRIVACY PRESERVATION)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.resolve_nfc_card(
  p_uid_or_serial TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_card RECORD;
BEGIN
  IF p_uid_or_serial IS NULL OR length(trim(p_uid_or_serial)) = 0 THEN
    RETURN NULL;
  END IF;

  SELECT linked_profile_id, status
  INTO v_card
  FROM public.nfc_cards
  WHERE (uid = p_uid_or_serial OR serial_number = p_uid_or_serial)
    AND status = 'active'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Return ONLY the linked profile ID and status (no customer ID, order ID, or billing data)
  RETURN jsonb_build_object(
    'linked_profile_id', v_card.linked_profile_id,
    'status', v_card.status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.resolve_nfc_card(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_nfc_card(TEXT) TO anon, authenticated, service_role;

-- =============================================================================
-- 2. SAFE PUBLIC PROFILE RETRIEVAL RPC (REDACTS SUSPENDED & PRIVATE DATA)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_public_profile(
  p_handle_or_id TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_profile RECORD;
  v_is_owner BOOLEAN := FALSE;
  v_is_admin BOOLEAN := FALSE;
BEGIN
  IF p_handle_or_id IS NULL OR length(trim(p_handle_or_id)) = 0 THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_profile
  FROM public.business_profiles
  WHERE handle = p_handle_or_id OR id = p_handle_or_id
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_is_owner := (auth.uid() IS NOT NULL AND v_profile.owner_id = auth.uid());
  v_is_admin := public.is_founder_admin();

  -- If in private preview or order pending, only owner or admin can view
  IF v_profile.access_state IN ('private_preview', 'order_pending') AND NOT (v_is_owner OR v_is_admin) THEN
    RETURN NULL;
  END IF;

  -- If profile is suspended, strip private contacts, documents, and products for public visitors
  IF v_profile.access_state = 'expired_suspended' AND NOT (v_is_owner OR v_is_admin) THEN
    RETURN jsonb_build_object(
      'id', v_profile.id,
      'handle', v_profile.handle,
      'display_name', v_profile.display_name,
      'cover_color', v_profile.cover_color,
      'template_id', v_profile.template_id,
      'access_state', 'expired_suspended',
      'expiry_date', v_profile.expiry_date,
      'phone', '',
      'whatsapp', '',
      'email', '',
      'website', '',
      'socials', '{}'::jsonb,
      'products', '[]'::jsonb,
      'documents', '[]'::jsonb,
      'videos', '[]'::jsonb,
      'lead_fields', '[]'::jsonb,
      'digital_tagtop_branding', v_profile.digital_tagtop_branding,
      'linked_card_count', v_profile.linked_card_count
    );
  END IF;

  -- Return complete public presentation
  RETURN jsonb_build_object(
    'id', v_profile.id,
    'owner_id', CASE WHEN (v_is_owner OR v_is_admin) THEN v_profile.owner_id::text ELSE NULL END,
    'handle', v_profile.handle,
    'display_name', v_profile.display_name,
    'job_title', v_profile.job_title,
    'company', v_profile.company,
    'bio', v_profile.bio,
    'city', v_profile.city,
    'address', v_profile.address,
    'avatar_url', v_profile.avatar_url,
    'logo_url', v_profile.logo_url,
    'cover_color', v_profile.cover_color,
    'template_id', v_profile.template_id,
    'access_state', v_profile.access_state,
    'expiry_date', v_profile.expiry_date,
    'grace_deadline_date', v_profile.grace_deadline_date,
    'phone', v_profile.phone,
    'whatsapp', v_profile.whatsapp,
    'email', v_profile.email,
    'website', v_profile.website,
    'socials', v_profile.socials,
    'products', v_profile.products,
    'documents', v_profile.documents,
    'videos', v_profile.videos,
    'lead_fields', v_profile.lead_fields,
    'digital_tagtop_branding', v_profile.digital_tagtop_branding,
    'linked_card_count', v_profile.linked_card_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.get_public_profile(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profile(TEXT) TO anon, authenticated, service_role;

-- =============================================================================
-- 3. CUSTOMER: SAFE PROOF DECISION RPC
-- =============================================================================
CREATE OR REPLACE FUNCTION public.customer_submit_proof_decision(
  p_order_id TEXT,
  p_approved BOOLEAN,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  -- Security check: caller must own the order or be founder admin
  IF NOT (
    public.is_founder_admin() OR
    (auth.uid() IS NOT NULL AND v_order.customer_id = auth.uid()) OR
    (auth.uid() IS NOT NULL AND v_order.customer_email = (SELECT email FROM public.users WHERE id = auth.uid()))
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You can only review proofs for your own orders';
  END IF;

  IF v_order.order_status NOT IN ('received', 'artwork_review') THEN
    RAISE EXCEPTION 'Order status % cannot be modified by proof review', v_order.order_status;
  END IF;

  IF p_approved THEN
    UPDATE public.orders
    SET
      proof_approved = TRUE,
      proof_rejection_reason = NULL,
      order_status = 'customer_approved',
      updated_at = timezone('utc'::text, now())
    WHERE id = p_order_id;
  ELSE
    IF p_rejection_reason IS NULL OR length(trim(p_rejection_reason)) = 0 THEN
      RAISE EXCEPTION 'A modification reason must be provided when requesting proof changes';
    END IF;

    UPDATE public.orders
    SET
      proof_approved = FALSE,
      proof_rejection_reason = p_rejection_reason,
      order_status = 'artwork_review',
      updated_at = timezone('utc'::text, now())
    WHERE id = p_order_id;
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'order_id', p_order_id,
    'proof_approved', p_approved,
    'order_status', CASE WHEN p_approved THEN 'customer_approved' ELSE 'artwork_review' END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.customer_submit_proof_decision(TEXT, BOOLEAN, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.customer_submit_proof_decision(TEXT, BOOLEAN, TEXT) TO authenticated, service_role;

-- =============================================================================
-- 4. ATOMIC ANALYTICS LOGGING RPC
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.record_profile_event(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_profile_event(TEXT, TEXT) TO anon, authenticated, service_role;

-- =============================================================================
-- 5. FOUNDER ADMIN: APPROVE BANK TRANSFER & EXTEND SUBSCRIPTION
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.founder_approve_bank_transfer(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.founder_approve_bank_transfer(TEXT, TEXT) TO authenticated, service_role;

-- =============================================================================
-- 6. FOUNDER ADMIN: REJECT BANK TRANSFER
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.founder_reject_bank_transfer(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.founder_reject_bank_transfer(TEXT, TEXT) TO authenticated, service_role;

-- =============================================================================
-- 7. FOUNDER ADMIN: UPDATE ORDER STATUS & UNLOCK DELIVERED PROFILES
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.founder_update_order_status(TEXT, tagtop_order_status, tagtop_payment_status) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.founder_update_order_status(TEXT, tagtop_order_status, tagtop_payment_status) TO authenticated, service_role;

-- =============================================================================
-- 8. SUBSCRIPTION EVALUATION (Cron / Scheduled Job / Admin Trigger)
-- =============================================================================
-- Hardened: Profiles already past 14-day grace are immediately suspended,
-- even if previous scheduled evaluations were missed.
CREATE OR REPLACE FUNCTION public.evaluate_profile_subscriptions()
RETURNS JSONB AS $$
DECLARE
  v_now DATE := CURRENT_DATE;
  v_grace_count INTEGER := 0;
  v_suspended_count INTEGER := 0;
BEGIN
  -- Security check: restricted to service_role or founder admin
  IF NOT (public.is_founder_admin() OR auth.role() = 'service_role') THEN
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

  -- Step 2: ANY profile past the 14-day grace period (whether in grace_period, active, or renewal_due)
  -- immediately transitions to expired_suspended! (Safeguards against missed cron runs).
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
