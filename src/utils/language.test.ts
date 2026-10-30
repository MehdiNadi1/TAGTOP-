/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  isValidLanguage,
  removeLangFromQueryString,
  buildUrlWithoutLang,
  resolveInitialLanguage,
  syncDocumentDirection,
  STORAGE_KEY,
  DEFAULT_LANGUAGE,
} from './language';

// Mock in-memory storage implementing the Storage interface
class MockStorage implements Storage {
  private store: Record<string, string> = {};
  public shouldThrow = false;

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    if (this.shouldThrow) throw new Error('QuotaExceeded or SecurityError');
    this.store = {};
  }

  getItem(key: string): string | null {
    if (this.shouldThrow) throw new Error('SecurityError: Access Denied');
    return this.store[key] ?? null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    if (this.shouldThrow) throw new Error('SecurityError: Access Denied');
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    if (this.shouldThrow) throw new Error('SecurityError: Access Denied');
    this.store[key] = String(value);
  }
}

test('Language Validation: isValidLanguage accepts ar, en, fr and rejects invalid inputs', () => {
  assert.strictEqual(isValidLanguage('fr'), true);
  assert.strictEqual(isValidLanguage('ar'), true);
  assert.strictEqual(isValidLanguage('en'), true);
  assert.strictEqual(isValidLanguage('es'), false);
  assert.strictEqual(isValidLanguage(''), false);
  assert.strictEqual(isValidLanguage(null), false);
  assert.strictEqual(isValidLanguage(undefined), false);
  assert.strictEqual(isValidLanguage(123), false);
});

test('URL Query Cleanup: removeLangFromQueryString strips lang while preserving other parameters', () => {
  // Only lang present
  assert.strictEqual(removeLangFromQueryString('?lang=ar'), '');
  assert.strictEqual(removeLangFromQueryString('lang=ar'), '');

  // Lang with other parameters
  assert.strictEqual(
    removeLangFromQueryString('?utm_source=newsletter&lang=ar&theme=dark'),
    '?utm_source=newsletter&theme=dark'
  );
  assert.strictEqual(
    removeLangFromQueryString('?lang=en&ref=promo'),
    '?ref=promo'
  );

  // No lang present
  assert.strictEqual(
    removeLangFromQueryString('?utm_source=test'),
    '?utm_source=test'
  );
  assert.strictEqual(removeLangFromQueryString(''), '');
});

test('URL Reconstruction: buildUrlWithoutLang preserves pathname, remaining query params, and hash', () => {
  const result = buildUrlWithoutLang(
    '/app',
    '?utm_source=social&lang=ar',
    '#pricing'
  );
  assert.strictEqual(result, '/app?utm_source=social#pricing');

  const resultOnlyLang = buildUrlWithoutLang(
    '/',
    '?lang=en',
    '#cards'
  );
  assert.strictEqual(resultOnlyLang, '/#cards');

  const resultNoParams = buildUrlWithoutLang(
    '/index.html',
    '',
    '#how-it-works'
  );
  assert.strictEqual(resultNoParams, '/index.html#how-it-works');
});

test('Language Precedence: Explicit valid URL ?lang=ar overrides previously saved preference', () => {
  const storage = new MockStorage();
  storage.setItem(STORAGE_KEY, 'fr');

  let replacedUrl: string | null = null;
  const mockReplaceState = (_data: any, _unused: string, url?: string | URL | null) => {
    replacedUrl = String(url);
  };

  const resolved = resolveInitialLanguage({
    search: '?lang=ar',
    pathname: '/',
    hash: '#pricing',
    storage,
    historyReplaceState: mockReplaceState,
  });

  // URL override took effect
  assert.strictEqual(resolved, 'ar');
  // Storage was updated with the explicit choice
  assert.strictEqual(storage.getItem(STORAGE_KEY), 'ar');
  // URL was cleaned to prevent stale query param on subsequent visits
  assert.strictEqual(replacedUrl, '/#pricing');
});

test('Language Stale URL Prevention: Subsequent manual choice is preserved after URL parameter cleanup', () => {
  const storage = new MockStorage();
  let replacedUrl: string | null = null;
  const mockReplaceState = (_data: any, _unused: string, url?: string | URL | null) => {
    replacedUrl = String(url);
  };

  // Step 1: User enters via shared link with ?lang=ar#how-it-works
  const firstVisit = resolveInitialLanguage({
    search: '?lang=ar',
    pathname: '/',
    hash: '#how-it-works',
    storage,
    historyReplaceState: mockReplaceState,
  });
  assert.strictEqual(firstVisit, 'ar');
  assert.strictEqual(replacedUrl, '/#how-it-works');

  // Step 2: User manually toggles to 'en' (saving to storage)
  storage.setItem(STORAGE_KEY, 'en');

  // Step 3: User refreshes the page (now the URL is cleaned: search is empty, hash is preserved)
  const refreshVisit = resolveInitialLanguage({
    search: '',
    pathname: '/',
    hash: '#how-it-works',
    storage,
    historyReplaceState: mockReplaceState,
  });
  assert.strictEqual(refreshVisit, 'en');
});

test('Language Precedence: Invalid URL parameter falls back to saved storage preference', () => {
  const storage = new MockStorage();
  storage.setItem(STORAGE_KEY, 'ar');

  const resolved = resolveInitialLanguage({
    search: '?lang=unsupported_locale',
    pathname: '/',
    hash: '',
    storage,
  });

  assert.strictEqual(resolved, 'ar');
});

test('Language Fallback: Default French is returned when no URL param and no storage preference exist', () => {
  const storage = new MockStorage();

  const resolved = resolveInitialLanguage({
    search: '',
    pathname: '/',
    hash: '',
    storage,
  });

  assert.strictEqual(resolved, DEFAULT_LANGUAGE);
  assert.strictEqual(resolved, 'fr');
});

test('Language Resilience: Gracefully handles throwing/unavailable localStorage without crashing', () => {
  const failingStorage = new MockStorage();
  failingStorage.shouldThrow = true;

  // With explicit URL param: should return url param even if storage throws on write
  const fromUrl = resolveInitialLanguage({
    search: '?lang=en',
    pathname: '/',
    hash: '',
    storage: failingStorage,
  });
  assert.strictEqual(fromUrl, 'en');

  // Without URL param: should return default fallback without throwing
  const fallback = resolveInitialLanguage({
    search: '',
    pathname: '/',
    hash: '',
    storage: failingStorage,
  });
  assert.strictEqual(fallback, DEFAULT_LANGUAGE);
});

test('RTL Synchronization: syncDocumentDirection sets dir=rtl for ar and dir=ltr for fr/en', () => {
  const mockDoc = {
    documentElement: {
      lang: '',
      dir: '',
    },
  } as unknown as Document;

  syncDocumentDirection('ar', mockDoc);
  assert.strictEqual(mockDoc.documentElement.lang, 'ar');
  assert.strictEqual(mockDoc.documentElement.dir, 'rtl');

  syncDocumentDirection('fr', mockDoc);
  assert.strictEqual(mockDoc.documentElement.lang, 'fr');
  assert.strictEqual(mockDoc.documentElement.dir, 'ltr');

  syncDocumentDirection('en', mockDoc);
  assert.strictEqual(mockDoc.documentElement.lang, 'en');
  assert.strictEqual(mockDoc.documentElement.dir, 'ltr');
});

