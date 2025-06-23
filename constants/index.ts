// App Constants
export const APP_NAME = 'Privault';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Zero-knowledge password manager';

// Cryptographic Constants
export const CRYPTO_CONFIG = {
  ALGORITHM: 'AES-GCM',
  KEY_LENGTH: 32, // bytes (256 bits)
  IV_LENGTH: 12, // bytes for AES-GCM
  TAG_LENGTH: 16, // bytes for AES-GCM
  SALT_LENGTH: 32, // bytes
  PBKDF2_ITERATIONS: 100000, // OWASP recommended minimum
  HASH_ALGORITHM: 'SHA-256' as const,
  PASSPHRASE_TEST_STRING: 'privault-test-string',
  SESSION_TIMEOUT: 15 * 60 * 1000, // 15 minutes in milliseconds
  HIDDEN_TAB_TIMEOUT: 5 * 60 * 1000, // 5 minutes when tab is hidden
} as const;

// Security Constants
export const SECURITY_CONFIG = {
  AUTO_LOCK_TIMEOUT: 15 * 60 * 1000, // 15 minutes in milliseconds
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  MASTER_PASSWORD_MIN_LENGTH: 8,
  MASTER_PASSWORD_STRENGTH_REQUIREMENT: 2, // Minimum zxcvbn score
} as const;

// Password Generation Constants
export const PASSWORD_GENERATION = {
  DEFAULT_LENGTH: 16,
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  INCLUDE_UPPERCASE: true,
  INCLUDE_LOWERCASE: true,
  INCLUDE_NUMBERS: true,
  INCLUDE_SYMBOLS: true,
  EXCLUDE_AMBIGUOUS: true,
} as const;

// UI Constants
export const UI_CONFIG = {
  SEARCH_DEBOUNCE_MS: 300,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 200,
  COPY_FEEDBACK_DURATION: 2000,
} as const;

// Character Sets for Password Generation
export const CHARACTER_SETS = {
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
  NUMBERS: '0123456789',
  SYMBOLS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  AMBIGUOUS: '0O1lI', // Characters that might be confused
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication Errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_NOT_VERIFIED: 'Please verify your email address',
  PASSWORD_TOO_WEAK: 'Password is too weak',
  
  // Crypto Errors
  ENCRYPTION_FAILED: 'Failed to encrypt data',
  DECRYPTION_FAILED: 'Failed to decrypt data',
  INVALID_MASTER_PASSWORD: 'Invalid master password',
  KEY_DERIVATION_FAILED: 'Failed to derive encryption key',
  
  // Vault Errors
  VAULT_LOCKED: 'Vault is locked',
  VAULT_NOT_FOUND: 'Vault not found',
  CREDENTIAL_NOT_FOUND: 'Credential not found',
  VAULT_SYNC_FAILED: 'Failed to sync vault',
  
  // Network Errors
  NETWORK_ERROR: 'Network connection error',
  SERVER_ERROR: 'Server error occurred',
  TIMEOUT_ERROR: 'Request timed out',
  
  // Validation Errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_URL: 'Invalid URL format',
  PASSWORD_MISMATCH: 'Passwords do not match',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in',
  LOGOUT_SUCCESS: 'Successfully logged out',
  SIGNUP_SUCCESS: 'Account created successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  CREDENTIAL_SAVED: 'Credential saved successfully',
  CREDENTIAL_DELETED: 'Credential deleted successfully',
  VAULT_UNLOCKED: 'Vault unlocked successfully',
  VAULT_LOCKED: 'Vault locked',
  COPIED_TO_CLIPBOARD: 'Copied to clipboard',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  VAULT: '/vault',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'privault-theme',
  LAST_ACTIVITY: 'privault-last-activity',
  SECURITY_SETTINGS: 'privault-security-settings',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    SIGNUP: '/auth/signup',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  VAULT: {
    GET: '/api/vault',
    CREATE: '/api/vault',
    UPDATE: '/api/vault',
    DELETE: '/api/vault',
  },
  CREDENTIALS: {
    LIST: '/api/credentials',
    CREATE: '/api/credentials',
    UPDATE: '/api/credentials',
    DELETE: '/api/credentials',
  },
} as const;

// Supabase Table Names
export const SUPABASE_TABLES = {
  PROFILES: 'profiles',
  VAULTS: 'vaults',
  VAULT_ITEMS: 'vault_items',
  PASSWORD_HISTORY: 'password_history',
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  DEFAULT_THEME: 'system' as const,
  THEMES: ['light', 'dark', 'system'] as const,
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
} as const;

// Feature Flags
export const FEATURES = {
  BIOMETRIC_AUTH: true,
  PWA_SUPPORT: true,
  EXPORT_IMPORT: true,
  PASSWORD_HISTORY: true,
  MULTIPLE_VAULTS: false, // Future feature
  VAULT_SHARING: false, // Future feature
} as const; 