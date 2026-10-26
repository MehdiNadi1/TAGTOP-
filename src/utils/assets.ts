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

export const TAGTOP_LOGO_URL = getAssetUrl('assets/aistudio/TAGTOP_Logo_Website_Header_72804e46.png');
