/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Supabase Database TypeScript Definitions
 * Mirrors the PostgreSQL database schema defined in supabase/migrations/
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TagtopUserRole = 'customer' | 'founder_admin';
export type TagtopPackageTier = 'starter' | 'pro' | 'enterprise';
export type TagtopCardColor = 'black' | 'white';
export type TagtopCardBranding = 'branded' | 'unbranded';
export type TagtopProfileTemplate = 'executive' | 'creative' | 'artisan';
export type TagtopProfileAccessState =
  | 'private_preview'
  | 'order_pending'
  | 'active'
  | 'renewal_due'
  | 'grace_period'
  | 'expired_suspended'
  | 'restored';
export type TagtopOrderStatus =
  | 'received'
  | 'artwork_review'
  | 'customer_approved'
  | 'production'
  | 'linked'
  | 'shipped'
  | 'delivered';
export type TagtopPaymentStatus = 'cod_pending' | 'cod_collected';
export type TagtopTransferStatus = 'pending' | 'approved' | 'rejected';
export type TagtopCardStatus = 'active' | 'in_transit' | 'pending_link';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string;
          role: TagtopUserRole;
          preferred_language: string;
          is_demo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          phone?: string;
          role?: TagtopUserRole;
          preferred_language?: string;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string;
          role?: TagtopUserRole;
          preferred_language?: string;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      business_profiles: {
        Row: {
          id: string;
          owner_id: string;
          handle: string;
          display_name: string;
          job_title: string;
          company: string;
          bio: string;
          city: string;
          address: string;
          avatar_url: string;
          logo_url: string;
          cover_color: string;
          template_id: TagtopProfileTemplate;
          access_state: TagtopProfileAccessState;
          expiry_date: string;
          grace_deadline_date: string | null;
          phone: string;
          whatsapp: string;
          email: string;
          website: string;
          socials: Json;
          products: Json;
          documents: Json;
          videos: Json;
          lead_fields: Json;
          digital_tagtop_branding: boolean;
          linked_card_count: number;
          is_demo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          handle: string;
          display_name: string;
          job_title?: string;
          company?: string;
          bio?: string;
          city?: string;
          address?: string;
          avatar_url?: string;
          logo_url?: string;
          cover_color?: string;
          template_id?: TagtopProfileTemplate;
          access_state?: TagtopProfileAccessState;
          expiry_date?: string;
          grace_deadline_date?: string | null;
          phone?: string;
          whatsapp?: string;
          email?: string;
          website?: string;
          socials?: Json;
          products?: Json;
          documents?: Json;
          videos?: Json;
          lead_fields?: Json;
          digital_tagtop_branding?: boolean;
          linked_card_count?: number;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          handle?: string;
          display_name?: string;
          job_title?: string;
          company?: string;
          bio?: string;
          city?: string;
          address?: string;
          avatar_url?: string;
          logo_url?: string;
          cover_color?: string;
          template_id?: TagtopProfileTemplate;
          access_state?: TagtopProfileAccessState;
          expiry_date?: string;
          grace_deadline_date?: string | null;
          phone?: string;
          whatsapp?: string;
          email?: string;
          website?: string;
          socials?: Json;
          products?: Json;
          documents?: Json;
          videos?: Json;
          lead_fields?: Json;
          digital_tagtop_branding?: boolean;
          linked_card_count?: number;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string;
          city: string;
          address: string;
          package_tier: TagtopPackageTier;
          card_color: TagtopCardColor;
          card_branding: TagtopCardBranding;
          card_quantity: number;
          price_mad: number;
          wooden_stand_selected: boolean;
          wooden_stand_price_mad: number;
          profile_id: string | null;
          profile_name: string;
          logo_file_name: string | null;
          logo_preview_url: string | null;
          order_status: TagtopOrderStatus;
          payment_status: TagtopPaymentStatus;
          proof_url: string | null;
          proof_approved: boolean;
          proof_rejection_reason: string | null;
          card_uid: string | null;
          is_demo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string;
          city: string;
          address: string;
          package_tier?: TagtopPackageTier;
          card_color?: TagtopCardColor;
          card_branding?: TagtopCardBranding;
          card_quantity?: number;
          price_mad: number;
          wooden_stand_selected?: boolean;
          wooden_stand_price_mad?: number;
          profile_id?: string | null;
          profile_name?: string;
          logo_file_name?: string | null;
          logo_preview_url?: string | null;
          order_status?: TagtopOrderStatus;
          payment_status?: TagtopPaymentStatus;
          proof_url?: string | null;
          proof_approved?: boolean;
          proof_rejection_reason?: string | null;
          card_uid?: string | null;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string;
          city?: string;
          address?: string;
          package_tier?: TagtopPackageTier;
          card_color?: TagtopCardColor;
          card_branding?: TagtopCardBranding;
          card_quantity?: number;
          price_mad?: number;
          wooden_stand_selected?: boolean;
          wooden_stand_price_mad?: number;
          profile_id?: string | null;
          profile_name?: string;
          logo_file_name?: string | null;
          logo_preview_url?: string | null;
          order_status?: TagtopOrderStatus;
          payment_status?: TagtopPaymentStatus;
          proof_url?: string | null;
          proof_approved?: boolean;
          proof_rejection_reason?: string | null;
          card_uid?: string | null;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      nfc_cards: {
        Row: {
          id: string;
          uid: string;
          serial_number: string;
          card_color: TagtopCardColor;
          card_branding: TagtopCardBranding;
          linked_profile_id: string | null;
          customer_id: string | null;
          order_id: string | null;
          provisioned_at: string;
          status: TagtopCardStatus;
          is_demo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          uid: string;
          serial_number: string;
          card_color?: TagtopCardColor;
          card_branding?: TagtopCardBranding;
          linked_profile_id?: string | null;
          customer_id?: string | null;
          order_id?: string | null;
          provisioned_at?: string;
          status?: TagtopCardStatus;
          is_demo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          uid?: string;
          serial_number?: string;
          card_color?: TagtopCardColor;
          card_branding?: TagtopCardBranding;
          linked_profile_id?: string | null;
          customer_id?: string | null;
          order_id?: string | null;
          provisioned_at?: string;
          status?: TagtopCardStatus;
          is_demo?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          profile_id: string;
          profile_name: string;
          name: string;
          phone: string;
          email: string;
          company: string;
          notes: string;
          promotional_consent: boolean;
          submitted_at: string;
          is_demo: boolean;
        };
        Insert: {
          id?: string;
          profile_id: string;
          profile_name?: string;
          name: string;
          phone: string;
          email?: string;
          company?: string;
          notes?: string;
          promotional_consent?: boolean;
          submitted_at?: string;
          is_demo?: boolean;
        };
        Update: {
          id?: string;
          profile_id?: string;
          profile_name?: string;
          name?: string;
          phone?: string;
          email?: string;
          company?: string;
          notes?: string;
          promotional_consent?: boolean;
          submitted_at?: string;
          is_demo?: boolean;
        };
        Relationships: [];
      };
      bank_transfers: {
        Row: {
          id: string;
          profile_id: string;
          profile_name: string;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string;
          amount_mad: number;
          period_description: string;
          receipt_number: string;
          receipt_file_url: string | null;
          status: TagtopTransferStatus;
          founder_notes: string | null;
          verified_at: string | null;
          verified_by: string | null;
          is_demo: boolean;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          profile_name?: string;
          customer_id?: string | null;
          customer_name: string;
          customer_phone: string;
          amount_mad: number;
          period_description: string;
          receipt_number: string;
          receipt_file_url?: string | null;
          status?: TagtopTransferStatus;
          founder_notes?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
          is_demo?: boolean;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          profile_name?: string;
          customer_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          amount_mad?: number;
          period_description?: string;
          receipt_number?: string;
          receipt_file_url?: string | null;
          status?: TagtopTransferStatus;
          founder_notes?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
          is_demo?: boolean;
          submitted_at?: string;
        };
        Relationships: [];
      };
      analytics_events: {
        Row: {
          id: string;
          profile_id: string;
          event_type: 'tap' | 'whatsapp_click' | 'vcard_download';
          visitor_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          event_type: 'tap' | 'whatsapp_click' | 'vcard_download';
          visitor_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          event_type?: 'tap' | 'whatsapp_click' | 'vcard_download';
          visitor_hash?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      profile_analytics_summary: {
        Row: {
          profile_id: string;
          taps: number;
          whatsapp_clicks: number;
          vcard_downloads: number;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          taps?: number;
          whatsapp_clicks?: number;
          vcard_downloads?: number;
          updated_at?: string;
        };
        Update: {
          profile_id?: string;
          taps?: number;
          whatsapp_clicks?: number;
          vcard_downloads?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      system_settings: {
        Row: {
          id: number;
          starter_branded_price_mad: number;
          starter_unbranded_price_mad: number;
          renewal_six_months_mad: number;
          renewal_annual_mad: number;
          wooden_stand_enabled: boolean;
          wooden_stand_price_mad: number;
          support_whatsapp_number: string;
          bank_account_details: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: number;
          starter_branded_price_mad?: number;
          starter_unbranded_price_mad?: number;
          renewal_six_months_mad?: number;
          renewal_annual_mad?: number;
          wooden_stand_enabled?: boolean;
          wooden_stand_price_mad?: number;
          support_whatsapp_number?: string;
          bank_account_details?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: number;
          starter_branded_price_mad?: number;
          starter_unbranded_price_mad?: number;
          renewal_six_months_mad?: number;
          renewal_annual_mad?: number;
          wooden_stand_enabled?: boolean;
          wooden_stand_price_mad?: number;
          support_whatsapp_number?: string;
          bank_account_details?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_founder_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      resolve_nfc_card: {
        Args: {
          p_uid_or_serial: string;
        };
        Returns: Json;
      };
      get_public_profile: {
        Args: {
          p_handle_or_id: string;
        };
        Returns: Json;
      };
      customer_submit_proof_decision: {
        Args: {
          p_order_id: string;
          p_approved: boolean;
          p_rejection_reason?: string | null;
        };
        Returns: Json;
      };
      record_profile_event: {
        Args: {
          p_profile_id: string;
          p_event_type: string;
        };
        Returns: void;
      };
      founder_approve_bank_transfer: {
        Args: {
          p_transfer_id: string;
          p_founder_notes?: string;
        };
        Returns: Json;
      };
      founder_reject_bank_transfer: {
        Args: {
          p_transfer_id: string;
          p_reason: string;
        };
        Returns: Json;
      };
      founder_update_order_status: {
        Args: {
          p_order_id: string;
          p_order_status: TagtopOrderStatus;
          p_payment_status?: TagtopPaymentStatus | null;
        };
        Returns: Json;
      };
      evaluate_profile_subscriptions: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
    };
    Enums: {
      tagtop_user_role: TagtopUserRole;
      tagtop_package_tier: TagtopPackageTier;
      tagtop_card_color: TagtopCardColor;
      tagtop_card_branding: TagtopCardBranding;
      tagtop_profile_template: TagtopProfileTemplate;
      tagtop_profile_access_state: TagtopProfileAccessState;
      tagtop_order_status: TagtopOrderStatus;
      tagtop_payment_status: TagtopPaymentStatus;
      tagtop_transfer_status: TagtopTransferStatus;
      tagtop_card_status: TagtopCardStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
