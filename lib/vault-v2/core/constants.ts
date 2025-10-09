/**
 * Privault Vault V2 - Constants
 * 
 * Application-wide constants for the vault system.
 */

// ==========================================
// ENCRYPTION CONSTANTS
// ==========================================

export const ENCRYPTION = {
  ALGORITHM: 'AES-GCM' as const,
  KEY_LENGTH: 256,
  IV_LENGTH: 12,
  SALT_LENGTH: 16,
  PBKDF2_ITERATIONS: 100000,
  PBKDF2_HASH: 'SHA-256' as const,
} as const;

// ==========================================
// PAGINATION
// ==========================================

export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 1000,
  DEFAULT_OFFSET: 0,
} as const;

// ==========================================
// PASSWORD SETTINGS
// ==========================================

export const PASSWORD = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  MIN_STRENGTH_SCORE: 2, // Minimum acceptable strength (0-4 scale)
  HISTORY_LIMIT: 10, // Maximum password history entries per credential
} as const;

// ==========================================
// EXPIRATION SETTINGS
// ==========================================

export const EXPIRATION = {
  WARNING_DAYS: [7, 3, 1] as const, // Days before expiration to send warnings
  DEFAULT_EXPIRATION_DAYS: 90,
  PRESETS: {
    NEVER: null,
    THIRTY_DAYS: 30,
    SIXTY_DAYS: 60,
    NINETY_DAYS: 90,
    SIX_MONTHS: 180,
    ONE_YEAR: 365,
  } as const,
} as const;

// ==========================================
// SESSION SETTINGS
// ==========================================

export const SESSION = {
  AUTO_LOCK_TIMEOUT: 15 * 60 * 1000, // 15 minutes in milliseconds
  MAX_UNLOCK_ATTEMPTS: 5,
  LOCKOUT_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
} as const;

// ==========================================
// IMPORT/EXPORT SETTINGS
// ==========================================

export const IMPORT_EXPORT = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMPORT_ITEMS: 10000,
  SUPPORTED_IMPORT_FORMATS: ['json', 'csv', '1password', 'lastpass', 'bitwarden', 'chrome'] as const,
  SUPPORTED_EXPORT_FORMATS: ['json', 'encrypted_json', 'csv'] as const,
} as const;

// ==========================================
// VALIDATION RULES
// ==========================================

export const VALIDATION = {
  SITE_MAX_LENGTH: 255,
  USERNAME_MAX_LENGTH: 255,
  URL_MAX_LENGTH: 2048,
  NOTES_MAX_LENGTH: 10000,
  TAG_MAX_LENGTH: 50,
  TAG_MAX_COUNT: 20,
  CUSTOM_FIELD_KEY_MAX_LENGTH: 100,
  CUSTOM_FIELD_VALUE_MAX_LENGTH: 1000,
  CUSTOM_FIELD_MAX_COUNT: 20,
} as const;

// ==========================================
// UI SETTINGS
// ==========================================

export const UI = {
  PASSWORD_PREVIEW_LENGTH: 4, // Number of characters to show in password preview
  DEBOUNCE_DELAY: 300, // Milliseconds for search debounce
  TOAST_DURATION: 5000, // Milliseconds for toast notifications
  ANIMATION_DURATION: 200, // Milliseconds for UI animations
} as const;

// ==========================================
// SECURITY SETTINGS
// ==========================================

export const SECURITY = {
  HEALTH_SCORE_WEIGHTS: {
    WEAK_PASSWORD: 0.3,
    REUSED_PASSWORD: 0.3,
    EXPIRED_PASSWORD: 0.2,
    AVERAGE_STRENGTH: 0.2,
  },
  PASSWORD_AGE_WARNING_DAYS: 90,
  BREACH_CHECK_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// ==========================================
// ERROR MESSAGES
// ==========================================

export const ERROR_MESSAGES = {
  VAULT_LOCKED: 'Your vault is locked. Please unlock to continue.',
  VAULT_NOT_INITIALIZED: 'Vault not initialized. Please set up your master password.',
  CREDENTIAL_NOT_FOUND: 'Credential not found.',
  ENCRYPTION_FAILED: 'Failed to encrypt data.',
  DECRYPTION_FAILED: 'Failed to decrypt data. Invalid master password.',
  VALIDATION_FAILED: 'Validation failed. Please check your input.',
  IMPORT_FAILED: 'Failed to import credentials.',
  EXPORT_FAILED: 'Failed to export credentials.',
  DATABASE_ERROR: 'A database error occurred.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Unauthorized access.',
} as const;

// ==========================================
// SUCCESS MESSAGES
// ==========================================

export const SUCCESS_MESSAGES = {
  CREDENTIAL_CREATED: 'Credential created successfully.',
  CREDENTIAL_UPDATED: 'Credential updated successfully.',
  CREDENTIAL_DELETED: 'Credential deleted successfully.',
  CREDENTIALS_IMPORTED: 'Credentials imported successfully.',
  CREDENTIALS_EXPORTED: 'Credentials exported successfully.',
  PASSWORD_COPIED: 'Password copied to clipboard.',
  VAULT_UNLOCKED: 'Vault unlocked successfully.',
  VAULT_LOCKED: 'Vault locked successfully.',
} as const;

// ==========================================
// API ENDPOINTS (if using server routes)
// ==========================================

export const API_ENDPOINTS = {
  // Credentials
  CREDENTIALS: '/api/vault/credentials',
  CREDENTIAL_BY_ID: (id: string) => `/api/vault/credentials/${id}`,
  
  // Import/Export
  IMPORT: '/api/vault/import',
  EXPORT: '/api/vault/export',
  
  // Statistics
  STATS: '/api/vault/stats',
  
  // Expiration
  EXPIRING: '/api/vault/expiring',
  EXPIRATION_EVENTS: '/api/vault/expiration-events',
  
  // History
  HISTORY: (credentialId: string) => `/api/vault/history/${credentialId}`,
  
  // Tags
  TAGS: '/api/vault/tags',
} as const;

// ==========================================
// LOCAL STORAGE KEYS
// ==========================================

export const STORAGE_KEYS = {
  VAULT_SESSION: 'privault_session',
  VAULT_PREFERENCES: 'privault_preferences',
  LAST_UNLOCK: 'privault_last_unlock',
  AUTO_LOCK_ENABLED: 'privault_auto_lock',
} as const;

// ==========================================
// FEATURE FLAGS
// ==========================================

export const FEATURES = {
  ENABLE_BREACH_CHECK: true,
  ENABLE_AUTO_ROTATION: false,
  ENABLE_BIOMETRIC: false,
  ENABLE_SHARING: false,
  ENABLE_2FA: true,
} as const;

