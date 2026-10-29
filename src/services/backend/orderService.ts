/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Supabase Order Service
 * Manages NFC card order placement, proof approval, and order queries.
 */

import { supabase } from '../supabase/client';
import { NfcCardOrder } from '../../types';
import { Database } from '../../types/database.types';

type OrderRow = Database['public']['Tables']['orders']['Row'];

export function mapRowToOrder(row: OrderRow): NfcCardOrder {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    city: row.city,
    address: row.address,
    packageTier: row.package_tier,
    cardColor: row.card_color,
    cardBranding: row.card_branding,
    cardQuantity: row.card_quantity,
    priceMAD: Number(row.price_mad),
    woodenStandSelected: row.wooden_stand_selected,
    woodenStandPriceMAD: Number(row.wooden_stand_price_mad),
    profileId: row.profile_id || '',
    profileName: row.profile_name,
    logoFileName: row.logo_file_name || undefined,
    logoPreviewUrl: row.logo_preview_url || undefined,
    orderStatus: row.order_status,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
    proofUrl: row.proof_url || undefined,
    proofApproved: row.proof_approved,
    proofRejectionReason: row.proof_rejection_reason || undefined,
    cardUid: row.card_uid || undefined,
  };
}

export const orderService = {
  async createOrder(order: NfcCardOrder, customerId?: string): Promise<NfcCardOrder> {
    if (!supabase) throw new Error('Supabase client not configured');

    if (!customerId) {
      // Guest Checkout via narrowly scoped SECURITY DEFINER RPC
      const { data, error } = await (supabase as any).rpc('submit_guest_order', {
        p_customer_name: order.customerName,
        p_customer_phone: order.customerPhone,
        p_customer_email: order.customerEmail,
        p_city: order.city,
        p_address: order.address,
        p_package_tier: order.packageTier,
        p_card_color: order.cardColor,
        p_card_branding: order.cardBranding,
        p_card_quantity: order.cardQuantity,
        p_wooden_stand_selected: order.woodenStandSelected,
        p_profile_name: order.profileName,
        p_logo_file_name: order.logoFileName || null,
        p_logo_preview_url: order.logoPreviewUrl || null,
      });

      if (error || !data) throw error || new Error('Guest checkout failed');

      return {
        ...order,
        id: data.order_id,
        priceMAD: Number(data.price_mad),
        cardQuantity: data.card_quantity,
        orderStatus: data.order_status,
        paymentStatus: data.payment_status,
        profileId: '',
      };
    }

    const payload: Record<string, any> = {
      customer_id: customerId,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_email: order.customerEmail,
      city: order.city,
      address: order.address,
      package_tier: order.packageTier,
      card_color: order.cardColor,
      card_branding: order.cardBranding,
      card_quantity: order.cardQuantity,
      price_mad: order.priceMAD,
      wooden_stand_selected: order.woodenStandSelected,
      wooden_stand_price_mad: order.woodenStandPriceMAD,
      profile_id: order.profileId || null,
      profile_name: order.profileName,
      logo_file_name: order.logoFileName || null,
      logo_preview_url: order.logoPreviewUrl || null,
      order_status: order.orderStatus,
      payment_status: order.paymentStatus,
      proof_approved: order.proofApproved,
      card_uid: order.cardUid || null,
    };

    // If an authoritative non-temporary ID was provided, preserve it; otherwise allow Supabase/Postgres to generate 'ord-<10>'
    if (order.id && !order.id.startsWith('temp-') && !order.id.startsWith('ord-draft-') && !order.id.startsWith('ord-tag-')) {
      payload.id = order.id;
    }

    const { data, error } = await (supabase.from('orders') as any)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return mapRowToOrder(data as OrderRow);
  },

  async getCustomerOrders(customerId?: string, email?: string): Promise<NfcCardOrder[]> {
    if (!supabase) return [];

    let query = supabase.from('orders').select('*');

    if (customerId) {
      query = query.eq('customer_id', customerId);
    } else if (email) {
      query = query.eq('customer_email', email);
    } else {
      return [];
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('[TAGTOP OrderService] Fetch orders error:', error?.message);
      return [];
    }

    return (data as OrderRow[]).map((row) => mapRowToOrder(row));
  },

  /**
   * Safe customer proof approval via server-side procedure.
   */
  async approveProof(orderId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client not configured');

    const { error } = await (supabase as any).rpc('customer_submit_proof_decision', {
      p_order_id: orderId,
      p_approved: true,
      p_rejection_reason: null,
    });

    if (error) throw error;
  },

  /**
   * Safe customer proof revision request via server-side procedure.
   */
  async requestProofChange(orderId: string, reason: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client not configured');

    const { error } = await (supabase as any).rpc('customer_submit_proof_decision', {
      p_order_id: orderId,
      p_approved: false,
      p_rejection_reason: reason,
    });

    if (error) throw error;
  },
};
