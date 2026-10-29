/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Unified Data Adapter
 * Strict separation of live Supabase backend operations and offline demo mode.
 * 
 * Reliability Rule (Phase 2A.1):
 * When Supabase is configured, operations are executed directly against the live database
 * and throw real errors upon failure. They NEVER silently swallow errors or fake success
 * into localStorage. LocalStorage persistence is exclusively reserved for explicit demo/offline mode.
 */

import {
  Language,
  BusinessProfile,
  NfcCardOrder,
  LeadSubmission,
  NfcCardRegistryItem,
  BankTransferRenewal,
  SystemSettings,
  ProfileAccessState,
} from '../types';
import { isSupabaseConfigured } from './supabase/client';
import { profileService } from './backend/profileService';
import { orderService } from './backend/orderService';
import { leadService, cardService } from './backend/leadService';
import { adminService } from './backend/adminService';
import {
  TagtopOrderStatus,
  TagtopPaymentStatus,
  TagtopProfileAccessState,
} from '../types/database.types';
import {
  getStoredProfiles,
  updateStoredProfile,
  getStoredRegistry,
  getStoredTransfers,
  saveTransfers,
  getStoredSettings,
  saveSettings,
  addStoredLead,
  addStoredOrder,
  saveOrders,
  getStoredOrders,
  getStoredLeads,
  recordAnalyticsEvent as recordLocalAnalyticsEvent,
} from './storage';

export type BackendMode = 'supabase' | 'demo';

export const dataAdapter = {
  getMode(): BackendMode {
    return isSupabaseConfigured() ? 'supabase' : 'demo';
  },

  isLiveBackend(): boolean {
    return isSupabaseConfigured();
  },

  /**
   * Resolves NFC Card physical tap (UID or serial number) to active linked profile ID.
   */
  async resolveNfcTap(cardUidOrSerial: string): Promise<string | null> {
    if (isSupabaseConfigured()) {
      return await cardService.resolveCardUid(cardUidOrSerial);
    }

    // Explicit Demo Mode Fallback
    const registry = getStoredRegistry();
    const matched = registry.find(
      (item) =>
        item.uid.toLowerCase() === cardUidOrSerial.toLowerCase() ||
        item.serialNumber.toLowerCase() === cardUidOrSerial.toLowerCase()
    );
    return matched?.linkedProfileId || null;
  },

  /**
   * Retrieves public profile presentation via secure RPC.
   */
  async getPublicProfile(handleOrId: string, lang: Language = 'fr'): Promise<BusinessProfile | null> {
    if (isSupabaseConfigured()) {
      return await profileService.getPublicProfile(handleOrId);
    }

    // Explicit Demo Mode Fallback
    const profiles = getStoredProfiles(lang);
    const matched = profiles.find((p) => p.handle === handleOrId || p.id === handleOrId);
    if (!matched) return null;
    if (matched.accessState === 'private_preview' || matched.accessState === 'order_pending') {
      return null;
    }
    return matched;
  },

  /**
   * Retrieves all profiles owned by an authenticated customer.
   */
  async getCustomerProfiles(ownerId: string, lang: Language = 'fr'): Promise<BusinessProfile[]> {
    if (isSupabaseConfigured()) {
      return await profileService.getCustomerProfiles(ownerId);
    }

    // Explicit Demo Mode Fallback
    return getStoredProfiles(lang);
  },

  /**
   * Creates a new customer profile in private preview mode.
   */
  async createProfile(profile: Partial<BusinessProfile>): Promise<BusinessProfile> {
    if (isSupabaseConfigured()) {
      return await profileService.createProfile(profile);
    }

    // Explicit Demo Mode Fallback
    const newProfile: BusinessProfile = {
      id: profile.id || `prof-${Date.now().toString(36)}`,
      ownerId: profile.ownerId || 'demo-customer',
      ownerName: profile.displayName || 'Demo User',
      ownerEmail: profile.email || 'customer@example.com',
      handle: profile.handle || `demo-${Date.now().toString(36)}`,
      displayName: profile.displayName || 'Demo Profile',
      jobTitle: profile.jobTitle || '',
      company: profile.company || '',
      bio: profile.bio || '',
      city: profile.city || 'Casablanca',
      address: profile.address || '',
      avatarUrl: profile.avatarUrl || '',
      logoUrl: profile.logoUrl || '',
      coverColor: profile.coverColor || '#18181b',
      templateId: profile.templateId || 'executive',
      accessState: 'private_preview',
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      phone: profile.phone || '',
      whatsapp: profile.whatsapp || '',
      email: profile.email || '',
      website: profile.website || '',
      socials: profile.socials || {},
      products: profile.products || [],
      documents: profile.documents || [],
      videos: profile.videos || [],
      leadFields: profile.leadFields || [],
      digitalTagtopBranding: profile.digitalTagtopBranding ?? true,
      linkedCardCount: 0,
    };
    updateStoredProfile(newProfile);
    return newProfile;
  },

  /**
   * Updates an existing profile.
   */
  async updateProfile(profile: BusinessProfile): Promise<BusinessProfile> {
    if (isSupabaseConfigured()) {
      return await profileService.updateProfile(profile);
    }

    // Explicit Demo Mode Fallback
    updateStoredProfile(profile);
    return profile;
  },

  /**
   * Retrieves orders for an authenticated customer.
   */
  async getCustomerOrders(customerId?: string, email?: string): Promise<NfcCardOrder[]> {
    if (isSupabaseConfigured()) {
      return await orderService.getCustomerOrders(customerId, email);
    }

    // Explicit Demo Mode Fallback
    return getStoredOrders();
  },

  /**
   * Retrieves leads collected by an authenticated customer's profile.
   */
  async getProfileLeads(profileId: string): Promise<LeadSubmission[]> {
    if (isSupabaseConfigured()) {
      return await leadService.getProfileLeads(profileId);
    }

    // Explicit Demo Mode Fallback
    const allLeads = getStoredLeads();
    return allLeads.filter((l) => l.profileId === profileId);
  },

  /**
   * Records tap/interaction analytics event.
   */
  async recordProfileEvent(profileId: string, event: 'tap' | 'whatsapp' | 'vcard'): Promise<void> {
    if (isSupabaseConfigured()) {
      const mappedEvent = event === 'tap' ? 'tap' : event === 'whatsapp' ? 'whatsapp_click' : 'vcard_download';
      await cardService.recordAnalyticsEvent(profileId, mappedEvent);
      return;
    }

    // Explicit Demo Mode Fallback
    recordLocalAnalyticsEvent(profileId, event);
  },

  /**
   * Submits a customer inquiry lead.
   * In Supabase mode, executes on server and throws on failure.
   */
  async submitLead(lead: LeadSubmission): Promise<LeadSubmission> {
    if (isSupabaseConfigured()) {
      return await leadService.submitLead(lead);
    }

    // Explicit Demo Mode
    addStoredLead(lead);
    return lead;
  },

  /**
   * Creates a new card order.
   * In Supabase mode, executes on server and throws on failure.
   */
  async createOrder(order: NfcCardOrder, customerId?: string): Promise<NfcCardOrder> {
    if (isSupabaseConfigured()) {
      return await orderService.createOrder(order, customerId);
    }

    // Explicit Demo Mode
    addStoredOrder(order);
    return order;
  },

  /**
   * Submits customer proof approval.
   * In Supabase mode, executes on server and throws on failure.
   */
  async approveProof(orderId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      await orderService.approveProof(orderId);
      return;
    }

    // Explicit Demo Mode
    const current = getStoredOrders();
    const updated = current.map((o) =>
      o.id === orderId ? { ...o, proofApproved: true, orderStatus: 'customer_approved' as const } : o
    );
    saveOrders(updated);
  },

  /**
   * Submits customer proof change request with mandatory revision notes.
   * In Supabase mode, executes on server and throws on failure.
   */
  async requestProofChange(orderId: string, reason: string): Promise<void> {
    if (isSupabaseConfigured()) {
      await orderService.requestProofChange(orderId, reason);
      return;
    }

    // Explicit Demo Mode
    const current = getStoredOrders();
    const updated = current.map((o) =>
      o.id === orderId
        ? { ...o, proofApproved: false, proofRejectionReason: reason, orderStatus: 'artwork_review' as const }
        : o
    );
    saveOrders(updated);
  },

  // ===========================================================================
  // FOUNDER ADMIN OPERATIONS
  // ===========================================================================

  /**
   * Verifies if authenticated caller is a founder admin via RPC.
   */
  async isFounderAdmin(): Promise<boolean> {
    if (isSupabaseConfigured()) {
      return await adminService.isFounderAdmin();
    }
    return false;
  },

  /**
   * Loads full platform data for the Founder Admin console.
   */
  async getFounderData(): Promise<{
    profiles: BusinessProfile[];
    orders: NfcCardOrder[];
    registry: NfcCardRegistryItem[];
    transfers: BankTransferRenewal[];
    settings: SystemSettings;
  }> {
    if (isSupabaseConfigured()) {
      const [profiles, orders, transfers, settings] = await Promise.all([
        adminService.getAllProfiles(),
        adminService.getAllOrders(),
        adminService.getAllBankTransfers(),
        adminService.getSystemSettings(),
      ]);
      const profileMap = new Map(profiles.map((p) => [p.id, p.displayName]));
      const registry = await adminService.getAllNfcCards(profileMap);
      return { profiles, orders, registry, transfers, settings };
    }

    // Explicit Demo Mode Fallback
    return {
      profiles: getStoredProfiles(),
      orders: getStoredOrders(),
      registry: getStoredRegistry(),
      transfers: getStoredTransfers(),
      settings: getStoredSettings(),
    };
  },

  /**
   * Updates order fulfillment status or COD payment status via RPC.
   */
  async founderUpdateOrderStatus(
    orderId: string,
    orderStatus: TagtopOrderStatus,
    paymentStatus?: TagtopPaymentStatus
  ): Promise<void> {
    if (isSupabaseConfigured()) {
      await adminService.updateOrderStatus(orderId, orderStatus, paymentStatus);
      return;
    }

    // Demo Mode Fallback
    const current = getStoredOrders();
    const updated = current.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: (orderStatus || o.orderStatus) as any,
          paymentStatus: (paymentStatus || o.paymentStatus) as any,
        };
      }
      return o;
    });
    saveOrders(updated);
  },

  /**
   * Approves a bank transfer renewal and extends subscription via RPC.
   */
  async founderApproveTransfer(
    transferId: string,
    founderNotes = ''
  ): Promise<{ success: boolean; newExpiryDate?: string }> {
    if (isSupabaseConfigured()) {
      return await adminService.approveBankTransfer(transferId, founderNotes);
    }

    // Demo Mode Fallback
    const transfers = getStoredTransfers();
    const target = transfers.find((t) => t.id === transferId);
    if (!target) throw new Error('Transfer not found');

    const nextTransfers = transfers.map((t) =>
      t.id === transferId
        ? { ...t, status: 'approved' as const, founderNotes, verifiedAt: new Date().toISOString() }
        : t
    );
    saveTransfers(nextTransfers);

    const profiles = getStoredProfiles();
    const targetProfile = profiles.find((p) => p.id === target.profileId);
    let newExpiryStr: string | undefined;
    if (targetProfile) {
      const currentExpiry = new Date(targetProfile.expiryDate);
      const addDays = target.amountMAD === 150 ? 180 : 365;
      currentExpiry.setDate(currentExpiry.getDate() + addDays);
      newExpiryStr = currentExpiry.toISOString().split('T')[0];
      updateStoredProfile({
        ...targetProfile,
        accessState: 'active',
        expiryDate: newExpiryStr,
      });
    }

    return { success: true, newExpiryDate: newExpiryStr };
  },

  /**
   * Rejects a bank transfer with notes via RPC.
   */
  async founderRejectTransfer(transferId: string, reason: string): Promise<void> {
    if (isSupabaseConfigured()) {
      await adminService.rejectBankTransfer(transferId, reason);
      return;
    }

    // Demo Mode Fallback
    const transfers = getStoredTransfers();
    const nextTransfers = transfers.map((t) =>
      t.id === transferId
        ? { ...t, status: 'rejected' as const, founderNotes: reason }
        : t
    );
    saveTransfers(nextTransfers);
  },

  /**
   * Updates profile access state.
   */
  async founderUpdateProfileAccess(profileId: string, newState: ProfileAccessState | TagtopProfileAccessState): Promise<void> {
    if (isSupabaseConfigured()) {
      await adminService.updateProfileAccessState(profileId, newState);
      return;
    }

    // Demo Mode Fallback
    const profiles = getStoredProfiles();
    const target = profiles.find((p) => p.id === profileId);
    if (target) {
      updateStoredProfile({ ...target, accessState: newState as any });
    }
  },

  /**
   * Updates platform system settings.
   */
  async founderUpdateSettings(newSettings: SystemSettings): Promise<void> {
    if (isSupabaseConfigured()) {
      await adminService.updateSystemSettings(newSettings);
      return;
    }

    // Demo Mode Fallback
    saveSettings(newSettings);
  },

  /**
   * Evaluates subscription lifecycles across all profiles.
   */
  async founderEvaluateSubscriptions(): Promise<{ evaluated_date: string; profiles_in_grace: number; profiles_suspended: number }> {
    if (isSupabaseConfigured()) {
      return await adminService.evaluateSubscriptions();
    }
    return { evaluated_date: new Date().toISOString().split('T')[0], profiles_in_grace: 0, profiles_suspended: 0 };
  },
};
