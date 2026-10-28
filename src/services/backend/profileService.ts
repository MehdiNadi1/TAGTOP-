/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Supabase Profile Service
 * Manages fetching public profiles, owner CRUD operations, and data transformations.
 */

import { supabase } from '../supabase/client';
import { BusinessProfile } from '../../types';
import { Database } from '../../types/database.types';

type ProfileRow = Database['public']['Tables']['business_profiles']['Row'];

function mapRowToBusinessProfile(row: ProfileRow, ownerEmail = ''): BusinessProfile {
  return {
    id: row.id,
    ownerId: row.owner_id,
    ownerName: row.display_name,
    ownerEmail: ownerEmail || row.email,
    handle: row.handle,
    displayName: row.display_name,
    jobTitle: row.job_title,
    company: row.company,
    bio: row.bio,
    city: row.city,
    address: row.address,
    avatarUrl: row.avatar_url,
    logoUrl: row.logo_url,
    coverColor: row.cover_color,
    templateId: row.template_id,
    accessState: row.access_state,
    expiryDate: row.expiry_date,
    graceDeadlineDate: row.grace_deadline_date || undefined,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    website: row.website,
    socials: (row.socials as any) || {},
    products: (row.products as any) || [],
    documents: (row.documents as any) || [],
    videos: (row.videos as any) || [],
    leadFields: (row.lead_fields as any) || [],
    digitalTagtopBranding: row.digital_tagtop_branding,
    linkedCardCount: row.linked_card_count,
  };
}

export const profileService = {
  async getPublicProfile(handleOrId: string): Promise<BusinessProfile | null> {
    if (!supabase) return null;

    const query = supabase
      .from('business_profiles')
      .select('*')
      .or(`handle.eq.${handleOrId},id.eq.${handleOrId}`)
      .maybeSingle();

    const { data, error } = await query;
    if (error || !data) {
      if (error) console.warn('[TAGTOP ProfileService] Public profile fetch error:', error.message);
      return null;
    }

    return mapRowToBusinessProfile(data as ProfileRow);
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
