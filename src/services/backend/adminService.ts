/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Supabase Admin Operations Service
 * Executes secure server-side procedures and administrative queries for Founder Admin dashboard.
 * Requires authenticated session with database role founder_admin.
 */

import { supabase } from '../supabase/client';
import {
  BusinessProfile,
  NfcCardOrder,
  NfcCardRegistryItem,
  BankTransferRenewal,
  SystemSettings,
  TransferStatus,
  ProfileAccessState,
} from '../../types';
import {
  Database,
  TagtopOrderStatus,
  TagtopPaymentStatus,
  TagtopProfileAccessState,
} from '../../types/database.types';
import { mapRowToOrder } from './orderService';
import { mapRowToBusinessProfile } from './profileService';
import { initialSettings } from '../../data/mockData';

type ProfileRow = Database['public']['Tables']['business_profiles']['Row'];
type OrderRow = Database['public']['Tables']['orders']['Row'];
type TransferRow = Database['public']['Tables']['bank_transfers']['Row'];
type CardRow = Database['public']['Tables']['nfc_cards']['Row'];

function mapRowToTransfer(row: TransferRow): BankTransferRenewal {
  return {
    id: row.id,
    profileId: row.profile_id,
    profileName: row.profile_name || '',
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    amountMAD: Number(row.amount_mad),
    periodDescription: row.period_description || (Number(row.amount_mad) === 150 ? 'Renouvellement 6 mois' : 'Renouvellement 1 an'),
    receiptNumber: row.receipt_number,
    submittedAt: row.submitted_at,
    status: row.status as TransferStatus,
    founderNotes: row.founder_notes || undefined,
    verifiedAt: row.verified_at || undefined,
  };
}

export const adminService = {
  /**
   * Verifies if current authenticated user has founder_admin database role via RPC.
   */
  async isFounderAdmin(): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { data, error } = await (supabase as any).rpc('is_founder_admin');
      if (error) {
        console.warn('[TAGTOP AdminService] is_founder_admin check error:', error.message);
        return false;
      }
      return Boolean(data);
    } catch (err) {
      console.warn('[TAGTOP AdminService] is_founder_admin invocation failed:', err);
      return false;
    }
  },

  /**
   * Retrieves all orders across all customers (restricted by RLS to founder_admin).
   */
  async getAllOrders(): Promise<NfcCardOrder[]> {
    if (!supabase) throw new Error('Supabase client not configured');

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[TAGTOP AdminService] Fetch all orders error:', error.message);
      throw error;
    }

    return (data as OrderRow[]).map(mapRowToOrder);
  },

  /**
   * Retrieves all business profiles across all customers (restricted by RLS to founder_admin).
   */
  async getAllProfiles(): Promise<BusinessProfile[]> {
    if (!supabase) throw new Error('Supabase client not configured');

    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[TAGTOP AdminService] Fetch all profiles error:', error.message);
      throw error;
    }

    return (data as ProfileRow[]).map((row) => mapRowToBusinessProfile(row));
  },

  /**
   * Retrieves all bank renewal transfers (restricted by RLS to founder_admin).
   */
  async getAllBankTransfers(): Promise<BankTransferRenewal[]> {
    if (!supabase) throw new Error('Supabase client not configured');

    const { data, error } = await supabase
      .from('bank_transfers')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('[TAGTOP AdminService] Fetch all bank transfers error:', error.message);
      throw error;
    }

    return (data as TransferRow[]).map(mapRowToTransfer);
  },

  /**
   * Retrieves all provisioned NFC cards in the hardware registry.
   */
  async getAllNfcCards(profileNameMap?: Map<string, string>): Promise<NfcCardRegistryItem[]> {
    if (!supabase) throw new Error('Supabase client not configured');

    const { data, error } = await supabase
      .from('nfc_cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[TAGTOP AdminService] Fetch all NFC cards error:', error.message);
      throw error;
    }

    return (data as CardRow[]).map((row) => ({
      uid: row.uid,
      serialNumber: row.serial_number,
      cardColor: row.card_color as any,
      cardBranding: row.card_branding as any,
      status: (row.status === 'active' ? 'active' : row.status === 'in_transit' ? 'in_transit' : 'pending_link') as any,
      linkedProfileId: row.linked_profile_id || '',
      linkedProfileName: row.linked_profile_id
        ? (profileNameMap?.get(row.linked_profile_id) || 'Profil Client')
        : 'Non assignée',
      customerName: row.customer_id ? (profileNameMap?.get(row.linked_profile_id || '') || 'Client TAGTOP') : 'Non assignée',
      orderId: row.order_id || 'ORD-DIRECT',
      provisionedAt: row.provisioned_at || row.created_at,
    }));
  },

  /**
   * Retrieves current system pricing and feature configuration.
   */
  async getSystemSettings(): Promise<SystemSettings> {
    if (!supabase) throw new Error('Supabase client not configured');

    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[TAGTOP AdminService] Fetch system settings error:', error.message);
      throw error;
    }

    if (!data) return initialSettings;

    const row = data as any;
    return {
      starterBrandedPriceMAD: Number(row.starter_branded_price_mad ?? 250),
      starterUnbrandedPriceMAD: Number(row.starter_unbranded_price_mad ?? 350),
      renewalSixMonthsMAD: Number(row.renewal_six_months_mad ?? 150),
      renewalAnnualMAD: Number(row.renewal_annual_mad ?? 200),
      woodenStandEnabled: Boolean(row.wooden_stand_enabled ?? false),
      woodenStandPriceMAD: Number(row.wooden_stand_price_mad ?? 50),
      supportWhatsAppNumber: row.support_whatsapp_number || '+212661248890',
      bankAccountDetails: row.bank_account_details || '',
    };
  },

  /**
   * Approves a bank transfer renewal request via founder_approve_bank_transfer RPC.
   * Server-side procedure verifies founder role, extends profile subscription expiry, and activates profile.
   */
  async approveBankTransfer(transferId: string, founderNotes = ''): Promise<{ success: boolean; newExpiryDate?: string }> {
    if (!supabase) throw new Error('Supabase client not configured');

    const { data, error } = await (supabase as any).rpc('founder_approve_bank_transfer', {
      p_transfer_id: transferId,
      p_founder_notes: founderNotes,
    });

    if (error) {
      console.error('[TAGTOP AdminService] Approve bank transfer error:', error.message);
      throw error;
    }
    return data as any;
  },

  /**
   * Rejects a bank transfer renewal request with mandatory reason via founder_reject_bank_transfer RPC.
   */
  async rejectBankTransfer(transferId: string, reason: string): Promise<{ success: boolean }> {
    if (!supabase) throw new Error('Supabase client not configured');

    const { data, error } = await (supabase as any).rpc('founder_reject_bank_transfer', {
      p_transfer_id: transferId,
      p_reason: reason,
    });

    if (error) {
      console.error('[TAGTOP AdminService] Reject bank transfer error:', error.message);
      throw error;
    }
    return data as any;
  },

  /**
   * Updates fulfillment and COD payment status via founder_update_order_status RPC.
   * If status transitions to 'delivered', server-side procedure automatically activates profile and increments card count.
   */
  async updateOrderStatus(
    orderId: string,
    orderStatus: TagtopOrderStatus,
    paymentStatus?: TagtopPaymentStatus
  ): Promise<{ success: boolean }> {
    if (!supabase) throw new Error('Supabase client not configured');

    const { data, error } = await (supabase as any).rpc('founder_update_order_status', {
      p_order_id: orderId,
      p_order_status: orderStatus,
      p_payment_status: paymentStatus || null,
    });

    if (error) {
      console.error('[TAGTOP AdminService] Update order status error:', error.message);
      throw error;
    }
    return data as any;
  },

  /**
   * Directly updates business profile access state (active, grace_period, expired_suspended, private_preview).
   * Verified founder admin is permitted by RLS and database immutability trigger.
   */
  async updateProfileAccessState(profileId: string, newState: ProfileAccessState | TagtopProfileAccessState): Promise<void> {
    if (!supabase) throw new Error('Supabase client not configured');

    const { error } = await (supabase.from('business_profiles') as any)
      .update({
        access_state: newState,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId);

    if (error) {
      console.error('[TAGTOP AdminService] Update profile access state error:', error.message);
      throw error;
    }
  },

  /**
   * Updates system settings (launch features, support number).
   * Restricted by RLS to founder_admin.
   */
  async updateSystemSettings(newSettings: SystemSettings): Promise<void> {
    if (!supabase) throw new Error('Supabase client not configured');

    const { error } = await (supabase.from('system_settings') as any)
      .update({
        wooden_stand_enabled: newSettings.woodenStandEnabled,
        support_whatsapp_number: newSettings.supportWhatsAppNumber,
        updated_at: new Date().toISOString(),
      })
      .not('id', 'is', null);

    if (error) {
      console.error('[TAGTOP AdminService] Update system settings error:', error.message);
      throw error;
    }
  },

  /**
   * Evaluates subscription lifecycles across all active and grace profiles.
   */
  async evaluateSubscriptions(): Promise<{ evaluated_date: string; profiles_in_grace: number; profiles_suspended: number }> {
    if (!supabase) throw new Error('Supabase client not configured');

    const { data, error } = await (supabase as any).rpc('evaluate_profile_subscriptions');
    if (error) {
      console.error('[TAGTOP AdminService] Evaluate subscriptions error:', error.message);
      throw error;
    }
    return data as any;
  },
};
