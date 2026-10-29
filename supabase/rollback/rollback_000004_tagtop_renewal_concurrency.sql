-- =============================================================================
-- TAGTOP TARGETED SCHEMA ROLLBACK: Migration 000004
-- Target File: supabase/rollback/rollback_000004_tagtop_renewal_concurrency.sql
-- Target Migration Reverted: 20261029000004_tagtop_renewal_approval_concurrency.sql
-- Restored State Source of Truth: 20261028000003_tagtop_permissions_and_service_role.sql
-- Execution Mode: TRANSACTIONAL (Single Atomic Transaction with Strict Assertions)
-- DO NOT EXECUTE AUTOMATICALLY - REQUIRES OPERATOR APPROVAL
-- =============================================================================
--
-- ARCHITECTURAL NOTICE & WARNING:
-- -----------------------------------------------------------------------------
-- 1. TARGETED SCHEMA ROLLBACK ONLY:
--    This script is a targeted schema rollback of three specific database
--    objects modified in Migration 000004. This is NOT a complete database
--    restore or point-in-time recovery (PITR).
--    - It DOES NOT drop tables or delete any table data.
--    - It DOES NOT alter existing business_profiles, users, orders, or leads.
--    - It DOES NOT undo or revert subscription renewals, expiry date extensions,
--      or access state changes granted while Migration 000004 was active.
--    - It DOES NOT alter or rewrite existing bank_transfers rows that were
--      created with UUID IDs ('trn-<uuid>') while Migration 000004 was active.
--
-- 2. REINTRODUCTION OF CONCURRENCY WEAKNESSES:
--    Executing this rollback will reintroduce the known concurrency limitations
--    present prior to Migration 000004:
--    a) ID Collision Risk: Reverts ID generation to 1-second epoch resolution
--       ('trn-' || extract(epoch from now())::bigint::text). Concurrent inserts
--       within the same second will collide and fail with primary key violation.
--    b) Lost Updates on Concurrent Approvals: Without row-level locking
--       ('FOR UPDATE') on business_profiles and bank_transfers, concurrent
--       approvals for the same profile can read stale expiry dates, resulting in
--       lost renewal durations.
--    c) State Machine Violations: The legacy functions lack strict terminal state
--       checks (allowing a rejected transfer to be approved, or an approved
--       transfer to be marked rejected).
--    d) Missing Lock Timeout Protection: Transactions will wait indefinitely
--       for row locks rather than timing out safely after 5000ms.
--
--    RECOMMENDATION: A forward fix (hotfix) addressing the specific issue in
--    Migration 000004 is strongly preferred over rolling back to legacy logic.
--
-- 3. STRICT PRECONDITION & DRIFT DETECTION:
--    Rollback will be REFUSED if the database does not strictly match the
--    Migration 000004 baseline across ALL THREE target objects. Target procedures
--    are identified by exact signature (public.founder_approve_bank_transfer(text, text)
--    and public.founder_reject_bank_transfer(text, text)), and verified using
--    PostgreSQL-native POSIX regex normalization and MD5 hashing.
--    All assertions use NULL-safe comparisons (IS DISTINCT FROM / IS NOT NULL);
--    any failed assertion immediately raises an exception and aborts the transaction.
-- =============================================================================


-- =============================================================================
-- SECTION A: READ-ONLY PRE-FLIGHT VERIFICATION QUERIES (RUN BEFORE ROLLBACK)
-- =============================================================================
/*
-- 1. Inspect current column default on public.bank_transfers.id:
SELECT table_schema, table_name, column_name, column_default, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bank_transfers'
  AND column_name = 'id';
-- Expected before rollback (000004): ('trn-'::text || (gen_random_uuid())::text)
-- Expected after rollback  (000003): ('trn-'::text || ((EXTRACT(epoch FROM now()))::bigint)::text)

-- 2. Inspect routine definitions, security attributes, search_path, and PostgreSQL hashes:
SELECT
  p.oid::regprocedure AS function_identity,
  p.prosecdef AS is_security_definer,
  array_to_string(p.proconfig, ', ') AS runtime_config,
  md5(regexp_replace(regexp_replace(btrim(p.prosrc), '--[^\r\n]*', '', 'g'), '[[:space:]]+', ' ', 'g')) AS normalized_hash,
  CASE
    WHEN p.oid = 'public.founder_approve_bank_transfer(text, text)'::regprocedure
      AND md5(regexp_replace(regexp_replace(btrim(p.prosrc), '--[^\r\n]*', '', 'g'), '[[:space:]]+', ' ', 'g')) = '2f3c1774c8dfb15b4cbfd336198fb80a'
      THEN 'Migration 000004 (Hardened Concurrency - Verified Hash)'
    WHEN p.oid = 'public.founder_reject_bank_transfer(text, text)'::regprocedure
      AND md5(regexp_replace(regexp_replace(btrim(p.prosrc), '--[^\r\n]*', '', 'g'), '[[:space:]]+', ' ', 'g')) = 'abebc7496ce0a4a80a4506c015e07851'
      THEN 'Migration 000004 (Hardened Concurrency - Verified Hash)'
    WHEN p.oid = 'public.founder_approve_bank_transfer(text, text)'::regprocedure
      AND md5(regexp_replace(regexp_replace(btrim(p.prosrc), '--[^\r\n]*', '', 'g'), '[[:space:]]+', ' ', 'g')) = '6ab47949fbe980cf21d5e995a6e042f6'
      THEN 'Migration 000003 (Legacy Baseline - Verified Hash)'
    WHEN p.oid = 'public.founder_reject_bank_transfer(text, text)'::regprocedure
      AND md5(regexp_replace(regexp_replace(btrim(p.prosrc), '--[^\r\n]*', '', 'g'), '[[:space:]]+', ' ', 'g')) = 'aaa7e1bf2de03709f4a1d8985944cece'
      THEN 'Migration 000003 (Legacy Baseline - Verified Hash)'
    ELSE 'Schema Drift Detected / Unknown Version'
  END AS version_audit
FROM pg_proc p
WHERE p.oid IN (
  to_regprocedure('public.founder_approve_bank_transfer(text, text)'),
  to_regprocedure('public.founder_reject_bank_transfer(text, text)')
);

-- 3. Inspect execute grants on the exact target functions:
SELECT grantee, routine_name, privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name IN ('founder_approve_bank_transfer', 'founder_reject_bank_transfer')
ORDER BY routine_name, grantee;
-- Expected: Only 'authenticated' and 'service_role' have EXECUTE (NO anon, NO PUBLIC).
*/


-- =============================================================================
-- SECTION B: ATOMIC TRANSACTIONAL ROLLBACK
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Step 1: Strict Precondition Enforcement
-- Verify ALL THREE objects strictly match Migration 000004 specifications.
-- Uses exact function OID lookups and NULL-safe operators to prevent bypass.
-- If any object has drifted, is missing, or is NULL, abort immediately.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  -- Object 1: bank_transfers.id default
  v_col_default TEXT;
  v_col_default_clean TEXT;

  -- Object 2: founder_approve_bank_transfer(text, text)
  v_app_oid OID;
  v_app_ret TEXT;
  v_app_secdef BOOLEAN;
  v_app_config TEXT;
  v_app_src TEXT;
  v_app_hash_raw TEXT;
  v_app_hash_norm TEXT;
  v_app_unauth_grants INTEGER;
  v_app_auth_grants INTEGER;

  -- Object 3: founder_reject_bank_transfer(text, text)
  v_rej_oid OID;
  v_rej_ret TEXT;
  v_rej_secdef BOOLEAN;
  v_rej_config TEXT;
  v_rej_src TEXT;
  v_rej_hash_raw TEXT;
  v_rej_hash_norm TEXT;
  v_rej_unauth_grants INTEGER;
  v_rej_auth_grants INTEGER;

  -- PostgreSQL 17 verified MD5 hashes for Migration 000004:
  -- founder_approve_bank_transfer raw (with comments):        d05400803c102864210c68ca342d25a0
  -- founder_approve_bank_transfer normalized (no comments):   2f3c1774c8dfb15b4cbfd336198fb80a
  -- founder_reject_bank_transfer raw (with comments):         4ef8c1149ff31ed09fc8b60e7e6a9147
  -- founder_reject_bank_transfer normalized (no comments):    abebc7496ce0a4a80a4506c015e07851
  c_000004_APP_RAW  CONSTANT TEXT := 'd05400803c102864210c68ca342d25a0';
  c_000004_APP_NORM CONSTANT TEXT := '2f3c1774c8dfb15b4cbfd336198fb80a';
  c_000004_REJ_RAW  CONSTANT TEXT := '4ef8c1149ff31ed09fc8b60e7e6a9147';
  c_000004_REJ_NORM CONSTANT TEXT := 'abebc7496ce0a4a80a4506c015e07851';
BEGIN
  -- ===========================================================================
  -- 1. VERIFY OBJECT 1: public.bank_transfers.id Default Expression
  -- ===========================================================================
  SELECT column_default INTO v_col_default
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'bank_transfers'
    AND column_name = 'id';

  IF v_col_default IS NULL THEN
    RAISE EXCEPTION 'PRECONDITION FAILED [Object 1]: Column public.bank_transfers.id does not exist or has NULL default.';
  END IF;

  -- Normalize whitespace for exact expression check against PostgreSQL catalog formatting
  v_col_default_clean := regexp_replace(v_col_default, '[[:space:]]+', '', 'g');

  IF v_col_default_clean IS DISTINCT FROM '(''trn-''::text||(gen_random_uuid())::text)' THEN
    RAISE EXCEPTION 'PRECONDITION FAILED [Object 1]: bank_transfers.id default does not match Migration 000004 UUID generator. Expected "(''trn-''::text || (gen_random_uuid())::text)", Got: "%". Aborting rollback.', v_col_default;
  END IF;

  -- ===========================================================================
  -- 2. VERIFY OBJECT 2: public.founder_approve_bank_transfer(text, text)
  -- ===========================================================================
  v_app_oid := to_regprocedure('public.founder_approve_bank_transfer(text, text)');

  IF v_app_oid IS NULL THEN
    RAISE EXCEPTION 'PRECONDITION FAILED [Object 2]: Procedure public.founder_approve_bank_transfer(text, text) does not exist.';
  END IF;

  SELECT
    pg_get_function_result(p.oid),
    p.prosecdef,
    COALESCE(array_to_string(p.proconfig, ', '), ''),
    p.prosrc,
    md5(regexp_replace(btrim(p.prosrc), '[[:space:]]+', ' ', 'g')),
    md5(regexp_replace(regexp_replace(btrim(p.prosrc), '--[^\r\n]*', '', 'g'), '[[:space:]]+', ' ', 'g'))
  INTO
    v_app_ret,
    v_app_secdef,
    v_app_config,
    v_app_src,
    v_app_hash_raw,
    v_app_hash_norm
  FROM pg_proc p
  WHERE p.oid = v_app_oid;

  -- 2.1 Verify Return Type
  IF v_app_ret IS DISTINCT FROM 'jsonb' THEN
    RAISE EXCEPTION 'PRECONDITION FAILED [Object 2]: Return type is "%", expected "jsonb".', v_app_ret;
  END IF;

  -- 2.2 Verify Security Definer
  IF v_app_secdef IS NOT TRUE THEN
    RAISE EXCEPTION 'PRECONDITION FAILED [Object 2]: founder_approve_bank_transfer must be SECURITY DEFINER.';
  END IF;

  -- 2.3 Verify search_path
  IF v_app_config IS NULL OR v_app_config NOT ILIKE '%search_path=public, pg_temp%' THEN
    RAISE EXCEPTION 'PRECONDITION FAILED [Object 2]: search_path mismatch. Config: "%"', v_app_config;
  END IF;

  -- 2.4 Verify Routine Privileges
  SELECT COUNT(*) INTO v_app_unauth_grants
  FROM information_schema.routine_privileges
  WHERE routine_schema = 'public'
    AND routine_name = 'founder_approve_bank_transfer'
    AND grantee IN ('PUBLIC', 'anon')
    AND privilege_type = 'EXECUTE';

  IF v_app_unauth_grants IS NULL OR v_app_unauth_grants > 0 THEN
    RAISE EXCEPTION 'PRECONDITION FAILED [Object 2]: Unauthorized EXECUTE privilege detected on PUBLIC or anon.';
  END IF;

  SELECT COUNT(*) INTO v_app_auth_grants
  FROM information_schema.routine_privileges
  WHERE routine_schema = 'public'
    AND routine_name = 'founder_approve_bank_transfer'
    AND grantee IN ('authenticated', 'service_role')
    AND privilege_type = 'EXECUTE';

  IF v_app_auth_grants IS NULL OR v_app_auth_grants < 2 THEN
    RAISE EXCEPTION 'PRECONDITION FAILED [Object 2]: Missing EXECUTE privilege for authenticated or service_role.';
  END IF;

  -- 2.5 Verify Function Body Hash Matches Migration 000004
  IF (v_app_hash_raw IS DISTINCT FROM c_000004_APP_RAW) AND
     (v_app_hash_norm IS DISTINCT FROM c_000004_APP_NORM) THEN
    RAISE EXCEPTION 'PRECONDITION FAILED [Object 2]: founder_approve_bank_transfer body has drifted from Migration 000004. Hash: "%" (Expected raw: "%", norm: "%"). Aborting rollback.', v_app_hash_norm, c_000004_APP_RAW, c_000004_APP_NORM;
  END IF;

  -- 2.6 Verify Crucial Hardening Constructs
  IF v_app_src IS NULL OR
     v_app_src NOT ILIKE '%FOR UPDATE%' OR
     v_app_src NOT ILIKE '%lock_timeout%' OR
     v_app_src NOT ILIKE '%status != ''pending''%' OR
     v_app_src NOT ILIKE '%lock_not_available%' OR
     v_app_src NOT ILIKE '%deadlock_detected%' THEN
    RAISE EXCEPTION 'PRECONDITION FAILED [Object 2]: Crucial Migration 000004 concurrency controls not detected in body.';
  END IF;

  -- ===========================================================================
  -- 3. VERIFY OBJECT 3: public.founder_reject_bank_transfer(text, text)
  -- ===========================================================================
  v_rej_oid := to_regprocedure('public.founder_reject_bank_transfer(text, text)');

  IF v_rej_oid IS NULL THEN
    RAISE EXCEPTION 'PRECONDITION FAILED [Object 3]: Procedure public.founder_reject_bank_transfer(text, text) does not exist.';
  END IF;

  SELECT
    pg_get_function_result(p.oid),
    p.prosecdef,
    COALESCE(array_to_string(p.proconfig, ', '), ''),
    p.prosrc,
    md5(regexp_replace(btrim(p.prosrc), '[[:space:]]+', ' ', 'g')),
    md5(regexp_replace(regexp_replace(btrim(p.prosrc), '--[^\r\n]*', '', 'g'), '[[:space:]]+', ' ', 'g'))
  INTO
    v_rej_ret,
    v_rej_secdef,
    v_rej_config,
    v_rej_src,
    v_rej_hash_raw,
    v_rej_hash_norm
  FROM pg_proc p
  WHERE p.oid = v_rej_oid;

  -- 3.1 Verify Return Type
  IF v_rej_ret IS DISTINCT FROM 'jsonb' THEN
    RAISE EXCEPTION 'PRECONDITION FAILED [Object 3]: Return type is "%", expected "jsonb".', v_rej_ret;
  END IF;

  -- 3.2 Verify Security Definer
  IF v_rej_secdef IS NOT TRUE THEN
    RAISE EXCEPTION 'PRECONDITION FAILED [Object 3]: founder_reject_bank_transfer must be SECURITY DEFINER.';
  END IF;

  -- 3.3 Verify search_path
  IF v_rej_config IS NULL OR v_rej_config NOT ILIKE '%search_path=public, pg_temp%' THEN
    RAISE EXCEPTION 'PRECONDITION FAILED [Object 3]: search_path mismatch. Config: "%"', v_rej_config;
  END IF;

  -- 3.4 Verify Routine Privileges
  SELECT COUNT(*) INTO v_rej_unauth_grants
  FROM information_schema.routine_privileges
  WHERE routine_schema = 'public'
    AND routine_name = 'founder_reject_bank_transfer'
    AND grantee IN ('PUBLIC', 'anon')
    AND privilege_type = 'EXECUTE';

  IF v_rej_unauth_grants IS NULL OR v_rej_unauth_grants > 0 THEN
    RAISE EXCEPTION 'PRECONDITION FAILED [Object 3]: Unauthorized EXECUTE privilege detected on PUBLIC or anon.';
  END IF;

  SELECT COUNT(*) INTO v_rej_auth_grants
  FROM information_schema.routine_privileges
  WHERE routine_schema = 'public'
    AND routine_name = 'founder_reject_bank_transfer'
    AND grantee IN ('authenticated', 'service_role')
    AND privilege_type = 'EXECUTE';

  IF v_rej_auth_grants IS NULL OR v_rej_auth_grants < 2 THEN
    RAISE EXCEPTION 'PRECONDITION FAILED [Object 3]: Missing EXECUTE privilege for authenticated or service_role.';
  END IF;

  -- 3.5 Verify Function Body Hash Matches Migration 000004
  IF (v_rej_hash_raw IS DISTINCT FROM c_000004_REJ_RAW) AND
     (v_rej_hash_norm IS DISTINCT FROM c_000004_REJ_NORM) THEN
    RAISE EXCEPTION 'PRECONDITION FAILED [Object 3]: founder_reject_bank_transfer body has drifted from Migration 000004. Hash: "%" (Expected raw: "%", norm: "%"). Aborting rollback.', v_rej_hash_norm, c_000004_REJ_RAW, c_000004_REJ_NORM;
  END IF;

  -- 3.6 Verify Crucial Hardening Constructs
  IF v_rej_src IS NULL OR
     v_rej_src NOT ILIKE '%FOR UPDATE%' OR
     v_rej_src NOT ILIKE '%lock_timeout%' OR
     v_rej_src NOT ILIKE '%status != ''pending''%' OR
     v_rej_src NOT ILIKE '%lock_not_available%' OR
     v_rej_src NOT ILIKE '%deadlock_detected%' THEN
    RAISE EXCEPTION 'PRECONDITION FAILED [Object 3]: Crucial Migration 000004 concurrency controls not detected in body.';
  END IF;

  RAISE NOTICE 'Strict Precondition Passed: ALL THREE objects strictly match Migration 000004 baseline. Proceeding with targeted rollback...';
END;
$$;


-- -----------------------------------------------------------------------------
-- Step 2: Restore Original bank_transfers.id Default Expression
-- Source: supabase/migrations/20261028000000_tagtop_initial_schema.sql (line 185)
-- -----------------------------------------------------------------------------
ALTER TABLE public.bank_transfers
  ALTER COLUMN id SET DEFAULT ('trn-' || extract(epoch from now())::bigint::text);


-- -----------------------------------------------------------------------------
-- Step 3: Restore Original founder_approve_bank_transfer Function
-- Source: supabase/migrations/20261028000003_tagtop_permissions_and_service_role.sql (lines 536-601)
-- Exactly preserves function signature, SECURITY DEFINER, search_path, and grants.
-- -----------------------------------------------------------------------------
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


-- -----------------------------------------------------------------------------
-- Step 4: Restore Original founder_reject_bank_transfer Function
-- Source: supabase/migrations/20261028000003_tagtop_permissions_and_service_role.sql (lines 604-627)
-- Exactly preserves function signature, SECURITY DEFINER, search_path, and grants.
-- -----------------------------------------------------------------------------
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


-- -----------------------------------------------------------------------------
-- Step 5: Comprehensive Postcondition Assertion
-- Verify ALL THREE objects have been restored to exact Migration 000003 specifications.
-- Uses exact function OID lookups, verified PostgreSQL 17 hashes, and NULL safety.
-- If any assertion fails, RAISE EXCEPTION automatically aborts the transaction.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  -- Object 1
  v_col_default TEXT;
  v_col_default_clean TEXT;

  -- Object 2
  v_app_oid OID;
  v_app_ret TEXT;
  v_app_secdef BOOLEAN;
  v_app_config TEXT;
  v_app_src TEXT;
  v_app_hash TEXT;
  v_app_unauth_grants INTEGER;
  v_app_auth_grants INTEGER;

  -- Object 3
  v_rej_oid OID;
  v_rej_ret TEXT;
  v_rej_secdef BOOLEAN;
  v_rej_config TEXT;
  v_rej_src TEXT;
  v_rej_hash TEXT;
  v_rej_unauth_grants INTEGER;
  v_rej_auth_grants INTEGER;

  -- PostgreSQL 17 verified MD5 hashes for Migration 000003:
  -- founder_approve_bank_transfer: 6ab47949fbe980cf21d5e995a6e042f6
  -- founder_reject_bank_transfer:  aaa7e1bf2de03709f4a1d8985944cece
  c_000003_APP_HASH CONSTANT TEXT := '6ab47949fbe980cf21d5e995a6e042f6';
  c_000003_REJ_HASH CONSTANT TEXT := 'aaa7e1bf2de03709f4a1d8985944cece';
BEGIN
  -- ===========================================================================
  -- 1. VERIFY RESTORED OBJECT 1: public.bank_transfers.id Default Expression
  -- ===========================================================================
  SELECT column_default INTO v_col_default
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'bank_transfers'
    AND column_name = 'id';

  IF v_col_default IS NULL THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 1]: Column bank_transfers.id does not exist or has NULL default.';
  END IF;

  v_col_default_clean := regexp_replace(v_col_default, '[[:space:]]+', '', 'g');

  IF v_col_default_clean IS DISTINCT FROM '(''trn-''::text||((EXTRACT(epochFROMnow()))::bigint)::text)' THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 1]: Restored default mismatch. Expected "(''trn-''::text || ((EXTRACT(epoch FROM now()))::bigint)::text)", Got: "%".', v_col_default;
  END IF;

  IF v_col_default ILIKE '%gen_random_uuid%' THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 1]: bank_transfers.id default still references gen_random_uuid().';
  END IF;

  -- ===========================================================================
  -- 2. VERIFY RESTORED OBJECT 2: public.founder_approve_bank_transfer(text, text)
  -- ===========================================================================
  v_app_oid := to_regprocedure('public.founder_approve_bank_transfer(text, text)');

  IF v_app_oid IS NULL THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 2]: Restored procedure public.founder_approve_bank_transfer(text, text) does not exist.';
  END IF;

  SELECT
    pg_get_function_result(p.oid),
    p.prosecdef,
    COALESCE(array_to_string(p.proconfig, ', '), ''),
    p.prosrc,
    md5(regexp_replace(regexp_replace(btrim(p.prosrc), '--[^\r\n]*', '', 'g'), '[[:space:]]+', ' ', 'g'))
  INTO
    v_app_ret,
    v_app_secdef,
    v_app_config,
    v_app_src,
    v_app_hash
  FROM pg_proc p
  WHERE p.oid = v_app_oid;

  IF v_app_ret IS DISTINCT FROM 'jsonb' THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 2]: Restored return type mismatch: "%"', v_app_ret;
  END IF;

  IF v_app_secdef IS NOT TRUE THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 2]: Restored function must be SECURITY DEFINER.';
  END IF;

  IF v_app_config IS NULL OR v_app_config NOT ILIKE '%search_path=public, pg_temp%' THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 2]: Restored search_path mismatch: "%"', v_app_config;
  END IF;

  IF v_app_hash IS DISTINCT FROM c_000003_APP_HASH THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 2]: Restored function body hash mismatch. Got: "%", Expected Migration 000003 hash: "%".', v_app_hash, c_000003_APP_HASH;
  END IF;

  IF v_app_src ILIKE '%FOR UPDATE%' OR v_app_src ILIKE '%lock_timeout%' OR v_app_src ILIKE '%lock_not_available%' THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 2]: Restored function still contains Migration 000004 locking logic.';
  END IF;

  SELECT COUNT(*) INTO v_app_unauth_grants
  FROM information_schema.routine_privileges
  WHERE routine_schema = 'public'
    AND routine_name = 'founder_approve_bank_transfer'
    AND grantee IN ('PUBLIC', 'anon')
    AND privilege_type = 'EXECUTE';

  IF v_app_unauth_grants IS NULL OR v_app_unauth_grants > 0 THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 2]: Restored function has unauthorized EXECUTE grant to PUBLIC or anon.';
  END IF;

  SELECT COUNT(*) INTO v_app_auth_grants
  FROM information_schema.routine_privileges
  WHERE routine_schema = 'public'
    AND routine_name = 'founder_approve_bank_transfer'
    AND grantee IN ('authenticated', 'service_role')
    AND privilege_type = 'EXECUTE';

  IF v_app_auth_grants IS NULL OR v_app_auth_grants < 2 THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 2]: Restored function is missing EXECUTE grant for authenticated or service_role.';
  END IF;

  -- ===========================================================================
  -- 3. VERIFY RESTORED OBJECT 3: public.founder_reject_bank_transfer(text, text)
  -- ===========================================================================
  v_rej_oid := to_regprocedure('public.founder_reject_bank_transfer(text, text)');

  IF v_rej_oid IS NULL THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 3]: Restored procedure public.founder_reject_bank_transfer(text, text) does not exist.';
  END IF;

  SELECT
    pg_get_function_result(p.oid),
    p.prosecdef,
    COALESCE(array_to_string(p.proconfig, ', '), ''),
    p.prosrc,
    md5(regexp_replace(regexp_replace(btrim(p.prosrc), '--[^\r\n]*', '', 'g'), '[[:space:]]+', ' ', 'g'))
  INTO
    v_rej_ret,
    v_rej_secdef,
    v_rej_config,
    v_rej_src,
    v_rej_hash
  FROM pg_proc p
  WHERE p.oid = v_rej_oid;

  IF v_rej_ret IS DISTINCT FROM 'jsonb' THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 3]: Restored return type mismatch: "%"', v_rej_ret;
  END IF;

  IF v_rej_secdef IS NOT TRUE THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 3]: Restored function must be SECURITY DEFINER.';
  END IF;

  IF v_rej_config IS NULL OR v_rej_config NOT ILIKE '%search_path=public, pg_temp%' THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 3]: Restored search_path mismatch: "%"', v_rej_config;
  END IF;

  IF v_rej_hash IS DISTINCT FROM c_000003_REJ_HASH THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 3]: Restored function body hash mismatch. Got: "%", Expected Migration 000003 hash: "%".', v_rej_hash, c_000003_REJ_HASH;
  END IF;

  IF v_rej_src ILIKE '%FOR UPDATE%' OR v_rej_src ILIKE '%lock_timeout%' OR v_rej_src ILIKE '%lock_not_available%' THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 3]: Restored function still contains Migration 000004 locking logic.';
  END IF;

  SELECT COUNT(*) INTO v_rej_unauth_grants
  FROM information_schema.routine_privileges
  WHERE routine_schema = 'public'
    AND routine_name = 'founder_reject_bank_transfer'
    AND grantee IN ('PUBLIC', 'anon')
    AND privilege_type = 'EXECUTE';

  IF v_rej_unauth_grants IS NULL OR v_rej_unauth_grants > 0 THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 3]: Restored function has unauthorized EXECUTE grant to PUBLIC or anon.';
  END IF;

  SELECT COUNT(*) INTO v_rej_auth_grants
  FROM information_schema.routine_privileges
  WHERE routine_schema = 'public'
    AND routine_name = 'founder_reject_bank_transfer'
    AND grantee IN ('authenticated', 'service_role')
    AND privilege_type = 'EXECUTE';

  IF v_rej_auth_grants IS NULL OR v_rej_auth_grants < 2 THEN
    RAISE EXCEPTION 'POSTCONDITION FAILED [Object 3]: Restored function is missing EXECUTE grant for authenticated or service_role.';
  END IF;

  RAISE NOTICE 'Comprehensive Postcondition Passed: ALL THREE objects successfully restored to exact Migration 000003 specifications.';
END;
$$;

COMMIT;


-- =============================================================================
-- SECTION C: POST-ROLLBACK AUDIT QUERIES (RUN AFTER ROLLBACK)
-- =============================================================================
/*
-- 1. Confirm column default restoration:
SELECT column_name, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bank_transfers'
  AND column_name = 'id';
-- Expected result: ('trn-'::text || ((EXTRACT(epoch FROM now()))::bigint)::text)

-- 2. Confirm removal of FOR UPDATE / lock_timeout and match Migration 000003 hashes:
SELECT
  p.oid::regprocedure AS function_identity,
  p.prosecdef AS is_security_definer,
  array_to_string(p.proconfig, ', ') AS runtime_config,
  md5(regexp_replace(regexp_replace(btrim(p.prosrc), '--[^\r\n]*', '', 'g'), '[[:space:]]+', ' ', 'g')) AS normalized_hash,
  CASE
    WHEN p.oid = 'public.founder_approve_bank_transfer(text, text)'::regprocedure
      AND md5(regexp_replace(regexp_replace(btrim(p.prosrc), '--[^\r\n]*', '', 'g'), '[[:space:]]+', ' ', 'g')) = '6ab47949fbe980cf21d5e995a6e042f6'
      THEN 'VERIFIED: Exact Migration 000003 Match'
    WHEN p.oid = 'public.founder_reject_bank_transfer(text, text)'::regprocedure
      AND md5(regexp_replace(regexp_replace(btrim(p.prosrc), '--[^\r\n]*', '', 'g'), '[[:space:]]+', ' ', 'g')) = 'aaa7e1bf2de03709f4a1d8985944cece'
      THEN 'VERIFIED: Exact Migration 000003 Match'
    ELSE 'DRIFT DETECTED'
  END AS status
FROM pg_proc p
WHERE p.oid IN (
  to_regprocedure('public.founder_approve_bank_transfer(text, text)'),
  to_regprocedure('public.founder_reject_bank_transfer(text, text)')
);

-- 3. Confirm permissions remain restricted to authenticated and service_role:
SELECT grantee, routine_name, privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name IN ('founder_approve_bank_transfer', 'founder_reject_bank_transfer')
ORDER BY routine_name, grantee;
-- Expected: Only 'authenticated' and 'service_role' (NO anon or PUBLIC)
*/
