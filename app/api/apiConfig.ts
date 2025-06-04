// API Configuration
export const API_CONFIG = {
  // Core API URLs
  CORE_API_URL: import.meta.env.VITE_CORE_API_URL || 'http://localhost:8080',
  AUTH_API_URL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:9096',
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000',
  
  // OAuth Configuration
  CLIENT_ID: import.meta.env.VITE_CLIENT_ID || '',
  CLIENT_SECRET: import.meta.env.VITE_CLIENT_SECRET || '',
  
  // Base Path Configuration
  BASE_PATH: import.meta.env.VITE_BASE_PATH || '/shopper',
  
  // Google Maps Configuration (if needed in the future)
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  MAP_ID: import.meta.env.VITE_MAP_ID || '',
  DEFAULT_ADDRESS: import.meta.env.VITE_DEFAULT_ADDRESS || '',

  // Core Service Endpoints
  ENDPOINTS: {
    // Auth Endpoints
    AUTHORIZE: '/auth/authorize',
    TOKEN: '/auth/token',
    
    // User Profile Endpoints
    USER_PROFILE: '/core/v2/user',
    
    // Shoplist Endpoints
    SHOPLIST_BASE: '/core/v2/shoplist',
    SHOPLIST_BY_ID: (id: string | number) => `/core/v2/shoplist/${id}`,
    SHOPLIST_ITEMS: (id: string | number) => `/core/v2/shoplist/${id}/item`,
    SHOPLIST_ITEM: (id: string | number, itemId: string | number) => `/core/v2/shoplist/${id}/item/${itemId}`,
    SHOPLIST_LEAVE: (id: string | number) => `/core/v2/shoplist/${id}/leave`,
    SHOPLIST_SHARE_CODE: (id: string | number) => `/core/v2/shoplist/${id}/share-code`,
    SHOPLIST_REVOKE_SHARE_CODE: (id: string | number) => `/core/v2/shoplist/${id}/share-code/revoke`,
    SHOPLIST_JOIN: '/core/v2/shoplist/join',
    SHOPLIST_MEMBERS: (id: string | number) => `/core/v2/shoplist/${id}/members`,
    
    // Search Endpoints
    SEARCH_FLYERS: '/core/v2/search/flyers',
  },
} as const;

// Helper function to get the full URL for a given path
export function getCoreUrl(path: string): string {
  return `${API_CONFIG.CORE_API_URL}${path}`;
}

// Helper function to get the full auth URL for a given path
export function getAuthUrl(path: string): string {
  return `${API_CONFIG.AUTH_API_URL}${path}`;
}

// Helper function to get the callback URL
export function getCallbackUrl(): string {
  return `${API_CONFIG.FRONTEND_URL}${API_CONFIG.BASE_PATH}/callback`;
}