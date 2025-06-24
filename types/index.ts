// User and Authentication Types
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type User = SupabaseUser;

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Credential and Vault Types
export interface Credential {
  id: string;
  site: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category?: string;
  isFavorite?: boolean;
  tags?: string[];
  passwordStrength?: number;
  lastPasswordChange?: string;
  accessCount?: number;
  created_at: string;
  updated_at: string;
}

export interface PasswordHistory {
  id: string;
  credential_id: string;
  old_password_hash: string; // Hash for comparison, not the actual password
  changed_at: string;
}

export interface Vault {
  id: string;
  user_id: string;
  encrypted_data: string; // AES-encrypted JSON of credentials
  salt: string; // For PBKDF2 key derivation
  created_at: string;
  updated_at: string;
}

// Alternative approach: Individual encrypted items
export interface VaultItem {
  id: string;
  user_id: string;
  encrypted_credential: string; // AES-encrypted credential
  credential_id: string; // Reference ID for the credential
  created_at: string;
  updated_at: string;
}

// Cryptographic Types
export interface CryptoKey {
  key: CryptoKey;
  iv: Uint8Array;
}

export interface EncryptionResult {
  encrypted: string; // Base64 encoded
  iv: string; // Base64 encoded
}

export interface KeyDerivationParams {
  salt: Uint8Array;
  iterations: number;
  keyLength: number;
}

// Password Strength Types
export interface PasswordStrength {
  score: number; // 0-4 from zxcvbn
  feedback: {
    warning: string;
    suggestions: string[];
  };
  crack_times_display: {
    offline_slow_hashing_1e4_per_second: string;
    offline_fast_hashing_1e10_per_second: string;
    online_throttling_100_per_hour: string;
    online_no_throttling_10_per_second: string;
  };
}

// UI and Form Types
export interface FormState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface CredentialFormData {
  site: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  folder?: string;
}

export interface MasterPassphraseFormData {
  passphrase: string;
  confirmPassphrase?: string;
}

// Security and Session Types
export interface SecuritySettings {
  autoLockTimeout: number; // milliseconds
  requireMasterPasswordConfirm: boolean;
  enableBiometric: boolean;
}

export interface SessionState {
  isUnlocked: boolean;
  lastActivity: number;
  masterKey: CryptoKey | null;
}

// Search and Filter Types
export interface SearchFilters {
  query: string;
  folder?: string;
  sortBy: 'site' | 'username' | 'created_at' | 'updated_at';
  sortOrder: 'asc' | 'desc';
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

export interface CryptoError extends AppError {
  operation: 'encrypt' | 'decrypt' | 'derive_key' | 'generate_salt';
}

// Constants and Enums
export enum VaultOperation {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  ENCRYPT = 'encrypt',
  DECRYPT = 'decrypt'
}

export enum SecurityEvent {
  LOGIN = 'login',
  LOGOUT = 'logout',
  UNLOCK = 'unlock',
  LOCK = 'lock',
  MASTER_PASSWORD_CHANGE = 'master_password_change',
  FAILED_UNLOCK_ATTEMPT = 'failed_unlock_attempt'
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// New: Password categories
export const PASSWORD_CATEGORIES = {
  SOCIAL: 'Social Media',
  WORK: 'Work & Business',
  SHOPPING: 'Shopping & Finance',
  ENTERTAINMENT: 'Entertainment',
  UTILITIES: 'Utilities & Services',
  DEVELOPMENT: 'Development & Tech',
  PERSONAL: 'Personal',
  OTHER: 'Other'
} as const;

export type PasswordCategory = keyof typeof PASSWORD_CATEGORIES;

// New: Vault statistics
export interface VaultStats {
  totalPasswords: number;
  weakPasswords: number;
  reusedPasswords: number;
  oldPasswords: number; // Older than 90 days
  averagePasswordStrength: number;
  categoryCounts: Record<string, number>;
  recentlyAdded: number; // Added in last 7 days
} 