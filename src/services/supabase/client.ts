/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Supabase Client Initialization
 * Safe initialization supporting both live backend connectivity and offline/demo fallback.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';

const env =
  (typeof import.meta !== 'undefined' && (import.meta as any).env) ||
  (typeof process !== 'undefined' && process.env) ||
  {};

const supabaseUrl = (env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY as string) || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim().length > 0 &&
    !supabaseUrl.includes('your-project-id') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseAnonKey.includes('your-supabase-public-anon-key')
  );
};

// Singleton instance (null when not configured)
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured()
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Returns the active Supabase client or throws a descriptive error if called when unconfigured.
 */
export function getRequiredSupabaseClient(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error(
      '[TAGTOP Supabase] Supabase client is not configured. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env configuration.'
    );
  }
  return supabase;
}
