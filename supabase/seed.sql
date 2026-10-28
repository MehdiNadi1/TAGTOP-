-- TAGTOP Supabase Seed Data: seed.sql
-- Description: Isolated demo/seed data for testing and development. Marked with is_demo = TRUE.

-- 1. Ensure system settings record
INSERT INTO public.system_settings (
  id,
  starter_branded_price_mad,
  starter_unbranded_price_mad,
  renewal_six_months_mad,
  renewal_annual_mad,
  wooden_stand_enabled,
  wooden_stand_price_mad,
  support_whatsapp_number,
  bank_account_details
)
VALUES (
  1,
  250.00,
  350.00,
  150.00,
  200.00,
  FALSE,
  0.00,
  '+212600000000',
  'CIH Bank - RIB: 230 780 0001234567890123 45 (TAGTOP SARL)'
)
ON CONFLICT (id) DO UPDATE SET
  starter_branded_price_mad = EXCLUDED.starter_branded_price_mad,
  starter_unbranded_price_mad = EXCLUDED.starter_unbranded_price_mad,
  renewal_six_months_mad = EXCLUDED.renewal_six_months_mad,
  renewal_annual_mad = EXCLUDED.renewal_annual_mad;

-- 2. Demo User Seed (for local development or staging tests)
-- Note: In production Supabase, users are created through Supabase Auth (auth.users).
-- The following demonstrates an optional staging customer demo.
DO $$
DECLARE
  v_demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Insert into public.users if staging/dev without auth trigger
  INSERT INTO public.users (id, email, full_name, phone, role, preferred_language, is_demo)
  VALUES (
    v_demo_user_id,
    'mehdi@casa-architectes.ma',
    'Mehdi Benjelloun',
    '+212661000001',
    'customer',
    'fr',
    TRUE
  )
  ON CONFLICT (id) DO NOTHING;

  -- 3. Demo Business Profiles
  INSERT INTO public.business_profiles (
    id,
    owner_id,
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
    phone,
    whatsapp,
    email,
    website,
    socials,
    products,
    documents,
    videos,
    lead_fields,
    digital_tagtop_branding,
    linked_card_count,
    is_demo
  )
  VALUES (
    'prof-casablanca',
    v_demo_user_id,
    'casa-architects',
    'Studio Architectura Casablanca',
    'Architecte Principal & Fondateur',
    'Studio Architectura SARL',
    'Conception architecturale bioclimatique, rénovations haut de gamme et suivi de chantiers à Casablanca & Bouskoura.',
    'Casablanca',
    'Angle Bd d''Anfa & Rue Mozart, Casablanca',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    '#0f172a',
    'executive',
    'active',
    (CURRENT_DATE + INTERVAL '120 days')::DATE,
    '+212661000001',
    '+212661000001',
    'contact@studio-architectura.ma',
    'https://studio-architectura.ma',
    '{"linkedin": "https://linkedin.com/in/studio-architectura", "instagram": "https://instagram.com/studio.architectura"}'::jsonb,
    '[
      {"id": "p1", "name": "Étude & Avant-Projet Sommaire (APS)", "category": "Prestation", "priceMAD": 15000, "description": "Plans masse, projections 3D et estimation budgétaire.", "isAvailable": true},
      {"id": "p2", "name": "Suivi de Chantier & Maîtrise d''Œuvre", "category": "Mission", "priceMAD": 25000, "description": "Coordination des corps d''état et réceptions d''ouvrages.", "isAvailable": true}
    ]'::jsonb,
    '[
      {"id": "d1", "title": "Portfolio Réalisations 2026 (PDF)", "size": "4.2 Mo", "fileType": "PDF", "url": "#"}
    ]'::jsonb,
    '[]'::jsonb,
    '[
      {"id": "lf_name", "label": "Nom complet", "type": "text", "required": true, "enabled": true},
      {"id": "lf_phone", "label": "Numéro WhatsApp / Téléphone", "type": "tel", "required": true, "enabled": true},
      {"id": "lf_notes", "label": "Détails de votre projet", "type": "textarea", "required": false, "enabled": true}
    ]'::jsonb,
    TRUE,
    1,
    TRUE
  )
  ON CONFLICT (id) DO NOTHING;

  -- 4. Demo NFC Card
  INSERT INTO public.nfc_cards (
    uid,
    serial_number,
    card_color,
    card_branding,
    linked_profile_id,
    customer_id,
    status,
    is_demo
  )
  VALUES (
    'TAG-001-CASABLANCA',
    'SN-2026-0089',
    'black',
    'branded',
    'prof-casablanca',
    v_demo_user_id,
    'active',
    TRUE
  )
  ON CONFLICT (uid) DO NOTHING;

  -- 5. Demo Analytics Summary
  INSERT INTO public.profile_analytics_summary (
    profile_id,
    taps,
    whatsapp_clicks,
    vcard_downloads
  )
  VALUES (
    'prof-casablanca',
    148,
    62,
    45
  )
  ON CONFLICT (profile_id) DO NOTHING;

END $$;
