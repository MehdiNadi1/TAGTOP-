/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Unified Data Adapter (Hybrid Local / Supabase Backend)
 * Automatically delegates to Supabase when environment is configured, or
 * falls back seamlessly to the resilient local storage layer (Phase 1) for demo/offline operation.
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

export const dataAdapter = {
  isLiveBackend(): boolean {
    return isSupabaseConfigured();
  },

  async resolveNfcTap(cardUidOrSerial: string): Promise<string | null> {
    if (isSupabaseConfigured()) {
      try {
        const profileId = await cardService.resolveCardUid(cardUidOrSerial);
        if (profileId) return profileId;
      } catch (err) {
        console.warn('[TAGTOP Adapter] Supabase card resolve error, falling back to local registry:', err);
      }
    }

    // Local fallback
    const registry = getStoredRegistry();
    const matched = registry.find(
      (item) =>
        item.uid.toLowerCase() === cardUidOrSerial.toLowerCase() ||
        item.serialNumber.toLowerCase() === cardUidOrSerial.toLowerCase()
    );
    return matched?.linkedProfileId || null;
  },

  async getPublicProfile(handleOrId: string, lang: Language = 'fr'): Promise<BusinessProfile | null> {
    if (isSupabaseConfigured()) {
      try {
        const liveProfile = await profileService.getPublicProfile(handleOrId);
        if (liveProfile) return liveProfile;
      } catch (err) {
        console.warn('[TAGTOP Adapter] Supabase public profile fetch error, falling back to local:', err);
      }
    }

    // Local fallback
    const profiles = getStoredProfiles(lang);
    return profiles.find((p) => p.handle === handleOrId || p.id === handleOrId) || null;
  },

  async recordProfileEvent(profileId: string, event: 'tap' | 'whatsapp' | 'vcard'): Promise<void> {
    // Record locally in all cases for instant responsive UI counters
    recordLocalAnalyticsEvent(profileId, event);

    if (isSupabaseConfigured()) {
      const mappedEvent = event === 'tap' ? 'tap' : event === 'whatsapp' ? 'whatsapp_click' : 'vcard_download';
      try {
        await cardService.recordAnalyticsEvent(profileId, mappedEvent);
      } catch (err) {
        console.warn('[TAGTOP Adapter] Supabase analytics log error:', err);
      }
    }
  },

  async submitLead(lead: LeadSubmission): Promise<LeadSubmission> {
    // Persist locally
    addStoredLead(lead);

    if (isSupabaseConfigured()) {
      try {
        return await leadService.submitLead(lead);
      } catch (err) {
        console.warn('[TAGTOP Adapter] Supabase lead submission failed, stored locally:', err);
      }
    }
    return lead;
  },

  async createOrder(order: NfcCardOrder, customerId?: string): Promise<NfcCardOrder> {
    // Persist locally
    addStoredOrder(order);

    if (isSupabaseConfigured()) {
      try {
        return await orderService.createOrder(order, customerId);
      } catch (err) {
        console.warn('[TAGTOP Adapter] Supabase order insertion failed, stored locally:', err);
      }
    }
    return order;
  },

  async approveProof(orderId: string): Promise<void> {
    // Update locally
    const current = getStoredOrders();
    const updated = current.map((o) =>
      o.id === orderId ? { ...o, proofApproved: true, orderStatus: 'customer_approved' as const } : o
    );
    saveOrders(updated);

    if (isSupabaseConfigured()) {
      try {
        await orderService.approveProof(orderId);
      } catch (err) {
        console.warn('[TAGTOP Adapter] Supabase proof approval update failed:', err);
      }
    }
  },

  async requestProofChange(orderId: string, reason: string): Promise<void> {
    // Update locally
    const current = getStoredOrders();
    const updated = current.map((o) =>
      o.id === orderId
        ? { ...o, proofApproved: false, proofRejectionReason: reason, orderStatus: 'artwork_review' as const }
        : o
    );
    saveOrders(updated);

    if (isSupabaseConfigured()) {
      try {
        await orderService.requestProofChange(orderId, reason);
      } catch (err) {
        console.warn('[TAGTOP Adapter] Supabase proof rejection update failed:', err);
      }
    }
  },
};
