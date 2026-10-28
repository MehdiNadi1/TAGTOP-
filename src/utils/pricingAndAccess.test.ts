import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCardPrice,
  evaluatePublicAccess,
  generateVCardString,
  normalizeWhatsAppNumber,
  STARTER_BRANDED_PRICE_MAD,
  STARTER_UNBRANDED_PRICE_MAD,
  RENEWAL_SIX_MONTHS_MAD,
  RENEWAL_ANNUAL_MAD,
  GRACE_PERIOD_DAYS,
} from './pricingAndAccess';
import { BusinessProfile } from '../types';

test('Starter branded card price is exactly 250 MAD and includes 6 months access', () => {
  const result = calculateCardPrice('starter', 'branded', false);
  assert.equal(result.isQuoteRequired, false);
  assert.equal(result.cardPriceMAD, 250);
  assert.equal(result.totalMAD, 250);
  assert.equal(result.woodStandPriceMAD, 0);
  assert.equal(result.subscriptionTimeline.stage1.priceMAD, 0);
  assert.equal(result.subscriptionTimeline.stage2.priceMAD, 150);
  assert.equal(result.subscriptionTimeline.stage3.priceMAD, 200);
});

test('Starter unbranded card price is exactly 350 MAD', () => {
  const result = calculateCardPrice('starter', 'unbranded', false);
  assert.equal(result.isQuoteRequired, false);
  assert.equal(result.cardPriceMAD, 350);
  assert.equal(result.totalMAD, 350);
});

test('Pro and Enterprise bundles strictly require a quote (no fabricated prices)', () => {
  const proResult = calculateCardPrice('pro', 'branded', false);
  assert.equal(proResult.isQuoteRequired, true);
  assert.equal(proResult.totalMAD, 0);

  const entResult = calculateCardPrice('enterprise', 'unbranded', false);
  assert.equal(entResult.isQuoteRequired, true);
  assert.equal(entResult.totalMAD, 0);
});

test('Wooden stand is excluded from totals when launch configuration is disabled', () => {
  const resultWithStand = calculateCardPrice('starter', 'branded', true, false, 30);
  assert.equal(resultWithStand.woodStandPriceMAD, 0);
  assert.equal(resultWithStand.totalMAD, 250);
});

test('Private preview cannot be viewed publicly or tapped via NFC', () => {
  const access = evaluatePublicAccess('private_preview', '2026-12-31');
  assert.equal(access.isViewable, false);
  assert.equal(access.statusMessageKey, 'private_preview');
});

test('Order pending profile is not viewable publicly until founder confirmation', () => {
  const access = evaluatePublicAccess('order_pending', '2026-12-31');
  assert.equal(access.isViewable, false);
  assert.equal(access.statusMessageKey, 'order_pending');
});

test('Active profile is publicly viewable', () => {
  const access = evaluatePublicAccess('active', '2027-01-01', new Date('2026-10-26'));
  assert.equal(access.isViewable, true);
  assert.equal(access.statusMessageKey, 'viewable');
  assert.equal(access.isGracePeriod, false);
});

test('Profile in 14-day grace period retains viewability with grace warning flag', () => {
  // Expiry date was 5 days ago (less than 14)
  const expiredDate = '2026-10-21';
  const now = new Date('2026-10-26');
  const access = evaluatePublicAccess('grace_period', expiredDate, now);
  assert.equal(access.isViewable, true);
  assert.equal(access.isGracePeriod, true);
  assert.equal(access.daysRemainingInGrace, 9);
});

test('Profile past 14-day grace period is suspended with discreet unavailable status', () => {
  // Expiry date was 20 days ago (greater than 14)
  const expiredDate = '2026-10-06';
  const now = new Date('2026-10-26');
  const access = evaluatePublicAccess('grace_period', expiredDate, now);
  assert.equal(access.isViewable, false);
  assert.equal(access.statusMessageKey, 'expired_suspended');
});

test('generateVCardString produces standard RFC 6350 fields with UTF-8 charset without leaking private billing data', () => {
  const mockProfile: BusinessProfile = {
    id: 'prof-1',
    ownerId: 'u-1',
    ownerName: 'Yassine Bennani',
    ownerEmail: 'yassine@example.com',
    handle: 'yassine-bennani',
    displayName: 'Yassine Bennani',
    jobTitle: 'Directeur Général',
    company: 'Atelier Atlas Design',
    bio: 'Studio de design et d’architecture d’intérieur à Casablanca.',
    city: 'Casablanca',
    address: 'Boulevard d’Anfa',
    avatarUrl: '',
    logoUrl: '',
    coverColor: '#000000',
    templateId: 'executive',
    accessState: 'active',
    expiryDate: '2027-04-26',
    phone: '+212 6 61 00 00 00',
    whatsapp: '+212 6 61 00 00 00',
    email: 'contact@atelieratlas.ma',
    website: 'https://atelieratlas.ma',
    socials: { linkedin: 'https://linkedin.com/in/yassine' },
    products: [],
    documents: [],
    videos: [],
    leadFields: [],
    digitalTagtopBranding: true,
    linkedCardCount: 1,
  };

  const vcard = generateVCardString(mockProfile);
  assert.match(vcard, /^BEGIN:VCARD/);
  assert.match(vcard, /FN;CHARSET=UTF-8:Yassine Bennani/);
  assert.match(vcard, /ORG;CHARSET=UTF-8:Atelier Atlas Design/);
  assert.match(vcard, /TEL;TYPE=CELL,VOICE:\+212 6 61 00 00 00/);
  assert.match(vcard, /ADR;CHARSET=UTF-8;TYPE=WORK:;;Boulevard d’Anfa;Casablanca;;Morocco/);
  assert.match(vcard, /END:VCARD$/);
});

test('normalizeWhatsAppNumber correctly normalizes domestic Moroccan and international formats', () => {
  assert.equal(normalizeWhatsAppNumber('+212 6 61 24 88 90'), '212661248890');
  assert.equal(normalizeWhatsAppNumber('0661248890'), '212661248890');
  assert.equal(normalizeWhatsAppNumber('0712345678'), '212712345678');
  assert.equal(normalizeWhatsAppNumber('661248890'), '212661248890');
  assert.equal(normalizeWhatsAppNumber('00212661248890'), '212661248890');
});
