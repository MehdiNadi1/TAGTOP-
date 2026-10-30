/**
 * Utility to resolve static and public assets with the correct base URL.
 * Ensures assets load correctly on both local development (/) and GitHub Pages (/TAGTOP-/).
 */
export function getAssetUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${baseUrl}${cleanPath}`;
}

// Transparent logo for light backgrounds (header, footer, white cards)
export const TAGTOP_LOGO_URL = getAssetUrl('assets/aistudio/tagtop_logo_dark_transparent.png');

// Transparent white logo for dark backgrounds (black cards, dark showcase)
export const TAGTOP_LOGO_WHITE_URL = getAssetUrl('assets/aistudio/tagtop_logo_white_transparent.png');

// Fallback original logo
export const TAGTOP_LOGO_ORIGINAL_URL = getAssetUrl('assets/aistudio/TAGTOP_Logo_Website_Header_72804e46.png');
