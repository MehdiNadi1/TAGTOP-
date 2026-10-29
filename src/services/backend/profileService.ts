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
   * Guarantees that private preview profiles are hidden from visitors
   * and suspended profiles have private contact/product data redacted.
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

  /**
   * Retrieves all profiles owned by an authenticated customer.
   */
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

  /**
   * Creates a new customer profile in private_preview mode.
   * The database immutability trigger automatically sets:
   * - owner_id = auth.uid()
   * - access_state = 'private_preview'
   * - expiry_date = CURRENT_DATE + 180 days
   */
  async createProfile(profile: Partial<BusinessProfile>): Promise<BusinessProfile> {
    if (!supabase) throw new Error('Supabase client not configured');

    const cleanHandle = (profile.handle || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');

    if (!cleanHandle) {
      throw new Error('A valid handle/slug is required for the profile');
    }

    const payload: Record<string, any> = {
      handle: cleanHandle,
      display_name: (profile.displayName || '').trim() || 'Mon Profil TAGTOP',
      job_title: (profile.jobTitle || '').trim(),
      company: (profile.company || '').trim(),
      bio: (profile.bio || '').trim(),
      city: (profile.city || '').trim() || 'Casablanca',
      address: (profile.address || '').trim(),
      avatar_url: (profile.avatarUrl || '').trim(),
      logo_url: (profile.logoUrl || '').trim(),
      cover_color: profile.coverColor || '#111827',
      template_id: profile.templateId || 'executive',
      phone: (profile.phone || '').trim(),
      whatsapp: (profile.whatsapp || '').trim(),
      email: (profile.email || '').trim(),
      website: (profile.website || '').trim(),
      socials: profile.socials || {},
      products: profile.products || [],
      documents: profile.documents || [],
      videos: profile.videos || [],
      lead_fields: profile.leadFields || [],
      digital_tagtop_branding: profile.digitalTagtopBranding ?? true,
    };

    if (profile.id && profile.id.startsWith('prof-')) {
      payload.id = profile.id;
    }

    const { data, error } = await (supabase.from('business_profiles') as any)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return mapRowToBusinessProfile(data as ProfileRow);
  },

  /**
   * Updates customer-editable fields on an existing profile.
   * Excludes immutable system columns (access_state, expiry_date, owner_id, etc.)
   * to strictly comply with database immutability triggers.
   */
  async updateProfile(profile: BusinessProfile): Promise<BusinessProfile> {
    if (!supabase) throw new Error('Supabase client not configured');

    const cleanHandle = (profile.handle || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');

    const updatePayload = {
      handle: cleanHandle,
      display_name: profile.displayName.trim(),
      job_title: profile.jobTitle.trim(),
      company: profile.company.trim(),
      bio: profile.bio.trim(),
      city: profile.city.trim(),
      address: profile.address.trim(),
      avatar_url: profile.avatarUrl.trim(),
      logo_url: profile.logoUrl.trim(),
      cover_color: profile.coverColor,
      template_id: profile.templateId,
      phone: profile.phone.trim(),
      whatsapp: profile.whatsapp.trim(),
      email: profile.email.trim(),
      website: profile.website.trim(),
      socials: profile.socials as any,
      products: profile.products as any,
      documents: profile.documents as any,
      videos: profile.videos as any,
      lead_fields: profile.leadFields as any,
      digital_tagtop_branding: profile.digitalTagtopBranding,
    };

    const { data, error } = await (supabase.from('business_profiles') as any)
      .update(updatePayload)
      .eq('id', profile.id)
      .select()
      .single();

    if (error) throw error;
    return mapRowToBusinessProfile(data as ProfileRow);
  },

  /**
   * Safe upsert routing: delegates to updateProfile if existing, or createProfile if new.
   */
  async upsertProfile(profile: BusinessProfile): Promise<BusinessProfile> {
    if (profile.id && !profile.id.startsWith('new-')) {
      return this.updateProfile(profile);
    }
    return this.createProfile(profile);
  },
};
