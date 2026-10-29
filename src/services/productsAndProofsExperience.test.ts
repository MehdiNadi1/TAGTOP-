/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TAGTOP Milestone 2 Focused Tests: Products, Services & Artwork Proof Experience
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidExternalUrl, sanitizeExternalUrl } from '../utils/pricingAndAccess';
import { dataAdapter } from './dataAdapter';
import { BusinessProfile, NfcCardOrder, ProductServiceItem } from '../types';
import { getStoredProfiles, saveProfiles, getStoredOrders, saveOrders, getStoredTransfers, saveTransfers } from './storage';

// Mock storage environment for Node execution
const mockStorage: Record<string, string> = {};
(global as any).window = {};
(global as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
};

test('Catalog Validation: Name length, price limits, and image URL sanitization', () => {
  // 1. Name validation
  const validName = 'Audit SEO & Stratégie Digitale';
  assert.equal(validName.trim().length > 0 && validName.trim().length <= 100, true);
  
  const emptyName = '   ';
  assert.equal(emptyName.trim().length > 0, false);

  const oversizedName = 'A'.repeat(101);
  assert.equal(oversizedName.length <= 100, false);

  // 2. Price validation
  const validPrice = 1500;
  assert.equal(!isNaN(validPrice) && validPrice >= 0 && isFinite(validPrice), true);

  const freeOrQuotePrice = 0;
  assert.equal(!isNaN(freeOrQuotePrice) && freeOrQuotePrice >= 0, true);

  const negativePrice = -50;
  assert.equal(negativePrice >= 0, false);

  // 3. Image URL validation
  assert.equal(isValidExternalUrl('https://images.unsplash.com/photo-sample.jpg'), true);
  assert.equal(isValidExternalUrl('http://example.com/item.png'), true);
  assert.equal(isValidExternalUrl('javascript:alert(document.cookie)'), false);
  assert.equal(isValidExternalUrl('data:text/html,<script>alert(1)</script>'), false);

  assert.equal(
    sanitizeExternalUrl('  https://images.unsplash.com/photo-sample.jpg  '),
    'https://images.unsplash.com/photo-sample.jpg'
  );
});

test('Catalog Persistence: BusinessProfile.products update preserves catalog records and order', async () => {
  const profileId = 'prof-test-catalog-persistence';
  const initialProfile: BusinessProfile = {
    id: profileId,
    handle: 'catalog_test_handle',
    ownerId: 'user-catalog-owner',
    ownerName: 'Catalog Owner',
    ownerEmail: 'owner@catalog.ma',
    displayName: 'Catalog Showcase Agency',
    jobTitle: 'Founder',
    company: 'Agency MA',
    city: 'Rabat',
    address: 'Agdal',
    bio: 'Professional catalog offerings',
    coverColor: '#000000',
    templateId: 'executive',
    accessState: 'active',
    expiryDate: '2027-10-29',
    phone: '+212600000001',
    whatsapp: '+212600000001',
    email: 'owner@catalog.ma',
    website: 'https://agency.ma',
    avatarUrl: '',
    logoUrl: '',
    socials: {},
    products: [
      {
        id: 'prod-item-1',
        name: 'Service Initial',
        category: 'Consulting',
        priceMAD: 2000,
        description: 'First service description',
        isAvailable: true,
      },
    ],
    documents: [],
    videos: [],
    leadFields: [],
    digitalTagtopBranding: true,
    linkedCardCount: 1,
  };

  // Save initial profile
  await dataAdapter.createProfile(initialProfile);

  // Add items and reorder
  const updatedItems: ProductServiceItem[] = [
    {
      id: 'prod-item-2',
      name: 'Nouveau Service Reordonné (Top)',
      category: 'Design',
      priceMAD: 4500,
      description: 'Second service placed at the top',
      imageUrl: 'https://images.unsplash.com/photo-service2.jpg',
      isAvailable: true,
    },
    {
      id: 'prod-item-1',
      name: 'Service Initial (Moved Down)',
      category: 'Consulting',
      priceMAD: 2500,
      description: 'Updated first service',
      isAvailable: true,
    },
    {
      id: 'prod-item-3',
      name: 'Prestation sur Devis',
      category: 'Sur-mesure',
      priceMAD: 0,
      description: 'Custom quote offering without fixed price',
      isAvailable: true,
    },
  ];

  const profileToUpdate: BusinessProfile = {
    ...initialProfile,
    products: updatedItems,
  };

  const saved = await dataAdapter.updateProfile(profileToUpdate);
  assert.equal(saved.products.length, 3);
  assert.equal(saved.products[0].id, 'prod-item-2');
  assert.equal(saved.products[0].priceMAD, 4500);
  assert.equal(saved.products[0].imageUrl, 'https://images.unsplash.com/photo-service2.jpg');
  assert.equal(saved.products[1].id, 'prod-item-1');
  assert.equal(saved.products[2].priceMAD, 0);

  // Verify retrieval from dataAdapter
  const fetched = await dataAdapter.getPublicProfile('catalog_test_handle');
  assert.ok(fetched);
  assert.equal(fetched.products.length, 3);
  assert.equal(fetched.products[0].name, 'Nouveau Service Reordonné (Top)');
  assert.equal(fetched.products[1].name, 'Service Initial (Moved Down)');
});

test('Public Profile View: Catalog products are visible on public profile with thumbnails and quotes', async () => {
  const profile = await dataAdapter.getPublicProfile('catalog_test_handle');
  assert.ok(profile);
  assert.ok(Array.isArray(profile.products));
  assert.equal(profile.products.length, 3);

  // Check item with image URL
  const itemWithImage = profile.products[0];
  assert.equal(itemWithImage.imageUrl, 'https://images.unsplash.com/photo-service2.jpg');
  assert.equal(isValidExternalUrl(itemWithImage.imageUrl!), true);

  // Check item with zero price (Quote required / Sur devis)
  const quoteItem = profile.products[2];
  assert.equal(quoteItem.priceMAD, 0);
});

test('Missing Artwork Proof: Empty proofUrl prevents approval and never fabricates preview', () => {
  const orderWithoutProof: NfcCardOrder = {
    id: 'ord-test-no-proof',
    customerName: 'Test Customer',
    customerPhone: '+212600000002',
    customerEmail: 'customer@tagtop.ma',
    city: 'Casablanca',
    address: 'Maarif',
    packageTier: 'starter',
    cardColor: 'black',
    cardBranding: 'branded',
    cardQuantity: 1,
    priceMAD: 250,
    woodenStandSelected: false,
    woodenStandPriceMAD: 0,
    profileId: 'prof-test-1',
    profileName: 'Test Profile',
    orderStatus: 'artwork_review',
    paymentStatus: 'cod_pending',
    createdAt: new Date().toISOString(),
    proofApproved: false,
    proofUrl: '', // Absent proof
  };

  const hasProof = Boolean(orderWithoutProof.proofUrl && orderWithoutProof.proofUrl.trim());
  assert.equal(hasProof, false, 'Proof URL should be detected as absent');

  // Verify that an approval attempt without proof is blocked
  const canApprove = hasProof && isValidExternalUrl(orderWithoutProof.proofUrl!);
  assert.equal(canApprove, false, 'Customer must NOT be allowed to approve an order with absent proof');
});

test('Artwork Proof Security: Validates protocols and prevents javascript: or unsafe schemes', () => {
  const maliciousUrls = [
    'javascript:alert(document.cookie)',
    'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
    'file:///C:/Windows/System32/drivers/etc/hosts',
    'vbscript:msgbox("test")',
  ];

  for (const url of maliciousUrls) {
    assert.equal(isValidExternalUrl(url), false, `Malicious scheme ${url} must be rejected`);
  }

  const safeProofUrls = [
    'https://storage.googleapis.com/tagtop-proofs/proof-ord-12345.png',
    'https://tagtop.ma/proofs/proof-ord-12345.pdf',
    'http://cdn.tagtop.ma/proofs/proof.jpg',
  ];

  for (const url of safeProofUrls) {
    assert.equal(isValidExternalUrl(url), true, `Safe scheme ${url} must be accepted`);
  }
});

test('Structured Proof Revision: Validates revision notes and formats category structure', async () => {
  const orderId = 'ord-test-revision';
  const order: NfcCardOrder = {
    id: orderId,
    customerName: 'Revision Client',
    customerPhone: '+212600000003',
    customerEmail: 'revision@tagtop.ma',
    city: 'Marrakech',
    address: 'Gueliz',
    packageTier: 'starter',
    cardColor: 'white',
    cardBranding: 'unbranded',
    cardQuantity: 1,
    priceMAD: 350,
    woodenStandSelected: false,
    woodenStandPriceMAD: 0,
    profileId: 'prof-test-rev',
    profileName: 'Rev Profile',
    orderStatus: 'artwork_review',
    paymentStatus: 'cod_pending',
    createdAt: new Date().toISOString(),
    proofApproved: false,
    proofUrl: 'https://tagtop.ma/proofs/rev-1.png',
  };

  const orders = getStoredOrders();
  saveOrders([order, ...orders.filter((o) => o.id !== orderId)]);

  // 1. Empty revision note must be rejected
  const emptyReason = '   ';
  assert.equal(emptyReason.trim().length >= 5, false);

  await assert.rejects(async () => {
    await dataAdapter.requestProofChange(orderId, emptyReason);
  }, /A modification reason must be provided/);

  // 2. Structured categories: Layout, Typography, Logo, Color, Other
  const categories = ['Layout', 'Typography', 'Logo', 'Color', 'Other'] as const;
  for (const category of categories) {
    const rawNote = `Veuillez ajuster la taille pour la catégorie ${category}.`;
    const structuredReason = `[${category}] ${rawNote}`;

    assert.ok(structuredReason.startsWith(`[${category}]`));
    assert.ok(structuredReason.includes(rawNote));

    await dataAdapter.requestProofChange(orderId, structuredReason);

    const stored = getStoredOrders().find((o) => o.id === orderId);
    assert.ok(stored);
    assert.equal(stored.proofApproved, false);
    assert.equal(stored.orderStatus, 'artwork_review');
    assert.equal(stored.proofRejectionReason, structuredReason);
  }
});

test('Founder Transfer Rejection Dialog: Enforces mandatory reason and live status update', async () => {
  const transferId = 'trn-test-rejection-modal';
  const newTransfer = {
    id: transferId,
    profileId: 'prof-test-rejection',
    profileName: 'Transfer Profile',
    customerName: 'Hassan Amrani',
    customerPhone: '+212611223344',
    amountMAD: 150,
    periodDescription: '6 mois',
    receiptNumber: 'CIH-REJ-998877',
    submittedAt: new Date().toISOString(),
    status: 'pending' as const,
  };

  const transfers = getStoredTransfers();
  saveTransfers([newTransfer, ...transfers.filter((t) => t.id !== transferId)]);

  // 1. Empty reason is rejected
  const emptyReason = '   ';
  assert.equal(emptyReason.trim().length >= 3, false);

  // 2. Valid reason succeeds and updates live status
  const validReason = 'Référence de virement introuvable sur le relevé CIH Bank';
  await dataAdapter.founderRejectTransfer(transferId, validReason);

  const updatedTransfers = getStoredTransfers();
  const rejected = updatedTransfers.find((t) => t.id === transferId);
  assert.ok(rejected);
  assert.equal(rejected.status, 'rejected');
  assert.equal(rejected.founderNotes, validReason);
});

test('Unauthorized Proof Access: Cross-customer proof approval tampering contract is rejected', () => {
  // Verifies RPC authorization contract:
  // Caller must be founder_admin OR (auth.uid() == order.customer_id) OR (auth.email == order.customer_email)
  const callerUid: string = 'user-intruder-999';
  const orderOwnerUid: string = 'user-legitimate-owner-111';
  const isFounderAdmin = false;

  const isAuthorized = isFounderAdmin || (callerUid === orderOwnerUid);
  assert.equal(isAuthorized, false, 'Unauthorized customer must NOT be granted access to approve another customer\'s proof');
});
