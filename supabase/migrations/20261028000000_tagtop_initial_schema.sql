-- TAGTOP Supabase PostgreSQL Schema Migration: 20261028000000_tagtop_initial_schema.sql
-- Description: Core relational database schema for TAGTOP NFC Platform (Users, Profiles, NFC Cards, Orders, Leads, Transfers, Settings, Analytics).

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Enum Types
CREATE TYPE tagtop_user_role AS ENUM ('customer', 'founder_admin');
CREATE TYPE tagtop_package_tier AS ENUM ('starter', 'pro', 'enterprise');
CREATE TYPE tagtop_card_color AS ENUM ('black', 'white');
CREATE TYPE tagtop_card_branding AS ENUM ('branded', 'unbranded');
CREATE TYPE tagtop_profile_template AS ENUM ('executive', 'creative', 'artisan');
CREATE TYPE tagtop_profile_access_state AS ENUM (
  'private_preview',
  'order_pending',
  'active',
  'renewal_due',
  'grace_period',
  'expired_suspended',
  'restored'
);
CREATE TYPE tagtop_order_status AS ENUM (
  'received',
  'artwork_review',
  'customer_approved',
  'production',
  'linked',
  'shipped',
  'delivered'
);
CREATE TYPE tagtop_payment_status AS ENUM (
  'cod_pending',
  'cod_collected'
);
CREATE TYPE tagtop_transfer_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);
CREATE TYPE tagtop_card_status AS ENUM (
  'active',
  'in_transit',
  'pending_link'
);

-- =============================================================================
-- 1. USER ACCOUNTS & PROFILES (Extends Supabase auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  role tagtop_user_role NOT NULL DEFAULT 'customer',
  preferred_language TEXT NOT NULL DEFAULT 'fr' CHECK (preferred_language IN ('fr', 'ar', 'en')),
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 2. BUSINESS PROFILES (Public & Private profile metadata)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id TEXT PRIMARY KEY DEFAULT ('prof-' || lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  handle TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  job_title TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT 'Casablanca',
  address TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '',
  cover_color TEXT NOT NULL DEFAULT '#18181b',
  template_id tagtop_profile_template NOT NULL DEFAULT 'executive',
  access_state tagtop_profile_access_state NOT NULL DEFAULT 'private_preview',
  expiry_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '180 days'), -- 6 months included
  grace_deadline_date DATE,
  phone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  socials JSONB NOT NULL DEFAULT '{}'::jsonb,
  products JSONB NOT NULL DEFAULT '[]'::jsonb,
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  videos JSONB NOT NULL DEFAULT '[]'::jsonb,
  lead_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  digital_tagtop_branding BOOLEAN NOT NULL DEFAULT TRUE,
  linked_card_count INTEGER NOT NULL DEFAULT 0,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_business_profiles_owner_id ON public.business_profiles(owner_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_handle ON public.business_profiles(handle);
CREATE INDEX IF NOT EXISTS idx_business_profiles_access_state ON public.business_profiles(access_state);

-- =============================================================================
-- 3. ORDERS (PVC Card & Accessory Orders)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT ('ord-' || lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  customer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  package_tier tagtop_package_tier NOT NULL DEFAULT 'starter',
  card_color tagtop_card_color NOT NULL DEFAULT 'black',
  card_branding tagtop_card_branding NOT NULL DEFAULT 'branded',
  card_quantity INTEGER NOT NULL DEFAULT 1 CHECK (card_quantity >= 1),
  price_mad NUMERIC(10, 2) NOT NULL CHECK (price_mad >= 0),
  wooden_stand_selected BOOLEAN NOT NULL DEFAULT FALSE,
  wooden_stand_price_mad NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  profile_id TEXT REFERENCES public.business_profiles(id) ON DELETE SET NULL,
  profile_name TEXT NOT NULL DEFAULT '',
  logo_file_name TEXT,
  logo_preview_url TEXT,
  order_status tagtop_order_status NOT NULL DEFAULT 'received',
  payment_status tagtop_payment_status NOT NULL DEFAULT 'cod_pending',
  proof_url TEXT,
  proof_approved BOOLEAN NOT NULL DEFAULT FALSE,
  proof_rejection_reason TEXT,
  card_uid TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_profile_id ON public.orders(profile_id);

-- =============================================================================
-- 4. NFC CARDS REGISTRY (Physical Card Hardware Inventory)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.nfc_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid TEXT NOT NULL UNIQUE, -- Unique chip UID, e.g. "TAG-001-CASABLANCA"
  serial_number TEXT NOT NULL UNIQUE, -- Engraved serial number, e.g. "SN-2026-0089"
  card_color tagtop_card_color NOT NULL DEFAULT 'black',
  card_branding tagtop_card_branding NOT NULL DEFAULT 'branded',
  linked_profile_id TEXT REFERENCES public.business_profiles(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  provisioned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  status tagtop_card_status NOT NULL DEFAULT 'active',
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_nfc_cards_uid ON public.nfc_cards(uid);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_serial ON public.nfc_cards(serial_number);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_linked_profile ON public.nfc_cards(linked_profile_id);

-- =============================================================================
-- 5. LEADS (Customer Inquiries Captured from Public Profiles)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  profile_name TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  promotional_consent BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  is_demo BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_leads_profile_id ON public.leads(profile_id);
CREATE INDEX IF NOT EXISTS idx_leads_submitted_at ON public.leads(submitted_at);

-- =============================================================================
-- 6. BANK TRANSFERS & RENEWALS (Manual Wire Submissions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.bank_transfers (
  id TEXT PRIMARY KEY DEFAULT ('trn-' || extract(epoch from now())::bigint::text),
  profile_id TEXT NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  profile_name TEXT NOT NULL DEFAULT '',
  customer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  amount_mad NUMERIC(10, 2) NOT NULL CHECK (amount_mad IN (150.00, 200.00)), -- 150 MAD (6 months) or 200 MAD (1 year)
  period_description TEXT NOT NULL,
  receipt_number TEXT NOT NULL,
  receipt_file_url TEXT,
  status tagtop_transfer_status NOT NULL DEFAULT 'pending',
  founder_notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_bank_transfers_profile_id ON public.bank_transfers(profile_id);
CREATE INDEX IF NOT EXISTS idx_bank_transfers_status ON public.bank_transfers(status);

-- =============================================================================
-- 7. PROFILE ANALYTICS & INTERACTION LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('tap', 'whatsapp_click', 'vcard_download')),
  visitor_hash TEXT, -- One-way hash for privacy-safe unique view counting
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_analytics_profile_id ON public.analytics_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);

-- Materialized aggregate counts for fast dashboard reporting
CREATE TABLE IF NOT EXISTS public.profile_analytics_summary (
  profile_id TEXT PRIMARY KEY REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  taps INTEGER NOT NULL DEFAULT 0,
  whatsapp_clicks INTEGER NOT NULL DEFAULT 0,
  vcard_downloads INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 8. SYSTEM SETTINGS & PRICING RULES (Single-row configuration)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  starter_branded_price_mad NUMERIC(10, 2) NOT NULL DEFAULT 250.00,
  starter_unbranded_price_mad NUMERIC(10, 2) NOT NULL DEFAULT 350.00,
  renewal_six_months_mad NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
  renewal_annual_mad NUMERIC(10, 2) NOT NULL DEFAULT 200.00,
  wooden_stand_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  wooden_stand_price_mad NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  support_whatsapp_number TEXT NOT NULL DEFAULT '+212600000000',
  bank_account_details TEXT NOT NULL DEFAULT 'CIH Bank - RIB: 230 780 0001234567890123 45 (TAGTOP SARL)',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Ensure initial settings row exists
INSERT INTO public.system_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- AUTOMATIC TIMESTAMP TRIGGERS
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.business_profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_settings_updated_at ON public.system_settings;
CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

