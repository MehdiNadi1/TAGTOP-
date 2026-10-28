import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getStoredProfiles,
  updateStoredProfile,
  getStoredOrders,
  addStoredOrder,
  getStoredLeads,
  addStoredLead,
  recordAnalyticsEvent,
  getStoredAnalytics,
  saveCustomerSession,
  getStoredCustomerSession,
  saveAdminSession,
  getStoredAdminSession,
  resetStorageToDefaults,
  exportDataSnapshot,
  importDataSnapshot,
} from './storage';
import { BusinessProfile, NfcCardOrder, LeadSubmission } from '../types';

// Mock localStorage in Node environment
const mockStorage: Record<string, string> = {};
(global as any).window = {};
(global as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
};

test('getStoredProfiles returns seed profiles on initial launch', () => {
  resetStorageToDefaults();
  const profiles = getStoredProfiles('fr');
  assert.ok(profiles.length > 0);
  assert.equal(profiles[0].id, 'prof-casablanca');
});

test('Customer profile edits persist and are NOT overwritten when switching languages', () => {
  resetStorageToDefaults();
  const initial = getStoredProfiles('fr');
  const target = initial[0];

  // Customer edits their profile phone and bio
  const updatedProfile: BusinessProfile = {
    ...target,
    phone: '+212 6 99 99 99 99',
    bio: 'Mon entreprise personnalisée',
  };

  updateStoredProfile(updatedProfile);

  // Now simulate switching language to Arabic
  const profilesAfterLangSwitch = getStoredProfiles('ar');
  const retrievedEdited = profilesAfterLangSwitch.find((p) => p.id === target.id);

  assert.ok(retrievedEdited);
  assert.equal(retrievedEdited.phone, '+212 6 99 99 99 99');
  assert.equal(retrievedEdited.bio, 'Mon entreprise personnalisée');
});

test('New orders persist in storage across sessions', () => {
  resetStorageToDefaults();
  const initialOrders = getStoredOrders();

  const newOrder: NfcCardOrder = {
    id: 'ord-test-999',
    customerName: 'Karim Tazi',
    customerPhone: '+212 6 60 00 11 22',
    customerEmail: 'karim.tazi@example.ma',
    city: 'Marrakech',
    address: 'Gueliz, Rue de la Liberté',
    packageTier: 'starter',
    cardColor: 'black',
    cardBranding: 'branded',
    cardQuantity: 1,
    priceMAD: 250,
    woodenStandSelected: false,
    woodenStandPriceMAD: 0,
    profileId: 'prof-casablanca',
    profileName: 'Yassine Bennani',
    orderStatus: 'artwork_review',
    paymentStatus: 'cod_pending',
    createdAt: new Date().toISOString(),
    proofApproved: false,
  };

  addStoredOrder(newOrder);
  const updatedOrders = getStoredOrders();
  assert.equal(updatedOrders.length, initialOrders.length + 1);
  assert.equal(updatedOrders[0].id, 'ord-test-999');
});

test('New leads submitted from public profiles persist in storage', () => {
  resetStorageToDefaults();
  const initialLeads = getStoredLeads();

  const testLead: LeadSubmission = {
    id: 'lead-test-01',
    profileId: 'prof-casablanca',
    profileName: 'Atelier Atlas Design',
    name: 'Sofia Mansouri',
    phone: '+212 6 70 80 90 00',
    email: 'sofia@example.com',
    company: 'Atlas Invest',
    notes: 'Demande de devis pour bureaux.',
    submittedAt: new Date().toISOString(),
    promotionalConsent: true,
  };

  addStoredLead(testLead);
  const updatedLeads = getStoredLeads();
  assert.equal(updatedLeads.length, initialLeads.length + 1);
  assert.equal(updatedLeads[0].name, 'Sofia Mansouri');
});

test('Analytics events increment properly per profile', () => {
  resetStorageToDefaults();
  const profId = 'prof-custom-test';
  const initialAnalytics = getStoredAnalytics(profId);
  assert.equal(initialAnalytics.taps, 0);

  recordAnalyticsEvent(profId, 'tap');
  recordAnalyticsEvent(profId, 'tap');
  recordAnalyticsEvent(profId, 'whatsapp');
  recordAnalyticsEvent(profId, 'vcard');

  const after = getStoredAnalytics(profId);
  assert.equal(after.taps, 2);
  assert.equal(after.whatsappClicks, 1);
  assert.equal(after.vcardDownloads, 1);
});

test('Customer session can be stored and cleared', () => {
  resetStorageToDefaults();
  assert.equal(getStoredCustomerSession(), null);

  saveCustomerSession({
    email: 'yassine.bennani@atlasdesign.ma',
    name: 'Yassine Bennani',
    loginAt: new Date().toISOString(),
  });

  const session = getStoredCustomerSession();
  assert.ok(session);
  assert.equal(session?.email, 'yassine.bennani@atlasdesign.ma');

  saveCustomerSession(null);
  assert.equal(getStoredCustomerSession(), null);
});

test('Admin session persists authentication state', () => {
  resetStorageToDefaults();
  assert.equal(getStoredAdminSession().isAuthenticated, false);

  saveAdminSession({ isAuthenticated: true, authenticatedAt: new Date().toISOString() });
  assert.equal(getStoredAdminSession().isAuthenticated, true);
});

test('Export and import data snapshots work seamlessly for offline backup & backend migration', () => {
  resetStorageToDefaults();
  const snapshotJson = exportDataSnapshot();
  assert.ok(snapshotJson.includes('version'));
  assert.ok(snapshotJson.includes('profiles'));

  const importSuccess = importDataSnapshot(snapshotJson);
  assert.equal(importSuccess, true);
});

