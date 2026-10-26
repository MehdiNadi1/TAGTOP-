import { BusinessProfile, CardBranding, PackageTier, ProfileAccessState } from '../types';

export const STARTER_BRANDED_PRICE_MAD = 249;
export const STARTER_UNBRANDED_PRICE_MAD = 349;
export const RENEWAL_SIX_MONTHS_MAD = 99;
export const RENEWAL_ANNUAL_MAD = 199;
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
 * Calculates card pricing strictly adhering to the confirmed launch rules.
 * Pro and Enterprise packages are strictly "Sur devis" / quote required.
 * Wooden stands are initially disabled/unavailable for purchase (0 MAD).
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
 * Builds RFC 6350 / vCard 3.0 content string for mobile contact download.
 */
export function generateVCardString(profile: BusinessProfile): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.displayName}`,
    `N:${profile.displayName};;;;`,
    `ORG:${profile.company}`,
    `TITLE:${profile.jobTitle}`,
  ];

  if (profile.phone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${profile.phone}`);
  }
  if (profile.whatsapp && profile.whatsapp !== profile.phone) {
    lines.push(`TEL;TYPE=WORK,MSG:${profile.whatsapp}`);
  }
  if (profile.email) {
    lines.push(`EMAIL;TYPE=PREF,INTERNET:${profile.email}`);
  }
  if (profile.website) {
    lines.push(`URL:${profile.website}`);
  }
  if (profile.city || profile.address) {
    lines.push(`ADR;TYPE=WORK:;;${profile.address || ''};${profile.city || ''};;Maroc`);
  }
  if (profile.bio) {
    const cleanBio = profile.bio.replace(/\r?\n/g, ' ');
    lines.push(`NOTE:${cleanBio}`);
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
  anchor.download = `${profile.displayName.toLowerCase().replace(/\s+/g, '_')}_tagtop.vcf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
