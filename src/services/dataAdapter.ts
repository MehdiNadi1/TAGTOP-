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

import { Language, BusinessProfile, NfcCardOrder, LeadSubmission } from '../types';
import { isSupabaseConfigured } from './supabase/client';
import { profileService } from './backend/profileService';
import { orderService } from './backend/orderService';
import { leadService, cardService } from './backend/leadService';
import {
  getStoredProfiles,
  getStoredRegistry,
  addStoredLead,
  addStoredOrder,
  saveOrders,
  getStoredOrders,
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
   * Retrieves public profile presentation.
   */
  async getPublicProfile(handleOrId: string, lang: Language = 'fr'): Promise<BusinessProfile | null> {
    if (isSupabaseConfigured()) {
      return await profileService.getPublicProfile(handleOrId);
    }

    // Explicit Demo Mode Fallback
    const profiles = getStoredProfiles(lang);
    return profiles.find((p) => p.handle === handleOrId || p.id === handleOrId) || null;
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
};
