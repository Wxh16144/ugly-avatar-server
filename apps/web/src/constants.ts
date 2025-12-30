export const DEFAULT_CONFIG = {
  format: 'webp',
  baseUrl: window.UGLY_AVATAR_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  size: 128,
} as const
