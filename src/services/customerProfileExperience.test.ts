import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidExternalUrl, sanitizeExternalUrl } from '../utils/pricingAndAccess';
import { dataAdapter } from './dataAdapter';
import { BusinessProfile } from '../types';

// Mock localStorage in Node environment
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

test('URL Validation: isValidExternalUrl accepts standard https and http schemes', () => {
  assert.equal(isValidExternalUrl('https://example.com'), true);
  assert.equal(isValidExternalUrl('http://example.com'), true);
  assert.equal(isValidExternalUrl('https://sub.domain.ma/path/to/profile?param=1&b=2#section'), true);
  assert.equal(isValidExternalUrl('https://linkedin.com/in/karim-al-ami-123'), true);
  assert.equal(isValidExternalUrl('https://tiktok.com/@creator'), true);
});

test('URL Validation: isValidExternalUrl rejects invalid protocols, XSS vectors, and malformed inputs', () => {
  assert.equal(isValidExternalUrl('javascript:alert(1)'), false);
  assert.equal(isValidExternalUrl('data:text/html,<script>alert(1)</script>'), false);
  assert.equal(isValidExternalUrl('file:///etc/passwd'), false);
  assert.equal(isValidExternalUrl('ftp://example.com'), false);
  assert.equal(isValidExternalUrl('/relative/path/only'), false);
  assert.equal(isValidExternalUrl('not a url'), false);
  assert.equal(isValidExternalUrl(''), false);
  assert.equal(isValidExternalUrl(undefined as any), false);
  assert.equal(isValidExternalUrl(null as any), false);
});

test('URL Sanitization: sanitizeExternalUrl trims whitespace and normalizes prefixes', () => {
  assert.equal(sanitizeExternalUrl('  https://example.com/logo.png  '), 'https://example.com/logo.png');
  assert.equal(sanitizeExternalUrl('linkedin.com/in/karim'), 'https://linkedin.com/in/karim');
  assert.equal(sanitizeExternalUrl(''), '');
  assert.equal(sanitizeExternalUrl('   '), '');
  assert.equal(sanitizeExternalUrl(undefined as any), '');
  assert.equal(sanitizeExternalUrl('javascript:alert(1)'), '');
});

test('Analytics Aggregation: dataAdapter.getProfileAnalytics returns zero-event defaults for inactive profiles', async () => {
  const analytics = await dataAdapter.getProfileAnalytics('nonexistent-profile-id');
  assert.equal(typeof analytics.taps, 'number');
  assert.equal(typeof analytics.whatsappClicks, 'number');
  assert.equal(typeof analytics.vcardDownloads, 'number');
  assert.equal(analytics.taps, 0);
  assert.equal(analytics.whatsappClicks, 0);
  assert.equal(analytics.vcardDownloads, 0);
});

test('Analytics Aggregation: dataAdapter.getProfileAnalytics reflects stored events accurately', async () => {
  const profileId = 'prof-test-analytics-events';
  
  // Record interaction events
  await dataAdapter.recordProfileEvent(profileId, 'tap');
  await dataAdapter.recordProfileEvent(profileId, 'tap');
  await dataAdapter.recordProfileEvent(profileId, 'whatsapp');
  await dataAdapter.recordProfileEvent(profileId, 'vcard');

  const summary = await dataAdapter.getProfileAnalytics(profileId);
  assert.equal(summary.taps, 2);
  assert.equal(summary.whatsappClicks, 1);
  assert.equal(summary.vcardDownloads, 1);
});

test('Customer Profile Model: Supports avatarUrl, logoUrl, and comprehensive socials including TikTok', async () => {
  const testProfile: BusinessProfile = {
    id: 'prof-test-editor-socials',
    handle: 'karim_test_socials',
    ownerId: 'user-test-owner',
    ownerName: 'Karim Test',
    ownerEmail: 'karim@atlas.ma',
    displayName: 'Karim Test',
    jobTitle: 'Consultant',
    company: 'Atlas Advisory',
    city: 'Casablanca',
    address: 'Boulevard d’Anfa',
    bio: 'Business consultant in Casablanca',
    coverColor: '#000000',
    templateId: 'executive',
    accessState: 'active',
    expiryDate: '2027-10-29',
    phone: '+212600000000',
    whatsapp: '+212600000000',
    email: 'karim@atlas.ma',
    website: 'https://atlas.ma',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    logoUrl: 'https://atlas.ma/logo.png',
    socials: {
      linkedin: 'https://linkedin.com/in/karim-test',
      instagram: 'https://instagram.com/karim_test',
      facebook: 'https://facebook.com/karim.test',
      tiktok: 'https://tiktok.com/@karim_test',
      twitter: 'https://x.com/karim_test',
      youtube: 'https://youtube.com/@karim_test',
    },
    products: [],
    documents: [],
    videos: [],
    leadFields: [],
    digitalTagtopBranding: true,
    linkedCardCount: 1,
  };

  // Update profile via dataAdapter
  const updated = await dataAdapter.updateProfile(testProfile);
  assert.equal(updated.avatarUrl, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb');
  assert.equal(updated.logoUrl, 'https://atlas.ma/logo.png');
  assert.equal(updated.socials?.tiktok, 'https://tiktok.com/@karim_test');
  assert.equal(updated.socials?.linkedin, 'https://linkedin.com/in/karim-test');
  assert.equal(updated.socials?.instagram, 'https://instagram.com/karim_test');
  assert.equal(updated.socials?.facebook, 'https://facebook.com/karim.test');
  assert.equal(updated.socials?.twitter, 'https://x.com/karim_test');
  assert.equal(updated.socials?.youtube, 'https://youtube.com/@karim_test');
});

test('Public Profile View: Resolves public profile with avatarUrl, logoUrl, and socials intact', async () => {
  const resolved = await dataAdapter.getPublicProfile('karim_test_socials');
  assert.ok(resolved, 'Profile should resolve');
  assert.equal(resolved.avatarUrl, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb');
  assert.equal(resolved.logoUrl, 'https://atlas.ma/logo.png');
  assert.equal(resolved.socials?.tiktok, 'https://tiktok.com/@karim_test');
  // Confirm no private billing data or internal tokens exist on the public object
  assert.equal((resolved as any).serviceRoleKey, undefined);
  assert.equal((resolved as any).adminToken, undefined);
});
