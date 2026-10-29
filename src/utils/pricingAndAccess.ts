import { BusinessProfile, CardBranding, PackageTier, ProfileAccessState } from '../types';

export const STARTER_BRANDED_PRICE_MAD = 250;
export const STARTER_UNBRANDED_PRICE_MAD = 350;
export const RENEWAL_SIX_MONTHS_MAD = 150;
export const RENEWAL_ANNUAL_MAD = 200;
export const GRACE_PERIOD_DAYS = 14;

export interface PriceCalculationResult {
  isQuoteRequired: boolean;
  cardPriceMAD: number;
  woodStandPriceMAD: number;
  totalMAD: number;
  subscriptionTimeline: {
    stage1: { label: string; duration: string; priceMAD: number };
    stage2: { label: string; duration: string; priceMAD: number };
    stage3: { label: string; duration: string; priceMAD: number };
  };
}

/**
 * Calculates card pricing strictly adhering to confirmed launch business rules:
 * - Standard branded PVC card: 250 MAD
 * - Unbranded PVC card: 350 MAD
 * - Pro and Enterprise packages: strictly "Sur devis" / quote required
 * - Wooden stands: optional accessory (initially disabled/coming soon unless configured)
 * - Initial access: 6 months included
 * - First renewal: 150 MAD for 6 months
 * - Subsequent renewal: 200 MAD per year
 */
export function calculateCardPrice(
  packageTier: PackageTier,
  cardBranding: CardBranding,
  woodenStandRequested: boolean,
  woodenStandEnabled = false,
  woodenStandPrice = 0
): PriceCalculationResult {
  if (packageTier !== 'starter') {
    return {
      isQuoteRequired: true,
      cardPriceMAD: 0,
      woodStandPriceMAD: 0,
      totalMAD: 0,
      subscriptionTimeline: {
        stage1: { label: 'Inclus avec le forfait', duration: 'Sur devis', priceMAD: 0 },
        stage2: { label: 'Renouvellement 6 mois', duration: 'Sur devis', priceMAD: 0 },
        stage3: { label: 'Renouvellement annuel', duration: 'Sur devis', priceMAD: 0 },
      },
    };
  }

  const cardPriceMAD = cardBranding === 'branded' ? STARTER_BRANDED_PRICE_MAD : STARTER_UNBRANDED_PRICE_MAD;
  const woodStandPriceMAD = (woodenStandRequested && woodenStandEnabled) ? woodenStandPrice : 0;
  const totalMAD = cardPriceMAD + woodStandPriceMAD;

  return {
    isQuoteRequired: false,
    cardPriceMAD,
    woodStandPriceMAD,
    totalMAD,
    subscriptionTimeline: {
      stage1: {
        label: 'Période initiale incluse',
        duration: '6 premiers mois',
        priceMAD: 0,
      },
      stage2: {
        label: 'Premier renouvellement',
        duration: '6 mois suivants',
        priceMAD: RENEWAL_SIX_MONTHS_MAD,
      },
      stage3: {
        label: 'Périodes ultérieures',
        duration: 'Par an',
        priceMAD: RENEWAL_ANNUAL_MAD,
      },
    },
  };
}

/**
 * Calculates renewal extension days strictly following business rules:
 * - 150 MAD -> 180 days (6 months)
 * - 200 MAD -> 365 days (1 year)
 * Rejects invalid amounts.
 */
export function calculateRenewalExtensionDays(amountMAD: number): number {
  if (amountMAD === RENEWAL_SIX_MONTHS_MAD) return 180;
  if (amountMAD === RENEWAL_ANNUAL_MAD) return 365;
  throw new Error(`Invalid renewal amount: ${amountMAD} MAD`);
}

/**
 * Access resolution for public visitors or NFC card taps.
 */
export interface PublicAccessCheckResult {
  isViewable: boolean;
  statusMessageKey: 'viewable' | 'private_preview' | 'order_pending' | 'expired_suspended';
  isGracePeriod: boolean;
  daysRemainingInGrace?: number;
}

export function evaluatePublicAccess(
  accessState: ProfileAccessState,
  expiryDateStr: string,
  now = new Date()
): PublicAccessCheckResult {
  // Private preview cannot be viewed publicly or tapped via NFC
  if (accessState === 'private_preview') {
    return {
      isViewable: false,
      statusMessageKey: 'private_preview',
      isGracePeriod: false,
    };
  }

  // Pending card delivery / activation
  if (accessState === 'order_pending') {
    return {
      isViewable: false,
      statusMessageKey: 'order_pending',
      isGracePeriod: false,
    };
  }

  const expiryDate = new Date(expiryDateStr);
  const diffTime = now.getTime() - expiryDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // If already marked expired_suspended or past grace period
  if (accessState === 'expired_suspended' || diffDays > GRACE_PERIOD_DAYS) {
    return {
      isViewable: false,
      statusMessageKey: 'expired_suspended',
      isGracePeriod: false,
    };
  }

  // If past expiry date but within 14 days grace period
  if (diffDays > 0 && diffDays <= GRACE_PERIOD_DAYS) {
    const daysRemaining = GRACE_PERIOD_DAYS - diffDays;
    return {
      isViewable: true,
      statusMessageKey: 'viewable',
      isGracePeriod: true,
      daysRemainingInGrace: daysRemaining,
    };
  }

  // Normal active or renewal due
  return {
    isViewable: true,
    statusMessageKey: 'viewable',
    isGracePeriod: false,
  };
}

/**
 * Escapes characters for vCard compliance (RFC 2426 / RFC 6350).
 */
export function escapeVCardText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Normalizes Moroccan or international phone number for WhatsApp direct link.
 * Handles:
 * - "+212 6 61 24 88 90" -> "212661248890"
 * - "0661248890" -> "212661248890"
 * - "0712345678" -> "212712345678"
 */
export function normalizeWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.length === 10 && (digits.startsWith('06') || digits.startsWith('07') || digits.startsWith('05'))) {
    return '212' + digits.substring(1);
  }

  if (digits.length === 9 && (digits.startsWith('6') || digits.startsWith('7') || digits.startsWith('5'))) {
    return '212' + digits;
  }

  if (digits.startsWith('00212')) {
    return digits.substring(2);
  }

  return digits;
}

/**
 * Builds RFC 6350 / vCard 3.0 content string with UTF-8 support for mobile contact download.
 */
export function generateVCardString(profile: BusinessProfile): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'PRODID:-//TAGTOP SARL//NFC Smart Business Card//FR',
    `FN;CHARSET=UTF-8:${escapeVCardText(profile.displayName)}`,
    `N;CHARSET=UTF-8:${escapeVCardText(profile.displayName)};;;;`,
    `ORG;CHARSET=UTF-8:${escapeVCardText(profile.company)}`,
    `TITLE;CHARSET=UTF-8:${escapeVCardText(profile.jobTitle)}`,
  ];

  if (profile.phone) {
    const cleanPhone = profile.phone.trim();
    lines.push(`TEL;TYPE=CELL,VOICE:${cleanPhone}`);
  }
  if (profile.whatsapp && profile.whatsapp !== profile.phone) {
    const cleanWa = profile.whatsapp.trim();
    lines.push(`TEL;TYPE=WORK,MSG:${cleanWa}`);
  }
  if (profile.email) {
    lines.push(`EMAIL;TYPE=PREF,INTERNET:${profile.email.trim()}`);
  }
  if (profile.website) {
    lines.push(`URL:${profile.website.trim()}`);
  }
  if (profile.city || profile.address) {
    const addr = escapeVCardText(profile.address || '');
    const city = escapeVCardText(profile.city || '');
    lines.push(`ADR;CHARSET=UTF-8;TYPE=WORK:;;${addr};${city};;Morocco`);
  }
  if (profile.bio) {
    lines.push(`NOTE;CHARSET=UTF-8:${escapeVCardText(profile.bio)}`);
  }

  lines.push('REV:' + new Date().toISOString());
  lines.push('END:VCARD');

  return lines.join('\r\n');
}

/**
 * Initiates native browser vCard file download.
 */
export function downloadVCard(profile: BusinessProfile): void {
  const vcardText = generateVCardString(profile);
  const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  const safeFilename = (profile.displayName || 'contact')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  anchor.download = `${safeFilename || 'contact'}_tagtop.vcf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
