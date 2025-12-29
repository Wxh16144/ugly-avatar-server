export const DEFAULT_CONFIG = {
  format: 'webp',
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  size: 128,
} as const
