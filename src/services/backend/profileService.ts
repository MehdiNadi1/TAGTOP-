/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Supabase Profile Service
 * Manages fetching public profiles via secure RPC, owner CRUD operations, and data transformations.
 */

import { supabase } from '../supabase/client';
import { BusinessProfile } from '../../types';
import { Database } from '../../types/database.types';

type ProfileRow = Database['public']['Tables']['business_profiles']['Row'];

function mapRowToBusinessProfile(row: ProfileRow, ownerEmail = ''): BusinessProfile {
  return {
    id: row.id,
    ownerId: row.owner_id || '',
    ownerName: row.display_name,
    ownerEmail: ownerEmail || (row as any).email || '',
    handle: row.handle,
    displayName: row.display_name,
    jobTitle: row.job_title || '',
    company: row.company || '',
    bio: row.bio || '',
    city: row.city || 'Casablanca',
    address: row.address || '',
    avatarUrl: row.avatar_url || '',
    logoUrl: row.logo_url || '',
    coverColor: row.cover_color || '#111827',
    templateId: row.template_id || 'executive',
    accessState: row.access_state || 'private_preview',
    expiryDate: row.expiry_date,
    graceDeadlineDate: row.grace_deadline_date || undefined,
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    email: row.email || '',
    website: row.website || '',
    socials: (row.socials as any) || {},
    products: (row.products as any) || [],
    documents: (row.documents as any) || [],
    videos: (row.videos as any) || [],
    leadFields: (row.lead_fields as any) || [],
    digitalTagtopBranding: row.digital_tagtop_branding ?? true,
    linkedCardCount: row.linked_card_count || 0,
  };
}

export const profileService = {
  /**
   * Retrieves public profile via get_public_profile RPC.
   * Guarantees that private preview profiles are hidden and suspended profiles have private data redacted.
   */
  async getPublicProfile(handleOrId: string): Promise<BusinessProfile | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await (supabase as any).rpc('get_public_profile', {
        p_handle_or_id: handleOrId,
      });

      if (error || !data) {
        if (error) console.warn('[TAGTOP ProfileService] Public profile fetch error via RPC:', error.message);
        return null;
      }

      return mapRowToBusinessProfile(data as ProfileRow);
    } catch (err) {
      console.warn('[TAGTOP ProfileService] Error calling get_public_profile:', err);
      return null;
    }
  },

  async getCustomerProfiles(ownerId: string): Promise<BusinessProfile[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('[TAGTOP ProfileService] Customer profiles fetch error:', error?.message);
      return [];
    }

    return (data as ProfileRow[]).map((row) => mapRowToBusinessProfile(row));
  },

  async upsertProfile(profile: BusinessProfile): Promise<BusinessProfile> {
    if (!supabase) throw new Error('Supabase client not configured');

    const payload = {
      id: profile.id,
      owner_id: profile.ownerId,
      handle: profile.handle,
      display_name: profile.displayName,
      job_title: profile.jobTitle,
      company: profile.company,
      bio: profile.bio,
      city: profile.city,
      address: profile.address,
      avatar_url: profile.avatarUrl,
      logo_url: profile.logoUrl,
      cover_color: profile.coverColor,
      template_id: profile.templateId,
      access_state: profile.accessState,
      expiry_date: profile.expiryDate,
      grace_deadline_date: profile.graceDeadlineDate || null,
      phone: profile.phone,
      whatsapp: profile.whatsapp,
      email: profile.email,
      website: profile.website,
      socials: profile.socials as any,
      products: profile.products as any,
      documents: profile.documents as any,
      videos: profile.videos as any,
      lead_fields: profile.leadFields as any,
      digital_tagtop_branding: profile.digitalTagtopBranding,
      linked_card_count: profile.linkedCardCount,
    };

    const { data, error } = await (supabase.from('business_profiles') as any)
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    return mapRowToBusinessProfile(data as ProfileRow);
  },
};
