export type Language = 'fr' | 'ar' | 'en';

export type AppView = 
  | 'marketing' 
  | 'customer-dashboard' 
  | 'founder-dashboard' 
  | 'public-profile';

export type MarketingSubPage = 
  | 'home'
  | 'how-it-works'
  | 'features'
  | 'cards'
  | 'pricing'
  | 'demo'
  | 'about'
  | 'faq'
  | 'contact'
  | 'configurator'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'terms'
  | 'privacy';

export type CustomerTab = 
  | 'overview'
  | 'profiles'
  | 'cards-orders'
  | 'leads'
  | 'analytics'
  | 'subscription'
  | 'settings';

export type FounderTab = 
  | 'overview'
  | 'customers'
  | 'orders'
  | 'nfc-registry'
  | 'transfers'
  | 'grace-suspension'
  | 'configuration';

export type CardColor = 'black' | 'white';
export type CardBranding = 'branded' | 'unbranded';
export type PackageTier = 'starter' | 'pro' | 'enterprise';

export type ProfileAccessState = 
  | 'private_preview'     // Owner only, not public, not NFC-tapable
  | 'order_pending'      // Card ordered, awaiting review/delivery
  | 'active'             // Confirmed & live
  | 'renewal_due'        // Renewal approaching within 30 days
  | 'grace_period'       // 14-day grace period with active access & clear warning
  | 'expired_suspended'  // Public profile hidden; discreet unavailable message; private editing preserved
  | 'restored';          // Access restored after transfer confirmation

export type OrderStatus = 
  | 'received'
  | 'artwork_review'
  | 'customer_approved'
  | 'production'
  | 'linked'
  | 'shipped'
  | 'delivered';

export type PaymentStatus = 
  | 'cod_pending' 
  | 'cod_collected';

export type TransferStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected';

export interface ProductServiceItem {
  id: string;
  name: string;
  category: string;
  priceMAD: number;
  description: string;
  imageUrl?: string;
  isAvailable: boolean;
  externalLink?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  size: string;
  fileType: string;
  url: string;
}

export interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export interface LeadFieldConfig {
  id: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'textarea';
  required: boolean;
  enabled: boolean;
}

export interface BusinessProfile {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  handle: string;
  displayName: string;
  jobTitle: string;
  company: string;
  bio: string;
  city: string;
  address: string;
  avatarUrl: string;
  logoUrl: string;
  coverColor: string;
  templateId: 'executive' | 'creative' | 'artisan';
  accessState: ProfileAccessState;
  expiryDate: string; // ISO date string
  graceDeadlineDate?: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  socials: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  products: ProductServiceItem[];
  documents: DocumentItem[];
  videos: VideoItem[];
  leadFields: LeadFieldConfig[];
  digitalTagtopBranding: boolean; // digital branding removal entitlement
  linkedCardCount: number;
}

export interface LeadSubmission {
  id: string;
  profileId: string;
  profileName: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  notes?: string;
  submittedAt: string;
  promotionalConsent: boolean; // separate voluntary opt-in
}

export interface NfcCardOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  city: string;
  address: string;
  packageTier: PackageTier;
  cardColor: CardColor;
  cardBranding: CardBranding;
  cardQuantity: number;
  priceMAD: number;
  woodenStandSelected: boolean;
  woodenStandPriceMAD: number; // 0 when unavailable
  profileId: string;
  profileName: string;
  logoFileName?: string;
  logoPreviewUrl?: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  proofUrl?: string;
  proofApproved: boolean;
  proofRejectionReason?: string;
  cardUid?: string;
}

export interface NfcCardRegistryItem {
  uid: string;
  serialNumber: string;
  cardColor: CardColor;
  cardBranding: CardBranding;
  linkedProfileId: string;
  linkedProfileName: string;
  customerName: string;
  orderId: string;
  provisionedAt: string;
  status: 'active' | 'in_transit' | 'pending_link';
}

export interface BankTransferRenewal {
  id: string;
  profileId: string;
  profileName: string;
  customerName: string;
  customerPhone: string;
  amountMAD: number;
  periodDescription: string;
  receiptNumber: string;
  submittedAt: string;
  status: TransferStatus;
  founderNotes?: string;
  verifiedAt?: string;
}

export interface SystemSettings {
  starterBrandedPriceMAD: number;
  starterUnbrandedPriceMAD: number;
  renewalSixMonthsMAD: number;
  renewalAnnualMAD: number;
  woodenStandEnabled: boolean;
  woodenStandPriceMAD: number;
  supportWhatsAppNumber: string;
  bankAccountDetails: string;
}
