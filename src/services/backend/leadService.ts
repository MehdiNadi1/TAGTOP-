/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Supabase Lead & NFC Card Services
 */

import { supabase } from '../supabase/client';
import { LeadSubmission } from '../../types';
import { Database } from '../../types/database.types';

type LeadRow = Database['public']['Tables']['leads']['Row'];

function mapRowToLead(row: LeadRow): LeadSubmission {
  return {
    id: row.id,
    profileId: row.profile_id,
    profileName: row.profile_name,
    name: row.name,
    phone: row.phone,
    email: row.email,
    company: row.company || undefined,
    notes: row.notes || undefined,
    submittedAt: row.submitted_at,
    promotionalConsent: row.promotional_consent,
  };
}

export const leadService = {
  async submitLead(lead: LeadSubmission): Promise<LeadSubmission> {
    if (!supabase) throw new Error('Supabase client not configured');

    const payload = {
      profile_id: lead.profileId,
      profile_name: lead.profileName,
      name: lead.name,
      phone: lead.phone,
      email: lead.email || '',
      company: lead.company || '',
      notes: lead.notes || '',
      promotional_consent: Boolean(lead.promotionalConsent),
    };

    const { data, error } = await (supabase.from('leads') as any)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return mapRowToLead(data as LeadRow);
  },

  async getProfileLeads(profileId: string): Promise<LeadSubmission[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('profile_id', profileId)
      .order('submitted_at', { ascending: false });

    if (error || !data) {
      console.warn('[TAGTOP LeadService] Fetch leads error:', error?.message);
      return [];
    }

    return (data as LeadRow[]).map((row) => mapRowToLead(row));
  },
};

export const cardService = {
  /**
   * Resolves NFC card tap using the secure resolve_nfc_card RPC.
   * Protects card owner and order information from anonymous scrapers.
   */
  async resolveCardUid(uidOrSerial: string): Promise<string | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await (supabase as any).rpc('resolve_nfc_card', {
        p_uid_or_serial: uidOrSerial,
      });

      if (error || !data) return null;
      return (data as any).linked_profile_id || null;
    } catch (err) {
      console.warn('[TAGTOP CardService] Failed to resolve NFC card via RPC:', err);
      return null;
    }
  },

  async recordAnalyticsEvent(profileId: string, eventType: 'tap' | 'whatsapp_click' | 'vcard_download'): Promise<void> {
    if (!supabase) return;

    try {
      await (supabase as any).rpc('record_profile_event', {
        p_profile_id: profileId,
        p_event_type: eventType,
      });
    } catch (err) {
      console.warn('[TAGTOP CardService] Failed to record analytics event via RPC:', err);
    }
  },
};
