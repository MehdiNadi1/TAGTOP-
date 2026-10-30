/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../types';

export const SUPPORTED_LANGUAGES: readonly Language[] = ['fr', 'ar', 'en'] as const;
export const DEFAULT_LANGUAGE: Language = 'fr';
export const STORAGE_KEY = 'tagtop_lang';

export function isValidLanguage(val: unknown): val is Language {
  return typeof val === 'string' && (val === 'fr' || val === 'ar' || val === 'en');
}

export function getSafeStorageItem(key: string, storage?: Storage | null): string | null {
  try {
    const s = storage !== undefined ? storage : (typeof window !== 'undefined' ? window.localStorage : null);
    if (!s) return null;
    return s.getItem(key);
  } catch {
    return null;
  }
}

export function setSafeStorageItem(key: string, value: string, storage?: Storage | null): boolean {
  try {
    const s = storage !== undefined ? storage : (typeof window !== 'undefined' ? window.localStorage : null);
    if (!s) return false;
    s.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Removes the 'lang' query parameter from a query string while strictly
 * preserving all other query parameters.
 */
export function removeLangFromQueryString(search: string): string {
  try {
    if (!search || search === '?') return '';
    const cleanSearch = search.startsWith('?') ? search.slice(1) : search;
    const params = new URLSearchParams(cleanSearch);
    params.delete('lang');
    const remaining = params.toString();
    return remaining ? `?${remaining}` : '';
  } catch {
    return '';
  }
}

/**
 * Reconstructs a clean URL string without the 'lang' parameter, preserving
 * the pathname, any other query parameters, and the URL hash.
 */
export function buildUrlWithoutLang(
  pathname: string,
  search: string,
  hash: string = ''
): string {
  const newSearch = removeLangFromQueryString(search);
  return `${pathname}${newSearch}${hash || ''}`;
}

/**
 * Resolves the initial application language based on strict precedence:
 * 1. Valid explicit URL parameter (?lang=ar|en|fr) -> overrides saved preference.
 * 2. Saved preference from localStorage (if available and valid).
 * 3. Default language ('fr').
 *
 * When an explicit URL language is detected, it is immediately persisted to storage
 * and the URL is cleaned via window.history.replaceState to prevent stale URL params
 * from overriding subsequent manual choices.
 */
export function resolveInitialLanguage(options?: {
  search?: string;
  pathname?: string;
  hash?: string;
  storage?: Storage | null;
  historyReplaceState?: (data: any, unused: string, url?: string | URL | null) => void;
}): Language {
  const isBrowser = typeof window !== 'undefined';
  const search = options?.search !== undefined ? options.search : (isBrowser ? window.location.search : '');
  const pathname = options?.pathname !== undefined ? options.pathname : (isBrowser ? window.location.pathname : '');
  const hash = options?.hash !== undefined ? options.hash : (isBrowser ? window.location.hash : '');
  const storage = options?.storage !== undefined ? options.storage : (isBrowser ? window.localStorage : null);
  const replaceState = options?.historyReplaceState !== undefined
    ? options.historyReplaceState
    : (isBrowser && window.history?.replaceState ? window.history.replaceState.bind(window.history) : null);

  // 1. Explicit URL check
  if (search) {
    try {
      const cleanSearch = search.startsWith('?') ? search.slice(1) : search;
      const params = new URLSearchParams(cleanSearch);
      const urlLang = params.get('lang');
      if (isValidLanguage(urlLang)) {
        // Persist explicit choice immediately
        setSafeStorageItem(STORAGE_KEY, urlLang, storage);

        // Strip stale 'lang' from URL while strictly preserving other params and hash
        if (replaceState) {
          const newUrl = buildUrlWithoutLang(pathname, search, hash);
          try {
            replaceState(null, '', newUrl);
          } catch {}
        }

        return urlLang;
      }
    } catch {}
  }

  // 2. Saved preference check
  const saved = getSafeStorageItem(STORAGE_KEY, storage);
  if (isValidLanguage(saved)) {
    return saved;
  }

  // 3. Fallback default
  return DEFAULT_LANGUAGE;
}

/**
 * Synchronizes documentElement's lang and dir attributes.
 */
export function syncDocumentDirection(lang: Language, doc?: Document): void {
  try {
    const targetDoc = doc || (typeof document !== 'undefined' ? document : null);
    if (!targetDoc?.documentElement) return;
    targetDoc.documentElement.lang = lang;
    targetDoc.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  } catch {}
}
