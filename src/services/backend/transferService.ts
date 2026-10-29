/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Supabase Bank Transfer & Subscription Renewal Service
 * Manages customer bank transfer renewal submissions and retrieval.
 */

import { supabase } from '../supabase/client';
import { BankTransferRenewal, TransferStatus } from '../../types';
import { Database } from '../../types/database.types';

type TransferRow = Database['public']['Tables']['bank_transfers']['Row'];

export function mapRowToTransfer(row: TransferRow): BankTransferRenewal {
  return {
    id: row.id,
    profileId: row.profile_id,
    profileName: row.profile_name || '',
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    amountMAD: Number(row.amount_mad),
    periodDescription:
      row.period_description ||
      (Number(row.amount_mad) === 150 ? 'Renouvellement 6 mois' : 'Renouvellement 1 an'),
    receiptNumber: row.receipt_number,
    submittedAt: row.submitted_at,
    status: row.status as TransferStatus,
    founderNotes: row.founder_notes || undefined,
    verifiedAt: row.verified_at || undefined,
  };
}

export const transferService = {
  /**
   * Submits a customer bank transfer renewal to Supabase.
   * Security & Integrity Enforcements:
   * 1. RLS policy ("Customers submit renewal transfers") verifies auth.uid() owns the profile.
   * 2. Trigger ("trg_enforce_bank_transfer_immutability") forces customer_id = auth.uid(),
   *    verifies ownership, sets status = 'pending', and clears admin fields.
   * 3. Table CHECK constraint strictly enforces amount_mad IN (150.00, 200.00).
   */
  async createRenewalTransfer(
    transfer: BankTransferRenewal,
    customerId?: string
  ): Promise<BankTransferRenewal> {
    // Strict client-side validation before sending to Supabase
    if (![150, 200].includes(transfer.amountMAD)) {
      throw new Error(
        `Invalid renewal amount: ${transfer.amountMAD} MAD. Valid amounts are strictly 150 MAD (6 months) or 200 MAD (1 year).`
      );
    }

    if (!transfer.profileId || !transfer.profileId.trim()) {
      throw new Error('Profile ID is required for renewal transfer');
    }

    if (!transfer.receiptNumber || !transfer.receiptNumber.trim()) {
      throw new Error('Receipt reference number is required');
    }

    if (!supabase) throw new Error('Supabase client not configured');

    const payload: Database['public']['Tables']['bank_transfers']['Insert'] = {
      profile_id: transfer.profileId.trim(),
      profile_name: transfer.profileName ? transfer.profileName.trim() : '',
      customer_id: customerId || null,
      customer_name: transfer.customerName.trim(),
      customer_phone: transfer.customerPhone.trim(),
      amount_mad: transfer.amountMAD,
      period_description:
        transfer.periodDescription ||
        (transfer.amountMAD === 150 ? 'Renouvellement 6 mois' : 'Renouvellement 1 an'),
      receipt_number: transfer.receiptNumber.trim(),
    };

    const { data, error } = await supabase
      .from('bank_transfers')
      .insert(payload as any)
      .select()
      .single();

    if (error || !data) {
      console.error('[TAGTOP TransferService] Create renewal transfer error:', error?.message);
      throw error || new Error('Failed to create bank transfer renewal');
    }

    return mapRowToTransfer(data as TransferRow);
  },

  /**
   * Retrieves all bank transfer renewals for an authenticated customer.
   * RLS restricts returned rows to transfers belonging to the caller's owned profiles.
   */
  async getCustomerTransfers(customerId?: string): Promise<BankTransferRenewal[]> {
    if (!supabase) return [];

    let query = supabase.from('bank_transfers').select('*');

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data, error } = await query.order('submitted_at', { ascending: false });

    if (error || !data) {
      console.warn('[TAGTOP TransferService] Fetch customer transfers error:', error?.message);
      return [];
    }

    return (data as TransferRow[]).map(mapRowToTransfer);
  },
};

