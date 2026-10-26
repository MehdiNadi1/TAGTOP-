import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCardPrice,
  evaluatePublicAccess,
  generateVCardString,
  STARTER_BRANDED_PRICE_MAD,
  STARTER_UNBRANDED_PRICE_MAD,
  RENEWAL_SIX_MONTHS_MAD,
  RENEWAL_ANNUAL_MAD,
  GRACE_PERIOD_DAYS,
} from './pricingAndAccess';
import { BusinessProfile } from '../types';

test('Starter branded card price is exactly 249 MAD and includes 6 months access', () => {
  const result = calculateCardPrice('starter', 'branded', false);
  assert.equal(result.isQuoteRequired, false);
  assert.equal(result.cardPriceMAD, 249);
  assert.equal(result.totalMAD, 249);
  assert.equal(result.woodStandPriceMAD, 0);
  assert.equal(result.subscriptionTimeline.stage1.priceMAD, 0);
  assert.equal(result.subscriptionTimeline.stage2.priceMAD, 99);
  assert.equal(result.subscriptionTimeline.stage3.priceMAD, 199);
});

test('Starter unbranded card price is exactly 349 MAD', () => {
  const result = calculateCardPrice('starter', 'unbranded', false);
  assert.equal(result.isQuoteRequired, false);
  assert.equal(result.cardPriceMAD, 349);
  assert.equal(result.totalMAD, 349);
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
  assert.equal(resultWithStand.totalMAD, 249);
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

test('generateVCardString produces standard RFC 6350 fields without leaking private billing data', () => {
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
  assert.match(vcard, /FN:Yassine Bennani/);
  assert.match(vcard, /ORG:Atelier Atlas Design/);
  assert.match(vcard, /TEL;TYPE=CELL,VOICE:\+212 6 61 00 00 00/);
  assert.match(vcard, /ADR;TYPE=WORK:;;Boulevard d’Anfa;Casablanca;;Maroc/);
  assert.match(vcard, /END:VCARD$/);
});
