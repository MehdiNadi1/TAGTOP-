/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Supabase Admin Operations Service
 * Executes secure server-side procedures for Founder Admin dashboard.
 */

import { supabase } from '../supabase/client';
import { TagtopOrderStatus, TagtopPaymentStatus } from '../../types/database.types';

export const adminService = {
  async approveBankTransfer(transferId: string, founderNotes = ''): Promise<{ success: boolean; newExpiryDate?: string }> {
    if (!supabase) throw new Error('Supabase client not configured');

    const { data, error } = await (supabase as any).rpc('founder_approve_bank_transfer', {
      p_transfer_id: transferId,
      p_founder_notes: founderNotes,
    });

    if (error) throw error;
    return data as any;
  },

  async rejectBankTransfer(transferId: string, reason: string): Promise<{ success: boolean }> {
    if (!supabase) throw new Error('Supabase client not configured');

    const { data, error } = await (supabase as any).rpc('founder_reject_bank_transfer', {
      p_transfer_id: transferId,
      p_reason: reason,
    });

    if (error) throw error;
    return data as any;
  },

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

    if (error) throw error;
    return data as any;
  },

  async evaluateSubscriptions(): Promise<{ evaluated_date: string; profiles_in_grace: number; profiles_suspended: number }> {
    if (!supabase) throw new Error('Supabase client not configured');

    const { data, error } = await (supabase as any).rpc('evaluate_profile_subscriptions');
    if (error) throw error;
    return data as any;
  },
};
