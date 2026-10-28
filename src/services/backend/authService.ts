/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Supabase Authentication Service
 * Manages customer registration, sign-in, session recovery, and role detection.
 */

import { supabase, isSupabaseConfigured } from '../supabase/client';
import { TagtopUserRole } from '../../types/database.types';

export interface AuthUserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: TagtopUserRole;
  preferredLanguage: string;
}

export const authService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  async getCurrentSession() {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('[TAGTOP Auth] Error retrieving session:', error.message);
      return null;
    }
    return data.session;
  },

  async getCurrentUser(): Promise<AuthUserProfile | null> {
    if (!supabase) return null;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Fetch user role and profile from public.users table
    const { data: profile } = await supabase
      .from('users')
      .select('id, email, full_name, phone, role, preferred_language')
      .eq('id', user.id)
      .maybeSingle();

    const profileData = profile as {
      id: string;
      email: string;
      full_name: string;
      phone: string;
      role: TagtopUserRole;
      preferred_language: string;
    } | null;

    return {
      id: user.id,
      email: user.email || '',
      fullName: profileData?.full_name || user.user_metadata?.full_name || '',
      phone: profileData?.phone || user.user_metadata?.phone || '',
      role: profileData?.role || 'customer',
      preferredLanguage: profileData?.preferred_language || 'fr',
    };
  },

  async signUp(email: string, password: string, fullName: string, phone: string, lang = 'fr') {
    if (!supabase) throw new Error('Supabase client not configured');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          preferred_language: lang,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase client not configured');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    if (!supabase) throw new Error('Supabase client not configured');
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#reset-password`,
    });
    if (error) throw error;
    return data;
  },

  onAuthStateChange(callback: (user: AuthUserProfile | null) => void) {
    if (!supabase) return () => {};
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await authService.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  },
};
