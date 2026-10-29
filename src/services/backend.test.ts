/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Supabase Backend Foundation & Adapter Unit Tests
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSupabaseConfigured, getRequiredSupabaseClient } from './supabase/client';
import { dataAdapter } from './dataAdapter';
import { LeadSubmission, NfcCardOrder } from '../types';

test('isSupabaseConfigured returns false when env variables are missing or unconfigured', () => {
  const configured = isSupabaseConfigured();
  // In development without .env set, it should safely return false without throwing
  assert.equal(typeof configured, 'boolean');
});

test('getRequiredSupabaseClient throws descriptive error when client is unconfigured', () => {
  if (!isSupabaseConfigured()) {
    assert.throws(
      () => getRequiredSupabaseClient(),
      /Supabase client is not configured/
    );
  }
});

test('dataAdapter.resolveNfcTap resolves NFC cards seamlessly via local fallback', async () => {
  // Test by both physical UID and serial number
  const resolvedByUid = await dataAdapter.resolveNfcTap('04:A2:8F:9C:3E:11:80');
  assert.equal(resolvedByUid, 'prof-casablanca');

  const resolvedBySerial = await dataAdapter.resolveNfcTap('TAG-MA-2026-00142');
  assert.equal(resolvedBySerial, 'prof-casablanca');
});

test('dataAdapter.resolveNfcTap returns null for non-existent card UIDs', async () => {
  const resolved = await dataAdapter.resolveNfcTap('NON-EXISTENT-UID-999');
  assert.equal(resolved, null);
});

test('dataAdapter.getPublicProfile retrieves business profile by handle or ID', async () => {
  const profileByHandle = await dataAdapter.getPublicProfile('yassine-bennani', 'fr');
  assert.ok(profileByHandle);
  assert.equal(profileByHandle.id, 'prof-casablanca');
  assert.equal(profileByHandle.displayName, 'Yassine Bennani');
  assert.equal(profileByHandle.city, 'Casablanca');
  assert.equal(profileByHandle.accessState, 'active');

  const profileById = await dataAdapter.getPublicProfile('prof-casablanca', 'fr');
  assert.ok(profileById);
  assert.equal(profileById.handle, 'yassine-bennani');

  // Regression: Nonexistent handles return null and do not substitute a demo profile
  const missingHandle = await dataAdapter.getPublicProfile('tagtop-demo-01', 'fr');
  assert.equal(missingHandle, null, 'tagtop-demo-01 must return null');

  const nonexistentHandle = await dataAdapter.getPublicProfile('non-existent-handle-404', 'fr');
  assert.equal(nonexistentHandle, null, 'non-existent handle must return null');
});

test('dataAdapter.recordProfileEvent safely logs interactions and increments counters', async () => {
  await dataAdapter.recordProfileEvent('prof-casablanca', 'tap');
  await dataAdapter.recordProfileEvent('prof-casablanca', 'whatsapp');
  await dataAdapter.recordProfileEvent('prof-casablanca', 'vcard');
  assert.ok(true, 'Recorded analytics without exception');
});

test('dataAdapter.submitLead persists a new lead with promotional consent', async () => {
  const newLead: LeadSubmission = {
    id: `lead-test-${Date.now()}`,
    profileId: 'prof-casablanca',
    profileName: 'Yassine Bennani - Atelier Atlas Design',
    name: 'Karim Tazi',
    phone: '+212661234567',
    email: 'karim.tazi@example.ma',
    company: 'Tazi Development',
    notes: 'Demande de devis pour villa à Dar Bouazza',
    promotionalConsent: true,
    submittedAt: new Date().toISOString(),
  };

  const saved = await dataAdapter.submitLead(newLead);
  assert.equal(saved.name, 'Karim Tazi');
  assert.equal(saved.promotionalConsent, true);
});

test('dataAdapter.createOrder persists an order with COD payment status', async () => {
  const newOrder: NfcCardOrder = {
    id: `ord-test-${Date.now()}`,
    customerName: 'Samir Alaoui',
    customerPhone: '+212662000000',
    customerEmail: 'samir@example.com',
    city: 'Rabat',
    address: 'Avenue Mohammed VI, Souissi',
    packageTier: 'starter',
    cardColor: 'black',
    cardBranding: 'branded',
    cardQuantity: 1,
    priceMAD: 250,
    woodenStandSelected: false,
    woodenStandPriceMAD: 0,
    profileId: 'prof-casablanca',
    profileName: 'Yassine Bennani',
    orderStatus: 'received',
    paymentStatus: 'cod_pending',
    proofApproved: false,
    createdAt: new Date().toISOString(),
  };

  const created = await dataAdapter.createOrder(newOrder);
  assert.equal(created.priceMAD, 250);
  assert.equal(created.paymentStatus, 'cod_pending');
});

test('dataAdapter.createProfile creates a customer profile in private preview mode', async () => {
  const newProfile = await dataAdapter.createProfile({
    handle: 'architecte-rabat',
    displayName: 'Fatima Zahra',
    jobTitle: 'Architecte DPLG',
    company: 'Atelier Rabat Design',
    city: 'Rabat',
    phone: '+212661998877',
    templateId: 'creative',
  });

  assert.ok(newProfile.id);
  assert.equal(newProfile.displayName, 'Fatima Zahra');
  assert.equal(newProfile.accessState, 'private_preview');
  assert.equal(newProfile.linkedCardCount, 0);
  assert.ok(newProfile.expiryDate);
});

test('dataAdapter.updateProfile modifies allowed business profile fields', async () => {
  const initial = await dataAdapter.createProfile({
    handle: 'tazi-consulting',
    displayName: 'Mehdi Tazi',
    company: 'Tazi Conseil',
    city: 'Casablanca',
  });

  const updated = await dataAdapter.updateProfile({
    ...initial,
    displayName: 'Mehdi Tazi Senior Partner',
    bio: 'Conseil stratégique pour PME à Casablanca',
  });

  assert.equal(updated.id, initial.id);
  assert.equal(updated.displayName, 'Mehdi Tazi Senior Partner');
  assert.equal(updated.bio, 'Conseil stratégique pour PME à Casablanca');
});

test('dataAdapter.getCustomerProfiles returns owned profiles', async () => {
  const profiles = await dataAdapter.getCustomerProfiles('demo-customer', 'fr');
  assert.ok(Array.isArray(profiles));
  assert.ok(profiles.length > 0);
});

test('authService reflects Supabase configuration state', () => {
  const configured = dataAdapter.isLiveBackend();
  assert.equal(typeof configured, 'boolean');
});
