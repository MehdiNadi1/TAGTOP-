/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BusinessProfile,
  NfcCardOrder,
  LeadSubmission,
  NfcCardRegistryItem,
  BankTransferRenewal,
  SystemSettings,
  Language,
} from '../types';
import {
  initialProfilesFR,
  initialProfilesAR,
  initialProfilesEN,
  initialOrders,
  initialLeadsFR,
  initialNfcRegistry,
  initialBankTransfers,
  initialSettings,
} from '../data/mockData';

const STORAGE_PREFIX = 'tagtop_v1_';

export const STORAGE_KEYS = {
  PROFILES: `${STORAGE_PREFIX}profiles`,
  CUSTOMIZED_PROFILE_IDS: `${STORAGE_PREFIX}customized_profile_ids`,
  ORDERS: `${STORAGE_PREFIX}orders`,
  LEADS: `${STORAGE_PREFIX}leads`,
  REGISTRY: `${STORAGE_PREFIX}registry`,
  TRANSFERS: `${STORAGE_PREFIX}transfers`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
  SETTINGS_CUSTOMIZED: `${STORAGE_PREFIX}settings_customized`,
  ANALYTICS: `${STORAGE_PREFIX}analytics`,
  CUSTOMER_SESSION: `${STORAGE_PREFIX}customer_session`,
  ADMIN_SESSION: `${STORAGE_PREFIX}admin_session`,
};

function safeGetItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[TAGTOP Storage] Failed to read ${key}:`, err);
    return fallback;
  }
}

function safeSetItem(key: string, value: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[TAGTOP Storage] Failed to write ${key}:`, err);
  }
}

export interface ProfileAnalyticsData {
  taps: number;
  whatsappClicks: number;
  vcardDownloads: number;
}

export interface CustomerSession {
  email: string;
  name?: string;
  loginAt: string;
}

export interface AdminSession {
  isAuthenticated: boolean;
  authenticatedAt?: string;
}

/**
 * Returns customized profile IDs (profiles created or edited by the user).
 */
export function getCustomizedProfileIds(): Set<string> {
  const ids = safeGetItem<string[]>(STORAGE_KEYS.CUSTOMIZED_PROFILE_IDS, []);
  return new Set(ids);
}

export function markProfileAsCustomized(profileId: string): void {
  const ids = getCustomizedProfileIds();
  ids.add(profileId);
  safeSetItem(STORAGE_KEYS.CUSTOMIZED_PROFILE_IDS, Array.from(ids));
}

/**
 * Retrieves profiles from persistent storage.
 * If user edits a profile, it remains untouched regardless of language changes.
 * For un-edited demo profiles, language changes can seamlessly display the localized seed.
 */
export function getStoredProfiles(currentLang: Language = 'fr'): BusinessProfile[] {
  const stored = safeGetItem<BusinessProfile[] | null>(STORAGE_KEYS.PROFILES, null);
  const customizedIds = getCustomizedProfileIds();

  // If nothing stored yet, initialize with current language seed
  if (!stored || stored.length === 0) {
    const seed =
      currentLang === 'ar' ? initialProfilesAR : currentLang === 'en' ? initialProfilesEN : initialProfilesFR;
    safeSetItem(STORAGE_KEYS.PROFILES, seed);
    return seed;
  }

  // Merge: for customized profiles, keep customer data! For un-customized demo profiles, update with localized strings
  const localizedDemo =
    currentLang === 'ar' ? initialProfilesAR : currentLang === 'en' ? initialProfilesEN : initialProfilesFR;
  const demoMap = new Map(localizedDemo.map((p) => [p.id, p]));

  return stored.map((p) => {
    if (customizedIds.has(p.id)) {
      // Customer has edited this profile: preserve customer data exactly
      return p;
    }
    // If it's a known demo profile that was never edited, show the localized demo translation
    if (demoMap.has(p.id)) {
      const demoVersion = demoMap.get(p.id)!;
      // Retain access state / expiry in case it was toggled
      return {
        ...demoVersion,
        accessState: p.accessState,
        expiryDate: p.expiryDate,
        linkedCardCount: p.linkedCardCount,
      };
    }
    return p;
  });
}

export function saveProfiles(profiles: BusinessProfile[]): void {
  safeSetItem(STORAGE_KEYS.PROFILES, profiles);
}

export function updateStoredProfile(updated: BusinessProfile): BusinessProfile[] {
  markProfileAsCustomized(updated.id);
  const current = getStoredProfiles();
  const index = current.findIndex((p) => p.id === updated.id);
  let next: BusinessProfile[];
  if (index >= 0) {
    next = current.map((p) => (p.id === updated.id ? updated : p));
  } else {
    next = [updated, ...current];
  }
  saveProfiles(next);
  return next;
}

/**
 * Retrieves orders from persistent storage.
 */
export function getStoredOrders(): NfcCardOrder[] {
  const stored = safeGetItem<NfcCardOrder[] | null>(STORAGE_KEYS.ORDERS, null);
  if (!stored) {
    safeSetItem(STORAGE_KEYS.ORDERS, initialOrders);
    return initialOrders;
  }
  return stored;
}

export function saveOrders(orders: NfcCardOrder[]): void {
  safeSetItem(STORAGE_KEYS.ORDERS, orders);
}

export function addStoredOrder(order: NfcCardOrder): NfcCardOrder[] {
  const current = getStoredOrders();
  const next = [order, ...current];
  saveOrders(next);
  return next;
}

/**
 * Retrieves leads from persistent storage.
 */
export function getStoredLeads(): LeadSubmission[] {
  const stored = safeGetItem<LeadSubmission[] | null>(STORAGE_KEYS.LEADS, null);
  if (!stored) {
    safeSetItem(STORAGE_KEYS.LEADS, initialLeadsFR);
    return initialLeadsFR;
  }
  return stored;
}

export function saveLeads(leads: LeadSubmission[]): void {
  safeSetItem(STORAGE_KEYS.LEADS, leads);
}

export function addStoredLead(lead: LeadSubmission): LeadSubmission[] {
  const current = getStoredLeads();
  const next = [lead, ...current];
  saveLeads(next);
  return next;
}

/**
 * Retrieves NFC card registry.
 */
export function getStoredRegistry(): NfcCardRegistryItem[] {
  const stored = safeGetItem<NfcCardRegistryItem[] | null>(STORAGE_KEYS.REGISTRY, null);
  if (!stored) {
    safeSetItem(STORAGE_KEYS.REGISTRY, initialNfcRegistry);
    return initialNfcRegistry;
  }
  return stored;
}

export function saveRegistry(registry: NfcCardRegistryItem[]): void {
  safeSetItem(STORAGE_KEYS.REGISTRY, registry);
}

/**
 * Retrieves bank transfer renewals.
 */
export function getStoredTransfers(): BankTransferRenewal[] {
  const stored = safeGetItem<BankTransferRenewal[] | null>(STORAGE_KEYS.TRANSFERS, null);
  if (!stored) {
    safeSetItem(STORAGE_KEYS.TRANSFERS, initialBankTransfers);
    return initialBankTransfers;
  }
  return stored;
}

export function saveTransfers(transfers: BankTransferRenewal[]): void {
  safeSetItem(STORAGE_KEYS.TRANSFERS, transfers);
}

export function addStoredTransfer(transfer: BankTransferRenewal): BankTransferRenewal[] {
  const current = getStoredTransfers();
  const next = [transfer, ...current];
  saveTransfers(next);
  return next;
}

/**
 * Retrieves system settings.
 */
export function getStoredSettings(): SystemSettings {
  const stored = safeGetItem<SystemSettings | null>(STORAGE_KEYS.SETTINGS, null);
  if (!stored) {
    safeSetItem(STORAGE_KEYS.SETTINGS, initialSettings);
    return initialSettings;
  }
  return stored;
}

export function saveSettings(settings: SystemSettings): void {
  safeSetItem(STORAGE_KEYS.SETTINGS, settings);
  safeSetItem(STORAGE_KEYS.SETTINGS_CUSTOMIZED, true);
}

/**
 * Visitor & Interaction Analytics per profile.
 */
const DEFAULT_ANALYTICS: Record<string, ProfileAnalyticsData> = {
  'prof-casablanca': { taps: 148, whatsappClicks: 62, vcardDownloads: 45 },
  'prof-rabat': { taps: 89, whatsappClicks: 34, vcardDownloads: 28 },
};

export function getStoredAnalytics(profileId: string): ProfileAnalyticsData {
  const map = safeGetItem<Record<string, ProfileAnalyticsData>>(STORAGE_KEYS.ANALYTICS, DEFAULT_ANALYTICS);
  return map[profileId] || { taps: 0, whatsappClicks: 0, vcardDownloads: 0 };
}

export function recordAnalyticsEvent(
  profileId: string,
  event: 'tap' | 'whatsapp' | 'vcard'
): ProfileAnalyticsData {
  const map = safeGetItem<Record<string, ProfileAnalyticsData>>(STORAGE_KEYS.ANALYTICS, DEFAULT_ANALYTICS);
  const current = map[profileId] || { taps: 0, whatsappClicks: 0, vcardDownloads: 0 };
  if (event === 'tap') current.taps += 1;
  if (event === 'whatsapp') current.whatsappClicks += 1;
  if (event === 'vcard') current.vcardDownloads += 1;

  map[profileId] = current;
  safeSetItem(STORAGE_KEYS.ANALYTICS, map);
  return current;
}

/**
 * Customer session management (Espace Client).
 */
export function getStoredCustomerSession(): CustomerSession | null {
  return safeGetItem<CustomerSession | null>(STORAGE_KEYS.CUSTOMER_SESSION, null);
}

export function saveCustomerSession(session: CustomerSession | null): void {
  if (session === null) {
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEYS.CUSTOMER_SESSION);
  } else {
    safeSetItem(STORAGE_KEYS.CUSTOMER_SESSION, session);
  }
}

/**
 * Founder Admin session management.
 */
export function getStoredAdminSession(): AdminSession {
  return safeGetItem<AdminSession>(STORAGE_KEYS.ADMIN_SESSION, { isAuthenticated: false });
}

export function saveAdminSession(session: AdminSession): void {
  safeSetItem(STORAGE_KEYS.ADMIN_SESSION, session);
}

/**
 * Export and Import functionality for offline backup & backend migration.
 */
export function exportDataSnapshot(): string {
  const snapshot = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    profiles: safeGetItem(STORAGE_KEYS.PROFILES, []),
    customizedProfileIds: Array.from(getCustomizedProfileIds()),
    orders: safeGetItem(STORAGE_KEYS.ORDERS, []),
    leads: safeGetItem(STORAGE_KEYS.LEADS, []),
    registry: safeGetItem(STORAGE_KEYS.REGISTRY, []),
    transfers: safeGetItem(STORAGE_KEYS.TRANSFERS, []),
    settings: safeGetItem(STORAGE_KEYS.SETTINGS, initialSettings),
    analytics: safeGetItem(STORAGE_KEYS.ANALYTICS, DEFAULT_ANALYTICS),
  };
  return JSON.stringify(snapshot, null, 2);
}

export function importDataSnapshot(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || typeof data !== 'object') return false;
    if (data.profiles) safeSetItem(STORAGE_KEYS.PROFILES, data.profiles);
    if (data.customizedProfileIds) safeSetItem(STORAGE_KEYS.CUSTOMIZED_PROFILE_IDS, data.customizedProfileIds);
    if (data.orders) safeSetItem(STORAGE_KEYS.ORDERS, data.orders);
    if (data.leads) safeSetItem(STORAGE_KEYS.LEADS, data.leads);
    if (data.registry) safeSetItem(STORAGE_KEYS.REGISTRY, data.registry);
    if (data.transfers) safeSetItem(STORAGE_KEYS.TRANSFERS, data.transfers);
    if (data.settings) safeSetItem(STORAGE_KEYS.SETTINGS, data.settings);
    if (data.analytics) safeSetItem(STORAGE_KEYS.ANALYTICS, data.analytics);
    return true;
  } catch (err) {
    console.error('[TAGTOP Storage] Failed to import snapshot:', err);
    return false;
  }
}

/**
 * Resets storage back to initial demo seeds.
 */
export function resetStorageToDefaults(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
}

