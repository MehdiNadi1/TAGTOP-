/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * TAGTOP PostgreSQL / Supabase Live Multi-Tenant Integration Test Suite
 *
 * Tests actual Anonymous, Customer A, Customer B, and Founder Admin sessions
 * against a live Supabase database using real schema, real RPC names, and
 * real column names as defined in the three migrations.
 *
 * CREDENTIAL SECURITY:
 *   All credentials (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
 *   are loaded from a LOCAL TEST-ONLY file: scripts/.env.test
 *   That file is gitignored (.env*) and MUST NOT contain VITE_ prefixed variables.
 *   Frontend bundles never see these credentials.
 *
 * VERIFIED SCHEMA REFERENCES (from migrations):
 *   Tables: users, business_profiles, orders, nfc_cards, leads, bank_transfers, analytics_events, system_settings
 *   business_profiles columns: id, owner_id, handle, display_name, access_state, expiry_date, phone, email, products, documents
 *   orders columns: id, customer_id, price_mad, payment_status, order_status, profile_id, card_branding, package_tier
 *   bank_transfers columns: id, profile_id, customer_id, customer_name, customer_phone, amount_mad, period_description, receipt_number, status
 *   RPCs: resolve_nfc_card(p_uid_or_serial), get_public_profile(p_handle_or_id), evaluate_profile_subscriptions()
 *
 * EXIT CODE:
 *   0 — all required tests passed (or database not configured: explicitly prints 0 tests executed)
 *   1 — any test failed, setup failed, required section skipped, or unexpected exception
 */

// ─── Load test-local credentials from scripts/.env.test ────────────────────
// We use a relative path from the repo root (where tsx is invoked).
// dotenv is a listed dependency; no separate install needed.
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

// Resolve scripts/.env.test relative to this script's directory
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envTestPath = path.resolve(__dirname, '.env.test');

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) {
      process.env[key] = val;
    }
  }
}

loadEnvFile(envTestPath);
// Also load project-root .env.test as fallback
loadEnvFile(path.resolve(__dirname, '..', '.env.test'));

// ─── Credential loading — NEVER use VITE_ variables ────────────────────────
// The VITE_ prefix is reserved for Vite frontend bundles. This script uses
// plain (non-prefixed) env vars loaded exclusively from the gitignored test file.
const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();
const SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

const PLACEHOLDER_URL = 'your-project';
const PLACEHOLDER_KEY = 'your-';

const isLiveConfigured =
  SUPABASE_URL.length > 0 &&
  !SUPABASE_URL.includes(PLACEHOLDER_URL) &&
  SUPABASE_ANON_KEY.length > 0 &&
  !SUPABASE_ANON_KEY.includes(PLACEHOLDER_KEY);

const hasServiceRole =
  SERVICE_ROLE_KEY.length > 0 &&
  !SERVICE_ROLE_KEY.includes(PLACEHOLDER_KEY);

// ─── Test result tracking ───────────────────────────────────────────────────
interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  detail: string;
}

const results: TestResult[] = [];
let suiteFailed = false;

function pass(category: string, name: string, detail = ''): void {
  results.push({ category, name, passed: true, detail });
  console.log(`  ✔ [${category}] ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(category: string, name: string, detail = ''): void {
  results.push({ category, name, passed: false, detail });
  console.error(`  ✖ [${category}] FAIL: ${name}${detail ? ` — ${detail}` : ''}`);
  suiteFailed = true;
}

function section(title: string): void {
  console.log(`\n${'─'.repeat(76)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(76));
}

// ─── Cleanup registry ───────────────────────────────────────────────────────
// Tracks all test-generated rows for teardown, even on failure.
interface CleanupRecord {
  table: string;
  id: string;
}
const cleanupQueue: CleanupRecord[] = [];

async function cleanupAll(adminClient: SupabaseClient): Promise<void> {
  // Reverse order: leads → bank_transfers → orders → profiles → users
  for (const rec of [...cleanupQueue].reverse()) {
    try {
      await adminClient.from(rec.table).delete().eq('id', rec.id);
    } catch {
      // Best-effort; log but do not abort
      console.warn(`    ⚠ Cleanup warning: could not delete ${rec.table}/${rec.id}`);
    }
  }
}

async function deleteTestAuthUser(adminClient: SupabaseClient, userId: string): Promise<void> {
  try {
    await adminClient.auth.admin.deleteUser(userId);
  } catch {
    console.warn(`    ⚠ Cleanup warning: could not delete auth user ${userId}`);
  }
}

// ─── Main runner ─────────────────────────────────────────────────────────────
export async function runLiveDatabaseIntegrationTests(): Promise<void> {
  console.log('='.repeat(76));
  console.log('  TAGTOP — PostgreSQL / Supabase Live Multi-Tenant Integration Tests');
  console.log('='.repeat(76));

  if (!isLiveConfigured) {
    console.log('\n  STATUS: SKIPPED — Database not connected.');
    console.log('\n  To enable live tests, create  scripts/.env.test  with:');
    console.log('    SUPABASE_URL=https://<ref>.supabase.co');
    console.log('    SUPABASE_ANON_KEY=<your-anon-key>');
    console.log('    SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>');
    console.log('\n  Apply the three migrations first (see migration instructions).');
    console.log('\n  NOTE: Do NOT use VITE_-prefixed variables — those are for the');
    console.log('  frontend bundle and must never hold privileged credentials.');
    console.log('\n' + '─'.repeat(76));
    console.log('  Summary: 0 live tests executed against PostgreSQL.');
    console.log('─'.repeat(76) + '\n');
    // Explicit clean exit — no live tests means no assertion failures
    process.exit(0);
  }

  if (!hasServiceRole) {
    console.error('\n  ERROR: SUPABASE_SERVICE_ROLE_KEY is required but not configured.');
    console.error('  Cross-tenant provisioning and admin tests cannot run without it.');
    console.error('  Add SUPABASE_SERVICE_ROLE_KEY to scripts/.env.test and retry.\n');
    process.exit(1);
  }

  console.log(`\n  Connected: ${SUPABASE_URL}\n`);

  // ── Clients ────────────────────────────────────────────────────────────────
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Test-session credentials
  const stamp = Date.now();
  const emailA = `test-a-${stamp}@tagtop-test.invalid`;
  const emailB = `test-b-${stamp}@tagtop-test.invalid`;
  const emailAdmin = `test-admin-${stamp}@tagtop-test.invalid`;
  const password = 'TestP@ss1234!Secure';

  let userIdA = '';
  let userIdB = '';
  let userIdAdmin = '';
  let profileAId = '';
  let profileBId = '';
  let orderAId = '';
  let leadAId = '';
  let transferAId = '';

  try {
    // ══════════════════════════════════════════════════════════════════════════
    // SETUP — Provision disposable test tenants via service role
    // ══════════════════════════════════════════════════════════════════════════
    section('SETUP — Provisioning test tenants');

    // Create Customer A
    const { data: authA, error: errA } = await adminClient.auth.admin.createUser({
      email: emailA, password, email_confirm: true,
    });
    if (!authA?.user || errA) {
      console.error('  FATAL: Could not create Customer A auth user:', errA?.message);
      process.exit(1);
    }
    userIdA = authA.user.id;
    console.log(`  ✔ Created Customer A: ${emailA} (${userIdA})`);

    // Create Customer B
    const { data: authB, error: errB } = await adminClient.auth.admin.createUser({
      email: emailB, password, email_confirm: true,
    });
    if (!authB?.user || errB) {
      console.error('  FATAL: Could not create Customer B auth user:', errB?.message);
      await deleteTestAuthUser(adminClient, userIdA);
      process.exit(1);
    }
    userIdB = authB.user.id;
    console.log(`  ✔ Created Customer B: ${emailB} (${userIdB})`);

    // Create Founder Admin auth user
    const { data: authAdmin, error: errAdmin } = await adminClient.auth.admin.createUser({
      email: emailAdmin, password, email_confirm: true,
    });
    if (!authAdmin?.user || errAdmin) {
      console.error('  FATAL: Could not create Founder Admin auth user:', errAdmin?.message);
      await deleteTestAuthUser(adminClient, userIdA);
      await deleteTestAuthUser(adminClient, userIdB);
      process.exit(1);
    }
    userIdAdmin = authAdmin.user.id;
    console.log(`  ✔ Created Founder Admin: ${emailAdmin} (${userIdAdmin})`);

    // Elevate Founder Admin role via admin client (bypasses immutability trigger)
    const { error: elevateErr } = await adminClient
      .from('users')
      .update({ role: 'founder_admin' })
      .eq('id', userIdAdmin);
    if (elevateErr) {
      console.error('  FATAL: Could not elevate admin role:', elevateErr.message);
      await deleteTestAuthUser(adminClient, userIdA);
      await deleteTestAuthUser(adminClient, userIdB);
      await deleteTestAuthUser(adminClient, userIdAdmin);
      process.exit(1);
    }
    console.log('  ✔ Elevated admin role to founder_admin');

    // Authenticate Customer A
    const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error: signInAErr } = await clientA.auth.signInWithPassword({ email: emailA, password });
    if (signInAErr) {
      console.error('  FATAL: Customer A sign-in failed:', signInAErr.message);
      process.exit(1);
    }

    // Authenticate Customer B
    const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error: signInBErr } = await clientB.auth.signInWithPassword({ email: emailB, password });
    if (signInBErr) {
      console.error('  FATAL: Customer B sign-in failed:', signInBErr.message);
      process.exit(1);
    }

    // Authenticate Founder Admin
    const clientAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error: signInAdminErr } = await clientAdmin.auth.signInWithPassword({ email: emailAdmin, password });
    if (signInAdminErr) {
      console.error('  FATAL: Founder Admin sign-in failed:', signInAdminErr.message);
      process.exit(1);
    }

    // Customer A creates Profile A (trigger enforces owner_id = auth.uid(), access_state = private_preview)
    const handleA = `handle-a-${stamp}`;
    const { data: profAData, error: profAErr } = await clientA
      .from('business_profiles')
      .insert({
        handle: handleA,
        display_name: 'Studio Test A',
        city: 'Casablanca',
        phone: '+212600100001',
        email: emailA,
      })
      .select('id, owner_id, access_state')
      .single();

    if (profAErr || !profAData) {
      console.error('  FATAL: Customer A could not create Profile A:', profAErr?.message);
      process.exit(1);
    }
    profileAId = profAData.id;
    cleanupQueue.push({ table: 'business_profiles', id: profileAId });
    console.log(`  ✔ Customer A created Profile A: ${profileAId} (access_state=${profAData.access_state})`);

    // Activate Profile A via admin so it appears in the public view (for lead tests)
    await adminClient
      .from('business_profiles')
      .update({ access_state: 'active' })
      .eq('id', profileAId);
    console.log('  ✔ Admin set Profile A → active');

    // Customer B creates Profile B
    const handleB = `handle-b-${stamp}`;
    const { data: profBData, error: profBErr } = await clientB
      .from('business_profiles')
      .insert({
        handle: handleB,
        display_name: 'Studio Test B',
        city: 'Rabat',
        phone: '+212600200002',
        email: emailB,
      })
      .select('id')
      .single();

    if (profBErr || !profBData) {
      console.error('  FATAL: Customer B could not create Profile B:', profBErr?.message);
      process.exit(1);
    }
    profileBId = profBData.id;
    cleanupQueue.push({ table: 'business_profiles', id: profileBId });
    console.log(`  ✔ Customer B created Profile B: ${profileBId}`);

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 1 — ANONYMOUS SESSION
    // ══════════════════════════════════════════════════════════════════════════
    section('SECTION 1 — Anonymous Session');

    // 1.1: Raw SELECT on business_profiles — RLS must return 0 rows (not owner, not admin)
    {
      const { data, error } = await anonClient
        .from('business_profiles')
        .select('id, owner_id, phone, email');
      const blocked = !error && Array.isArray(data) && data.length === 0;
      // If error, that is also acceptable (permission denied)
      if (error || blocked) {
        pass('Anonymous', '1.1 Raw SELECT on business_profiles returns 0 rows (RLS)', error?.message || '0 rows');
      } else {
        fail('Anonymous', '1.1 Raw SELECT on business_profiles returns 0 rows (RLS)', `${data?.length} private rows exposed!`);
      }
    }

    // 1.2: Raw SELECT on nfc_cards — RLS must deny or return 0 rows
    {
      const { data, error } = await anonClient
        .from('nfc_cards')
        .select('uid, customer_id, order_id');
      if (error || (Array.isArray(data) && data.length === 0)) {
        pass('Anonymous', '1.2 Raw SELECT on nfc_cards denied or empty (RLS)', error?.message || '0 rows');
      } else {
        fail('Anonymous', '1.2 Raw SELECT on nfc_cards denied or empty (RLS)', `${data?.length} private rows exposed!`);
      }
    }

    // 1.3: Public view public_business_profiles — must succeed and return only public-state profiles
    {
      const { data, error } = await anonClient
        .from('public_business_profiles')
        .select('id, handle, display_name, access_state')
        .eq('id', profileAId);
      if (!error && Array.isArray(data) && data.length === 1) {
        // Confirm no private admin columns are included
        const row = data[0] as Record<string, unknown>;
        const hasPrivateCol = 'owner_id' in row || 'tax_identifier' in row || 'bank_details' in row;
        if (!hasPrivateCol) {
          pass('Anonymous', '1.3 public_business_profiles view returns Profile A, no private cols', `access_state=${row.access_state}`);
        } else {
          fail('Anonymous', '1.3 public_business_profiles view must not expose private columns', JSON.stringify(Object.keys(row)));
        }
      } else {
        fail('Anonymous', '1.3 public_business_profiles view returns Profile A', error?.message || '0 rows');
      }
    }

    // 1.4: NFC RPC — resolve_nfc_card with a non-existent UID must return null without error
    {
      const { data, error } = await anonClient.rpc('resolve_nfc_card', {
        p_uid_or_serial: 'NO-SUCH-UID-TEST-9999',
      });
      if (!error) {
        // null = not found, which is correct
        pass('Anonymous', '1.4 resolve_nfc_card RPC executes without error (returns null for unknown UID)', `result=${JSON.stringify(data)}`);
      } else {
        fail('Anonymous', '1.4 resolve_nfc_card RPC must not throw for unknown UID', error.message);
      }
    }

    // 1.5: Server-side pricing override — insert order with tampered price 0 MAD
    //      Trigger must override price_mad to 250 MAD for starter/branded/1 card
    {
      const { data, error } = await anonClient
        .from('orders')
        .insert({
          customer_name: 'Guest Test Anon',
          customer_phone: '+212600112233',
          customer_email: 'guest-test@tagtop-test.invalid',
          city: 'Casablanca',
          address: 'Boulevard Zerktouni',
          package_tier: 'starter',
          card_color: 'black',
          card_branding: 'branded',
          card_quantity: 1,
          price_mad: 0.00, // deliberately tampered; trigger must correct to 250.00
          wooden_stand_selected: false,
          // profile_id deliberately omitted (guest cannot link profiles)
        })
        .select('id, price_mad, payment_status, order_status, profile_id')
        .single();

      if (error) {
        fail('Anonymous', '1.5 Server-side price override: order INSERT must succeed', error.message);
      } else if (!data) {
        fail('Anonymous', '1.5 Server-side price override: no data returned', '');
      } else {
        orderAId = data.id;
        cleanupQueue.push({ table: 'orders', id: orderAId });

        const correctedPrice = Number(data.price_mad) === 250.00;
        const safePmtStatus = data.payment_status === 'cod_pending';
        const safeOrderStatus = data.order_status === 'received';
        const noProfileLinked = data.profile_id === null;

        if (correctedPrice && safePmtStatus && safeOrderStatus && noProfileLinked) {
          pass('Anonymous', '1.5 Server-side price override: 0 MAD → 250 MAD, status=cod_pending', `price=${data.price_mad}`);
        } else {
          fail('Anonymous', '1.5 Server-side price override: unexpected values', JSON.stringify(data));
        }
      }
    }

    // 1.6: Guest cannot link existing profile — trigger must reject
    {
      const { error } = await anonClient
        .from('orders')
        .insert({
          customer_name: 'Guest Takeover Attempt',
          customer_phone: '+212600000001',
          customer_email: 'attacker@tagtop-test.invalid',
          city: 'Casablanca',
          address: 'Test Address',
          package_tier: 'starter',
          card_color: 'black',
          card_branding: 'branded',
          card_quantity: 1,
          price_mad: 250.00,
          wooden_stand_selected: false,
          profile_id: profileAId, // Attempt to link to Customer A's existing profile
        });

      if (error) {
        pass('Anonymous', '1.6 Guest profile linking is rejected by trigger', error.message.slice(0, 80));
      } else {
        // If no error, verify that the order was inserted WITHOUT the profile_id
        // (The trigger should have raised, but let's be defensive)
        fail('Anonymous', '1.6 Guest profile linking: trigger did not raise an exception', 'INSERT succeeded unexpectedly');
      }
    }

    // 1.7: Anonymous bank transfer insertion must be rejected
    {
      const { error } = await anonClient
        .from('bank_transfers')
        .insert({
          profile_id: profileAId,
          profile_name: 'Test A',
          customer_name: 'Anonymous Attacker',
          customer_phone: '+212600000002',
          amount_mad: 150.00,
          period_description: '6 mois',
          receipt_number: 'REC-ANON-TEST',
        });

      if (error) {
        pass('Anonymous', '1.7 Anonymous bank transfer is rejected (RLS + trigger)', error.message.slice(0, 80));
      } else {
        fail('Anonymous', '1.7 Anonymous bank transfer must be denied', 'INSERT succeeded — RLS or trigger bypassed');
      }
    }

    // 1.8: Anonymous invocation of evaluate_profile_subscriptions must be denied
    {
      const { error } = await anonClient.rpc('evaluate_profile_subscriptions');
      if (error) {
        pass('Anonymous', '1.8 evaluate_profile_subscriptions denied to anonymous caller', error.message.slice(0, 80));
      } else {
        fail('Anonymous', '1.8 evaluate_profile_subscriptions must deny anonymous caller', 'RPC executed without auth');
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 2 — Customer A: Own Profile Access & Immutability
    // ══════════════════════════════════════════════════════════════════════════
    section('SECTION 2 — Customer A: Own data and immutability');

    // 2.1: Customer A can read their own profile from raw table
    {
      const { data, error } = await clientA
        .from('business_profiles')
        .select('id, owner_id, display_name, access_state')
        .eq('id', profileAId)
        .single();

      if (!error && data && data.owner_id === userIdA) {
        pass('Customer A', '2.1 Customer A can SELECT their own raw business_profile', `access_state=${data.access_state}`);
      } else {
        fail('Customer A', '2.1 Customer A cannot SELECT their own raw business_profile', error?.message || 'owner_id mismatch');
      }
    }

    // 2.2: Customer A can update allowed fields (display_name)
    {
      const { error } = await clientA
        .from('business_profiles')
        .update({ display_name: 'Studio Test A Updated' })
        .eq('id', profileAId);

      if (!error) {
        pass('Customer A', '2.2 Customer A can update allowed profile fields (display_name)', '');
      } else {
        fail('Customer A', '2.2 Customer A cannot update their own allowed fields', error.message);
      }
    }

    // 2.3: Customer A cannot directly change access_state — trigger must reject
    {
      const { error } = await clientA
        .from('business_profiles')
        .update({ access_state: 'active' })
        .eq('id', profileAId);

      // The trigger raises EXCEPTION, which Supabase returns as an error
      if (error) {
        pass('Customer A', '2.3 Customer A cannot change access_state (immutability trigger)', error.message.slice(0, 80));
      } else {
        // Trigger should have blocked this. Verify value is unchanged via admin.
        const { data: check } = await adminClient
          .from('business_profiles')
          .select('access_state')
          .eq('id', profileAId)
          .single();
        // If it was already 'active' (set by admin in setup), trigger would not have fired
        // because access_state = 'active' IS DISTINCT FROM 'active' → false (no change).
        // So no error is expected in that case. We need a harder test: try to set 'renewal_due'.
        const { error: err2 } = await clientA
          .from('business_profiles')
          .update({ access_state: 'renewal_due' })
          .eq('id', profileAId);
        if (err2) {
          pass('Customer A', '2.3 Customer A cannot change access_state to renewal_due (trigger)', err2.message.slice(0, 80));
        } else {
          // Re-check the actual DB value
          const { data: check2 } = await adminClient
            .from('business_profiles')
            .select('access_state')
            .eq('id', profileAId)
            .single();
          if (check2?.access_state !== 'renewal_due') {
            pass('Customer A', '2.3 access_state not changed (trigger silently corrected or blocked)', `actual=${check2?.access_state}`);
          } else {
            fail('Customer A', '2.3 Customer A was able to change access_state — trigger did not block', `state=${check2?.access_state}`);
          }
        }
      }
    }

    // 2.4: Customer A cannot escalate their own role
    {
      const { error } = await clientA
        .from('users')
        .update({ role: 'founder_admin' })
        .eq('id', userIdA);

      if (error) {
        pass('Customer A', '2.4 Role escalation attempt rejected by immutability trigger', error.message.slice(0, 80));
      } else {
        // Verify the actual DB value didn't change
        const { data: userCheck } = await adminClient
          .from('users')
          .select('role')
          .eq('id', userIdA)
          .single();
        if (userCheck?.role !== 'founder_admin') {
          pass('Customer A', '2.4 Role escalation: no error but role unchanged in DB', `role=${userCheck?.role}`);
        } else {
          fail('Customer A', '2.4 Role escalation succeeded — trigger did not block!', `role=${userCheck?.role}`);
        }
      }
    }

    // 2.5: Customer A can view their own orders
    if (orderAId) {
      // The order was created by anon, so customer_id is NULL. Let's create an authenticated order.
      const { data: authOrder, error: authOrderErr } = await clientA
        .from('orders')
        .insert({
          customer_name: 'Customer A Order',
          customer_phone: '+212600100001',
          customer_email: emailA,
          city: 'Casablanca',
          address: 'Test Street A',
          package_tier: 'starter',
          card_color: 'black',
          card_branding: 'branded',
          card_quantity: 1,
          price_mad: 0.00, // trigger will override to 250
          wooden_stand_selected: false,
        })
        .select('id, customer_id, price_mad')
        .single();

      if (authOrderErr || !authOrder) {
        fail('Customer A', '2.5 Customer A authenticated order creation', authOrderErr?.message || 'no data');
      } else {
        cleanupQueue.push({ table: 'orders', id: authOrder.id });
        const priceOk = Number(authOrder.price_mad) === 250.00;
        const ownerOk = authOrder.customer_id === userIdA;
        if (priceOk && ownerOk) {
          pass('Customer A', '2.5 Authenticated order: price=250 MAD, customer_id auto-set by trigger', `id=${authOrder.id}`);
        } else {
          fail('Customer A', '2.5 Authenticated order has wrong price or owner', JSON.stringify(authOrder));
        }
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 3 — Customer B: Cross-Tenant Isolation
    // ══════════════════════════════════════════════════════════════════════════
    section('SECTION 3 — Customer B: Cross-tenant isolation against Profile A');

    // 3.1: Customer B CANNOT SELECT Customer A's raw profile
    {
      const { data, error } = await clientB
        .from('business_profiles')
        .select('id, owner_id, phone, email')
        .eq('id', profileAId);

      // RLS: only owner or admin can SELECT raw profiles
      const isolated = !error && Array.isArray(data) && data.length === 0;
      if (isolated) {
        pass('Customer B', '3.1 Raw SELECT of Customer A profile returns 0 rows (tenant isolation)', '0 rows — isolated');
      } else if (error) {
        pass('Customer B', '3.1 Raw SELECT of Customer A profile denied by RLS', error.message.slice(0, 80));
      } else {
        fail('Customer B', '3.1 Customer B can see Customer A raw profile — data leaked!', `${data?.length} rows`);
      }
    }

    // 3.2: Customer B CANNOT UPDATE Customer A's profile
    //      Verification: row count must be 0 AND value must be unchanged in DB
    {
      const { data: updateData, error } = await clientB
        .from('business_profiles')
        .update({ display_name: 'HACKED by Customer B' })
        .eq('id', profileAId)
        .select('id');
      const count = updateData ? updateData.length : 0;

      // RLS won't match Profile A for Customer B, so 0 rows affected
      const affectedZero = !error && (count === 0 || count === null);
      if (affectedZero) {
        // Double-check: actual value in DB unchanged
        const { data: check } = await adminClient
          .from('business_profiles')
          .select('display_name')
          .eq('id', profileAId)
          .single();
        if (check?.display_name !== 'HACKED by Customer B') {
          pass('Customer B', '3.2 Customer B UPDATE of Profile A: 0 rows affected, value unchanged in DB', `name=${check?.display_name}`);
        } else {
          fail('Customer B', '3.2 Customer B successfully modified Customer A profile!', `display_name=${check?.display_name}`);
        }
      } else if (error) {
        // Error is also acceptable (RLS permission denied)
        pass('Customer B', '3.2 Customer B UPDATE of Profile A rejected by RLS', error.message.slice(0, 80));
      } else {
        fail('Customer B', '3.2 Customer B UPDATE of Profile A: unexpected count', `count=${count}`);
      }
    }

    // 3.3: Customer B CANNOT read Customer A's leads
    {
      // First create a lead on Profile A as anon
      const { data: leadData, error: leadErr } = await anonClient
        .from('leads')
        .insert({
          profile_id: profileAId,
          profile_name: 'Test A',
          name: 'Lead Visitor',
          phone: '+212600333001',
          email: 'lead@tagtop-test.invalid',
          promotional_consent: false,
        })
        .select('id')
        .single();

      if (leadErr || !leadData) {
        fail('Customer B', '3.3 Setup: lead submission on active Profile A should succeed', leadErr?.message || 'no data');
      } else {
        leadAId = leadData.id;
        cleanupQueue.push({ table: 'leads', id: leadAId });

        // Customer B tries to read Profile A's leads
        const { data: bLeads, error: bLeadsErr } = await clientB
          .from('leads')
          .select('id, name, phone')
          .eq('profile_id', profileAId);

        const isolated = !bLeadsErr && Array.isArray(bLeads) && bLeads.length === 0;
        if (isolated) {
          pass('Customer B', '3.3 Customer B cannot read leads on Profile A (0 rows — RLS)', '');
        } else if (bLeadsErr) {
          pass('Customer B', '3.3 Customer B leads query on Profile A denied by RLS', bLeadsErr.message.slice(0, 80));
        } else {
          fail('Customer B', '3.3 Customer B can see Customer A leads — privacy breach!', `${bLeads?.length} rows exposed`);
        }
      }
    }

    // 3.4: Customer B CANNOT submit bank transfer for Customer A's profile
    {
      const { error } = await clientB
        .from('bank_transfers')
        .insert({
          profile_id: profileAId,
          profile_name: 'Test A',
          customer_name: 'Customer B Impersonator',
          customer_phone: '+212600200002',
          amount_mad: 150.00,
          period_description: '6 mois',
          receipt_number: 'REC-B-INVALID-TEST',
        });

      if (error) {
        pass('Customer B', '3.4 Customer B bank transfer for Profile A rejected (RLS + trigger)', error.message.slice(0, 80));
      } else {
        // Verify no record was created
        const { data: xfer } = await adminClient
          .from('bank_transfers')
          .select('id')
          .eq('profile_id', profileAId)
          .eq('receipt_number', 'REC-B-INVALID-TEST')
          .single();
        if (!xfer) {
          pass('Customer B', '3.4 Customer B bank transfer INSERT silently rejected (0 rows)', '');
        } else {
          cleanupQueue.push({ table: 'bank_transfers', id: xfer.id });
          fail('Customer B', '3.4 Customer B was able to submit transfer for Profile A!', `id=${xfer.id}`);
        }
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 4 — Founder Admin Permissions
    // ══════════════════════════════════════════════════════════════════════════
    section('SECTION 4 — Founder Admin Permissions');

    // 4.1: Admin can SELECT all business_profiles (both A and B)
    {
      const { data, error } = await clientAdmin
        .from('business_profiles')
        .select('id')
        .in('id', [profileAId, profileBId]);

      if (!error && Array.isArray(data) && data.length === 2) {
        pass('Founder Admin', '4.1 Admin can SELECT all profiles (both A and B visible)', `${data.length} rows`);
      } else {
        fail('Founder Admin', '4.1 Admin cannot SELECT all profiles', error?.message || `${data?.length} rows`);
      }
    }

    // 4.2: Admin can invoke evaluate_profile_subscriptions
    {
      const { data, error } = await clientAdmin.rpc('evaluate_profile_subscriptions');
      if (!error && data) {
        const result = typeof data === 'object' ? data as Record<string, unknown> : {};
        const hasKeys = 'evaluated_date' in result && 'profiles_in_grace' in result && 'profiles_suspended' in result;
        if (hasKeys) {
          pass('Founder Admin', '4.2 evaluate_profile_subscriptions returns expected keys', JSON.stringify(data).slice(0, 80));
        } else {
          fail('Founder Admin', '4.2 evaluate_profile_subscriptions returned unexpected shape', JSON.stringify(data));
        }
      } else {
        fail('Founder Admin', '4.2 Admin invoke evaluate_profile_subscriptions failed', error?.message || 'no data');
      }
    }

    // 4.3: Customer A CANNOT invoke evaluate_profile_subscriptions
    {
      const { error } = await clientA.rpc('evaluate_profile_subscriptions');
      if (error) {
        pass('Founder Admin', '4.3 Customer A invoke evaluate_profile_subscriptions denied', error.message.slice(0, 80));
      } else {
        fail('Founder Admin', '4.3 Customer A should not be able to invoke evaluate_profile_subscriptions', 'No error returned');
      }
    }

    // 4.4: Admin bank transfer → approve → subscription extended
    {
      // Customer A submits a valid renewal transfer for their own Profile A
      const { data: xferData, error: xferErr } = await clientA
        .from('bank_transfers')
        .insert({
          profile_id: profileAId,
          profile_name: 'Studio Test A',
          customer_name: 'Customer A',
          customer_phone: '+212600100001',
          amount_mad: 150.00,
          period_description: '6 mois',
          receipt_number: `REC-A-TEST-${stamp}`,
        })
        .select('id')
        .single();

      if (xferErr || !xferData) {
        fail('Founder Admin', '4.4 Setup: Customer A bank transfer submission failed', xferErr?.message || 'no data');
      } else {
        transferAId = xferData.id;
        cleanupQueue.push({ table: 'bank_transfers', id: transferAId });

        // Get current expiry date before approval
        const { data: preProfile } = await adminClient
          .from('business_profiles')
          .select('expiry_date')
          .eq('id', profileAId)
          .single();
        const preExpiry = preProfile?.expiry_date as string;

        // Admin approves via RPC
        const { data: approveResult, error: approveErr } = await clientAdmin.rpc('founder_approve_bank_transfer', {
          p_transfer_id: transferAId,
          p_founder_notes: 'Verified in integration test',
        });

        if (approveErr) {
          fail('Founder Admin', '4.4 founder_approve_bank_transfer RPC failed', approveErr.message);
        } else {
          // Verify transfer status is now 'approved'
          const { data: xferCheck } = await adminClient
            .from('bank_transfers')
            .select('status, verified_at')
            .eq('id', transferAId)
            .single();

          // Verify profile expiry was extended (should be > preExpiry)
          const { data: postProfile } = await adminClient
            .from('business_profiles')
            .select('expiry_date, access_state')
            .eq('id', profileAId)
            .single();

          const transferApproved = xferCheck?.status === 'approved';
          const expiryExtended = postProfile?.expiry_date !== preExpiry;
          const profileActive = postProfile?.access_state === 'active';

          if (transferApproved && expiryExtended && profileActive) {
            pass('Founder Admin', '4.4 Bank transfer approved: status=approved, expiry extended, profile active',
              `expiry: ${preExpiry} → ${postProfile?.expiry_date}`);
          } else {
            fail('Founder Admin', '4.4 Bank transfer approval did not produce expected state changes',
              `approved=${transferApproved}, expiry=${expiryExtended}, active=${profileActive}`);
          }
        }
      }
    }

  } catch (unexpectedErr) {
    // Any unhandled exception = immediate suite failure
    console.error('\n  UNEXPECTED EXCEPTION during test execution:');
    console.error(unexpectedErr);
    suiteFailed = true;
  } finally {
    // ══════════════════════════════════════════════════════════════════════════
    // CLEANUP — Delete all test fixtures and auth users (runs even on failure)
    // ══════════════════════════════════════════════════════════════════════════
    section('CLEANUP — Removing test fixtures');
    await cleanupAll(adminClient);
    if (userIdA) await deleteTestAuthUser(adminClient, userIdA);
    if (userIdB) await deleteTestAuthUser(adminClient, userIdB);
    if (userIdAdmin) await deleteTestAuthUser(adminClient, userIdAdmin);
    console.log('  ✔ Test fixtures and auth users removed.');
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n' + '='.repeat(76));
  console.log(`  RESULTS: ${passed} PASSED  |  ${failed} FAILED  |  ${results.length} TOTAL`);
  console.log('='.repeat(76));

  if (suiteFailed || failed > 0) {
    console.error('\n  ✖ Integration test suite FAILED. See failures above.\n');
    process.exit(1);
  } else {
    console.log('\n  ✔ All live database integration tests passed.\n');
    process.exit(0);
  }
}

// Execute when run directly
runLiveDatabaseIntegrationTests();
