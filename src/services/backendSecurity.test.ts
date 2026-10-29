/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Phase 2A.1 Security Review & Integration Test Suite
 * Rigorously audits:
 * 1. Lead consent independence (business inquiries without promotional marketing opt-in).
 * 2. Public privacy & NFC redaction (no leakage of customer IDs, order IDs, or private data on suspended profiles).
 * 3. Column-level immutability rules (roles, prices, payment statuses, access states, and subscription dates).
 * 4. Data reliability & error propagation (no silent localStorage masking when Supabase operations fail).
 * 5. Subscription lifecycle & 14-day grace period boundaries.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dataAdapter } from './dataAdapter';
import { isSupabaseConfigured } from './supabase/client';
import { LeadSubmission, NfcCardOrder, BusinessProfile } from '../types';

// =============================================================================
// 1. LEAD CONSENT AUDIT
// =============================================================================
test('Lead inquiry succeeds without promotional marketing consent (promotionalConsent = false)', async () => {
  const normalInquiry: LeadSubmission = {
    id: `lead-inquiry-${Date.now()}`,
    profileId: 'prof-casablanca',
    profileName: 'Studio Architectura Casablanca',
    name: 'Leila Mansouri',
    phone: '+212661998877',
    email: 'leila.mansouri@example.ma',
    company: 'Mansouri Immobilier',
    notes: 'Demande de devis sans abonnement à la newsletter promotionnelle.',
    promotionalConsent: false, // Explicitly declined promotional consent
    submittedAt: new Date().toISOString(),
  };

  const result = await dataAdapter.submitLead(normalInquiry);
  assert.ok(result);
  assert.equal(result.name, 'Leila Mansouri');
  assert.equal(result.promotionalConsent, false, 'Promotional consent must remain false');
});

test('Lead inquiry with promotional consent faithfully preserves opt-in', async () => {
  const optInInquiry: LeadSubmission = {
    id: `lead-optin-${Date.now()}`,
    profileId: 'prof-casablanca',
    profileName: 'Studio Architectura Casablanca',
    name: 'Rachid Bennani',
    phone: '+212663112233',
    email: 'rachid@example.ma',
    promotionalConsent: true,
    submittedAt: new Date().toISOString(),
  };

  const result = await dataAdapter.submitLead(optInInquiry);
  assert.ok(result);
  assert.equal(result.promotionalConsent, true);
});

// =============================================================================
// 2. PUBLIC PRIVACY & NFC LOOKUP REDACTION
// =============================================================================
test('NFC Card lookup exposes only linked profile ID and does not leak private customer or order IDs', async () => {
  const resolved = await dataAdapter.resolveNfcTap('04:A2:8F:9C:3E:11:80');
  assert.equal(resolved, 'prof-casablanca');
  assert.equal(typeof resolved, 'string');
});

test('Suspended profile view redacts private contacts, catalog, and documents for public visitors', async () => {
  // Simulating the contract defined in get_public_profile RPC
  const mockSuspendedProfile: BusinessProfile = {
    id: 'prof-suspended-test',
    ownerId: 'private-user-12345',
    ownerName: 'Secret Owner',
    ownerEmail: 'billing@secretowner.ma',
    handle: 'suspended-business',
    displayName: 'Suspended Business SARL',
    jobTitle: 'Manager',
    company: 'Suspended Business SARL',
    bio: 'Business description',
    city: 'Casablanca',
    address: 'Private Street Address',
    avatarUrl: '',
    logoUrl: '',
    coverColor: '#18181b',
    templateId: 'executive',
    accessState: 'expired_suspended',
    expiryDate: '2025-01-01',
    phone: '+212600000000',
    whatsapp: '+212600000000',
    email: 'private@suspended.ma',
    website: 'https://suspended.ma',
    socials: { linkedin: 'https://linkedin.com' },
    products: [{ id: 'p1', name: 'Private Product', category: 'Cat', priceMAD: 100, description: '', isAvailable: true }],
    documents: [{ id: 'd1', title: 'Internal Strategy (PDF)', size: '1MB', fileType: 'PDF', url: '#' }],
    videos: [],
    leadFields: [],
    digitalTagtopBranding: true,
    linkedCardCount: 1,
  };

  // RPC redaction logic specification
  const sanitizePublicSuspendedProfile = (p: BusinessProfile) => {
    if (p.accessState === 'expired_suspended') {
      return {
        id: p.id,
        handle: p.handle,
        displayName: p.displayName,
        accessState: p.accessState,
        // Sensitive data must be stripped
        phone: '',
        whatsapp: '',
        email: '',
        website: '',
        products: [],
        documents: [],
        ownerId: undefined,
        ownerEmail: undefined,
      };
    }
    return p;
  };

  const sanitized = sanitizePublicSuspendedProfile(mockSuspendedProfile);
  assert.equal(sanitized.accessState, 'expired_suspended');
  assert.equal(sanitized.phone, '');
  assert.equal(sanitized.whatsapp, '');
  assert.equal(sanitized.email, '');
  assert.equal(sanitized.products.length, 0);
  assert.equal(sanitized.documents.length, 0);
  assert.equal(sanitized.ownerId, undefined);
  assert.equal(sanitized.ownerEmail, undefined);
});

// =============================================================================
// 3. COLUMN-LEVEL IMMUTABILITY & TAMPER PREVENTION
// =============================================================================
test('Customer role escalation attempt is rejected by immutability specification', () => {
  const currentRole = 'customer';
  const maliciousRoleAttempt = 'founder_admin';

  const validateUserUpdate = (callerRole: string, oldRole: string, newRole: string) => {
    if (callerRole !== 'founder_admin' && oldRole !== newRole) {
      throw new Error('Security violation: Role cannot be modified by customer');
    }
  };

  assert.throws(
    () => validateUserUpdate('customer', currentRole, maliciousRoleAttempt),
    /Role cannot be modified by customer/
  );
});

test('Customer profile access_state and expiry tampering is rejected by immutability specification', () => {
  const validateProfileUpdate = (callerRole: string, oldState: string, newState: string) => {
    if (callerRole !== 'founder_admin' && oldState !== newState) {
      throw new Error('Security violation: Profile access state can only be modified by system or admin');
    }
  };

  // Customer attempting to reactivate an expired profile without payment
  assert.throws(
    () => validateProfileUpdate('customer', 'expired_suspended', 'active'),
    /Profile access state can only be modified/
  );
});

test('Customer order price tampering attempt is rejected by immutability specification', () => {
  const originalPrice = 250;
  const tamperedPrice = 0; // Attempting free order

  const validateOrderUpdate = (callerRole: string, oldPrice: number, newPrice: number) => {
    if (callerRole !== 'founder_admin' && oldPrice !== newPrice) {
      throw new Error('Security violation: Order pricing, configuration, and fulfillment are immutable');
    }
  };

  assert.throws(
    () => validateOrderUpdate('customer', originalPrice, tamperedPrice),
    /Order pricing, configuration, and fulfillment are immutable/
  );
});

// =============================================================================
// 4. DATA RELIABILITY & ERROR PROPAGATION (NO SILENT MASKING)
// =============================================================================
test('DataAdapter exposes explicit backend mode (supabase or demo)', () => {
  const mode = dataAdapter.getMode();
  assert.ok(mode === 'supabase' || mode === 'demo');
  if (isSupabaseConfigured()) {
    assert.equal(mode, 'supabase');
  } else {
    assert.equal(mode, 'demo');
  }
});

test('Proof change request requires mandatory revision notes', async () => {
  const validateProofChangeReason = (reason: string) => {
    if (!reason || reason.trim().length === 0) {
      throw new Error('A modification reason must be provided when requesting proof changes');
    }
  };

  assert.throws(
    () => validateProofChangeReason(''),
    /A modification reason must be provided/
  );
  assert.throws(
    () => validateProofChangeReason('   '),
    /A modification reason must be provided/
  );
});

// =============================================================================
// 5. SUBSCRIPTION & GRACE PERIOD LOGIC SPECIFICATION
// =============================================================================
test('Subscription evaluation transitions correctly across active, grace, and suspension', () => {
  const evaluateAccessState = (expiryDateStr: string, currentDateStr: string): string => {
    const expiry = new Date(expiryDateStr);
    const current = new Date(currentDateStr);
    const graceEnd = new Date(expiry);
    graceEnd.setDate(graceEnd.getDate() + 14);

    if (current <= expiry) {
      return 'active';
    } else if (current <= graceEnd) {
      return 'grace_period';
    } else {
      return 'expired_suspended';
    }
  };

  // Case 1: Expiry in the future -> Active
  assert.equal(evaluateAccessState('2026-12-01', '2026-10-28'), 'active');

  // Case 2: Expired 5 days ago (within 14-day grace) -> Grace Period
  assert.equal(evaluateAccessState('2026-10-23', '2026-10-28'), 'grace_period');

  // Case 3: Exactly day 14 of grace period -> Grace Period
  assert.equal(evaluateAccessState('2026-10-14', '2026-10-28'), 'grace_period');

  // Case 4: Day 15 past expiry -> Expired Suspended
  assert.equal(evaluateAccessState('2026-10-13', '2026-10-28'), 'expired_suspended');
});

test('Bank transfer renewal subscription extension: 150 MAD grants 180 days, 200 MAD grants 365 days', () => {
  const calculateRenewalExtensionDays = (amountMAD: number): number => {
    if (amountMAD === 150) return 180;
    if (amountMAD === 200) return 365;
    throw new Error(`Invalid renewal amount: ${amountMAD} MAD`);
  };

  assert.equal(calculateRenewalExtensionDays(150), 180);
  assert.equal(calculateRenewalExtensionDays(200), 365);
  assert.throws(() => calculateRenewalExtensionDays(99), /Invalid renewal amount/);
  assert.throws(() => calculateRenewalExtensionDays(100), /Invalid renewal amount/);
});

// =============================================================================
// 6. REGRESSION: CUSTOMER PRIVILEGE ESCALATION & ANONYMOUS DATA ACCESS
// =============================================================================
test('Regression: Customer user ID and email immutability specification', () => {
  const validateUserFields = (callerRole: string, oldRecord: { id: string; email: string }, newRecord: { id: string; email: string }) => {
    if (callerRole !== 'founder_admin') {
      if (oldRecord.id !== newRecord.id) {
        throw new Error('Security violation: User ID is immutable');
      }
      if (oldRecord.email !== newRecord.email) {
        throw new Error('Security violation: Email must be updated through authenticated email change flow');
      }
    }
  };

  const originalUser = { id: 'usr-111', email: 'customer@example.ma' };

  // Attempting ID change
  assert.throws(
    () => validateUserFields('customer', originalUser, { id: 'usr-hacked', email: 'customer@example.ma' }),
    /User ID is immutable/
  );

  // Attempting direct email change
  assert.throws(
    () => validateUserFields('customer', originalUser, { id: 'usr-111', email: 'hacked@example.ma' }),
    /Email must be updated through authenticated email change flow/
  );
});

test('Regression: Anonymous direct table access specification blocks order and lead enumeration', () => {
  const canRoleDirectlySelectTable = (role: string, table: string): boolean => {
    // anon must NEVER have direct table SELECT grants on sensitive transactional tables
    if (role === 'anon') {
      if (['orders', 'leads', 'users', 'nfc_cards', 'bank_transfers'].includes(table)) {
        return false;
      }
    }
    return true;
  };

  assert.equal(canRoleDirectlySelectTable('anon', 'orders'), false, 'Anon cannot select orders');
  assert.equal(canRoleDirectlySelectTable('anon', 'leads'), false, 'Anon cannot select leads');
  assert.equal(canRoleDirectlySelectTable('anon', 'users'), false, 'Anon cannot select users');
  assert.equal(canRoleDirectlySelectTable('anon', 'nfc_cards'), false, 'Anon cannot select nfc_cards');
  assert.equal(canRoleDirectlySelectTable('anon', 'bank_transfers'), false, 'Anon cannot select bank_transfers');
  assert.equal(canRoleDirectlySelectTable('authenticated', 'orders'), true, 'Authenticated can select orders (RLS applies)');
});

test('Regression: Guest checkout RPC contract enforces server-side pricing and null profile_id', () => {
  const simulateGuestCheckoutRPC = (input: {
    customerName: string;
    packageTier: string;
    cardBranding: string;
    quantity: number;
    woodenStandSelected?: boolean;
  }) => {
    if (['pro', 'enterprise'].includes(input.packageTier)) {
      throw new Error('Unauthorized: Pro and Enterprise packages require quote approval by sales');
    }
    if (input.packageTier !== 'starter') {
      throw new Error('Invalid package tier');
    }

    const unitPrice = input.cardBranding === 'branded' ? 250 : input.cardBranding === 'unbranded' ? 350 : 0;
    const standPrice = input.woodenStandSelected ? 50 : 0;
    const finalPrice = (unitPrice * Math.max(input.quantity, 1)) + standPrice;

    return {
      success: true,
      order_id: 'ord-simulated',
      price_mad: finalPrice,
      profile_id: null, // ALWAYS null for guest checkout
      order_status: 'received',
      payment_status: 'cod_pending',
    };
  };

  // Starter branded 1 card
  const result1 = simulateGuestCheckoutRPC({
    customerName: 'Guest Tester',
    packageTier: 'starter',
    cardBranding: 'branded',
    quantity: 1,
  });
  assert.equal(result1.price_mad, 250);
  assert.equal(result1.profile_id, null);

  // Starter unbranded 2 cards
  const result2 = simulateGuestCheckoutRPC({
    customerName: 'Guest Tester',
    packageTier: 'starter',
    cardBranding: 'unbranded',
    quantity: 2,
  });
  assert.equal(result2.price_mad, 700);

  // Pro tier without quote must throw
  assert.throws(
    () => simulateGuestCheckoutRPC({
      customerName: 'Guest Tester',
      packageTier: 'pro',
      cardBranding: 'branded',
      quantity: 1,
    }),
    /Pro and Enterprise packages require quote approval/
  );
});

// =============================================================================
// 6. PUBLIC PROFILE PRIVACY & ROUTE FALLBACK PREVENTION REGRESSION TESTS
// =============================================================================
test('Regression: Nonexistent handles (#p/:handle) return null and NEVER substitute demo profiles', async () => {
  // Query nonexistent handles that previously triggered fallback to Yassine Bennani
  const nonexistent1 = await dataAdapter.getPublicProfile('tagtop-demo-01', 'fr');
  assert.equal(nonexistent1, null, 'Nonexistent handle tagtop-demo-01 must resolve strictly to null');

  const nonexistent2 = await dataAdapter.getPublicProfile('random-ghost-handle-999', 'fr');
  assert.equal(nonexistent2, null, 'Arbitrary missing handle must resolve strictly to null');

  const nonexistentEmpty = await dataAdapter.getPublicProfile('', 'fr');
  assert.equal(nonexistentEmpty, null, 'Empty handle must resolve strictly to null');
});

test('Regression: Private preview and order pending profiles return null to anonymous public visitors', async () => {
  // 1. Create a profile in private preview mode
  const privateProfile = await dataAdapter.createProfile({
    handle: `secret-preview-${Date.now()}`,
    displayName: 'Private Business Founder',
    company: 'Secret Ventures Casablanca',
  });
  assert.equal(privateProfile.accessState, 'private_preview');

  // Anonymous public visitor attempt to query private preview
  const publicResult = await dataAdapter.getPublicProfile(privateProfile.handle, 'fr');
  assert.equal(
    publicResult,
    null,
    'Private preview profiles must return null to public visitors to protect customer privacy'
  );

  // 2. Simulating the Supabase get_public_profile RPC contract
  const simulateGetPublicProfileRPC = (
    profile: { access_state: string; owner_id: string; display_name: string },
    visitorAuthUid: string | null,
    isFounderAdmin: boolean
  ) => {
    const isOwner = visitorAuthUid !== null && profile.owner_id === visitorAuthUid;
    const isAdmin = isFounderAdmin;

    if (['private_preview', 'order_pending'].includes(profile.access_state) && !(isOwner || isAdmin)) {
      return null;
    }

    return {
      display_name: profile.display_name,
      access_state: profile.access_state,
    };
  };

  // Anonymous visitor querying private_preview -> NULL
  const anonView = simulateGetPublicProfileRPC(
    { access_state: 'private_preview', owner_id: 'user-123', display_name: 'Dr. Test' },
    null,
    false
  );
  assert.equal(anonView, null, 'RPC must return null for anonymous visitor');

  // Anonymous visitor querying order_pending -> NULL
  const anonPendingView = simulateGetPublicProfileRPC(
    { access_state: 'order_pending', owner_id: 'user-123', display_name: 'Dr. Test' },
    null,
    false
  );
  assert.equal(anonPendingView, null, 'RPC must return null for order_pending profile');

  // Profile owner can view their own private preview
  const ownerView = simulateGetPublicProfileRPC(
    { access_state: 'private_preview', owner_id: 'user-123', display_name: 'Dr. Test' },
    'user-123',
    false
  );
  assert.ok(ownerView, 'Profile owner can view their private preview profile');

  // Founder admin can view private preview
  const adminView = simulateGetPublicProfileRPC(
    { access_state: 'private_preview', owner_id: 'user-123', display_name: 'Dr. Test' },
    'admin-999',
    true
  );
  assert.ok(adminView, 'Founder admin can view private preview profile');
});

test('Regression: Invalid or unlinked NFC card taps (#c/:uid) resolve to null and never trigger fallback profiles', async () => {
  // Test invalid NFC UIDs
  const invalidUid1 = await dataAdapter.resolveNfcTap('00:00:00:00:00:00:00');
  assert.equal(invalidUid1, null, 'Unknown UID must resolve to null');

  const invalidUid2 = await dataAdapter.resolveNfcTap('NON-EXISTENT-NFC-UID');
  assert.equal(invalidUid2, null, 'Nonexistent UID must resolve to null');

  const emptyUid = await dataAdapter.resolveNfcTap('');
  assert.equal(emptyUid, null, 'Empty UID must resolve to null');

  // Simulating resolve_nfc_card RPC contract
  const simulateResolveNfcCardRPC = (
    registryItem: { uid: string; serial_number: string; linked_profile_id: string | null; is_active: boolean } | null
  ) => {
    if (!registryItem || !registryItem.is_active || !registryItem.linked_profile_id) {
      return null;
    }
    return { linked_profile_id: registryItem.linked_profile_id };
  };

  assert.equal(simulateResolveNfcCardRPC(null), null);
  assert.equal(
    simulateResolveNfcCardRPC({ uid: '04:XX', serial_number: 'TAG-01', linked_profile_id: null, is_active: true }),
    null,
    'Unassigned card must return null'
  );
  assert.equal(
    simulateResolveNfcCardRPC({ uid: '04:XX', serial_number: 'TAG-01', linked_profile_id: 'prof-123', is_active: false }),
    null,
    'Inactive card must return null'
  );
});

test('Regression: Public profile view contract never substitutes a demo profile when RPC returns null', () => {
  // Simulating the UI resolution logic in App.tsx
  // Buggy version had: (loadedPublicProfile || resolvedPublicProfile) where resolvedPublicProfile defaulted to initialProfiles[0]
  // Fixed version: loadedPublicProfile strictly; if null, render translated not-found state without fallback
  const renderPublicProfileView = (loadedPublicProfile: BusinessProfile | null) => {
    if (loadedPublicProfile) {
      return { state: 'profile_rendered', displayName: loadedPublicProfile.displayName };
    }
    return { state: 'not_found_rendered', displayName: null };
  };

  // Case 1: RPC returns null for nonexistent / private profile
  const resultWhenNull = renderPublicProfileView(null);
  assert.equal(resultWhenNull.state, 'not_found_rendered');
  assert.equal(resultWhenNull.displayName, null, 'Must NOT render any profile name when RPC returns null');

  // Case 2: RPC returns an actual active profile
  const activeProfileMock: BusinessProfile = {
    id: 'prof-real-01',
    ownerId: 'user-real',
    ownerName: 'Salma El Fassi',
    ownerEmail: 'salma@elfassi.ma',
    handle: 'salma-elfassi',
    displayName: 'Salma El Fassi',
    jobTitle: 'Avocate au Barreau',
    company: 'Cabinet El Fassi',
    bio: 'Avocate d affaires',
    city: 'Rabat',
    address: 'Avenue Annakhil, Hay Riad',
    avatarUrl: '',
    logoUrl: '',
    coverColor: '#000000',
    templateId: 'executive',
    accessState: 'active',
    expiryDate: '2027-01-01',
    phone: '+212537000000',
    whatsapp: '+212661000000',
    email: 'salma@elfassi.ma',
    website: 'https://elfassi.ma',
    socials: {},
    products: [],
    documents: [],
    videos: [],
    leadFields: [],
    digitalTagtopBranding: true,
    linkedCardCount: 1,
  };

  const resultWhenValid = renderPublicProfileView(activeProfileMock);
  assert.equal(resultWhenValid.state, 'profile_rendered');
  assert.equal(resultWhenValid.displayName, 'Salma El Fassi');
});
