/**
 * Privault Vault V2 - Type Definitions
 * 
 * Comprehensive TypeScript types for the rebuilt vault system.
 * Emphasizes type safety, immutability, and clear interfaces.
 */

// ==========================================
// ENUMS
// ==========================================

/**
 * Credential categories for organization
 */
export enum CredentialCategory {
  SOCIAL = 'social',
  WORK = 'work',
  SHOPPING = 'shopping',
  ENTERTAINMENT = 'entertainment',
  UTILITIES = 'utilities',
  DEVELOPMENT = 'development',
  PERSONAL = 'personal',
  OTHER = 'other',
}

/**
 * Password expiration status
 */
export enum ExpirationStatus {
  ACTIVE = 'active',           // More than 7 days until expiration
  EXPIRING_SOON = 'expiring_soon',  // 7 days or less until expiration
  EXPIRED = 'expired',         // Past expiration date
}

/**
 * Reason for password change
 */
export enum ChangeReason {
  MANUAL_UPDATE = 'manual_update',
  EXPIRATION_ROTATION = 'expiration_rotation',
  SECURITY_BREACH = 'security_breach',
  WEAK_PASSWORD = 'weak_password',
  SCHEDULED_ROTATION = 'scheduled_rotation',
  USER_REQUEST = 'user_request',
}

/**
 * Export file formats
 */
export enum ExportFormat {
  JSON = 'json',
  ENCRYPTED_JSON = 'encrypted_json',
  CSV = 'csv',
}

/**
 * Import file formats
 */
export enum ImportFormat {
  JSON = 'json',
  CSV = 'csv',
  ONE_PASSWORD = '1password',
  LASTPASS = 'lastpass',
  BITWARDEN = 'bitwarden',
  CHROME = 'chrome',
}

/**
 * Sort fields for credential listing
 */
export enum SortField {
  SITE = 'site',
  USERNAME = 'username',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  LAST_ACCESSED = 'last_accessed',
  EXPIRES_AT = 'expires_at',
  CATEGORY = 'category',
}

/**
 * Sort order
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Expiration event types
 */
export enum ExpirationEventType {
  WARNING_7D = 'expiration_warning_7d',
  WARNING_3D = 'expiration_warning_3d',
  WARNING_1D = 'expiration_warning_1d',
  EXPIRED = 'expired',
  ROTATED = 'rotated',
  EXPIRATION_SET = 'expiration_set',
  EXPIRATION_EXTENDED = 'expiration_extended',
}

// ==========================================
// CORE DATA MODELS
// ==========================================

/**
 * Encrypted credential data structure (stored in database)
 */
export interface VaultCredential {
  readonly id: string;
  readonly user_id: string;
  readonly credential_id: string;
  readonly encrypted_data: string;
  readonly iv: string;
  
  // Metadata (plaintext for querying)
  readonly category: CredentialCategory;
  readonly tags: readonly string[];
  readonly is_favorite: boolean;
  
  // Lifecycle tracking
  readonly expires_at: Date | null;
  readonly expiration_status: ExpirationStatus;
  readonly last_password_change: Date;
  
  // Access tracking
  readonly access_count: number;
  readonly last_accessed: Date | null;
  
  // Versioning
  readonly version: number;
  
  // Soft delete
  readonly is_deleted: boolean;
  readonly deleted_at: Date | null;
  
  // Timestamps
  readonly created_at: Date;
  readonly updated_at: Date;
}

/**
 * Decrypted credential data (client-side only, never stored)
 */
export interface DecryptedCredentialData {
  readonly site: string;
  readonly username: string;
  readonly password: string;
  readonly url?: string;
  readonly notes?: string;
  readonly custom_fields?: Readonly<Record<string, string>>;
}

/**
 * Complete decrypted credential (combines encrypted + decrypted data)
 */
export interface DecryptedCredential extends Omit<VaultCredential, 'encrypted_data'> {
  readonly decrypted_data: DecryptedCredentialData;
  readonly password_strength?: PasswordStrength;
}

/**
 * Password history entry
 */
export interface PasswordHistoryEntry {
  readonly id: string;
  readonly user_id: string;
  readonly credential_id: string;
  readonly encrypted_old_password: string;
  readonly password_hash: string;
  readonly change_reason: ChangeReason;
  readonly changed_by: string;
  readonly changed_at: Date;
}

/**
 * Expiration event
 */
export interface ExpirationEvent {
  readonly id: string;
  readonly user_id: string;
  readonly credential_id: string;
  readonly event_type: ExpirationEventType;
  readonly triggered_at: Date;
  readonly notification_sent: boolean;
  readonly notification_sent_at: Date | null;
  readonly acknowledged: boolean;
  readonly acknowledged_at: Date | null;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * Vault tag
 */
export interface VaultTag {
  readonly id: string;
  readonly user_id: string;
  readonly tag_name: string;
  readonly color: string | null;
  readonly usage_count: number;
  readonly created_at: Date;
}

// ==========================================
// PASSWORD STRENGTH
// ==========================================

/**
 * Password strength analysis (from zxcvbn)
 */
export interface PasswordStrength {
  readonly score: 0 | 1 | 2 | 3 | 4;
  readonly feedback: {
    readonly warning: string;
    readonly suggestions: readonly string[];
  };
  readonly crack_times_display: {
    readonly offline_slow_hashing_1e4_per_second: string;
    readonly offline_fast_hashing_1e10_per_second: string;
    readonly online_throttling_100_per_hour: string;
    readonly online_no_throttling_10_per_second: string;
  };
  readonly guesses: number;
  readonly guesses_log10: number;
}

// ==========================================
// EXPIRATION CONFIGURATION
// ==========================================

/**
 * Password expiration configuration
 */
export interface ExpirationConfig {
  readonly enabled: boolean;
  readonly days: number | null; // null means never expires
  readonly notify_days_before: readonly number[]; // e.g., [7, 3, 1]
  readonly auto_rotate?: boolean;
}

/**
 * Predefined expiration presets
 */
export const EXPIRATION_PRESETS = {
  NEVER: null,
  THIRTY_DAYS: 30,
  SIXTY_DAYS: 60,
  NINETY_DAYS: 90,
  SIX_MONTHS: 180,
  ONE_YEAR: 365,
} as const;

// ==========================================
// DATA TRANSFER OBJECTS (DTOs)
// ==========================================

/**
 * DTO for creating a new credential
 */
export interface CreateCredentialDTO {
  readonly site: string;
  readonly username: string;
  readonly password: string;
  readonly url?: string;
  readonly notes?: string;
  readonly custom_fields?: Readonly<Record<string, string>>;
  readonly category: CredentialCategory;
  readonly tags?: readonly string[];
  readonly is_favorite?: boolean;
  readonly expiration_config?: ExpirationConfig;
}

/**
 * DTO for updating an existing credential
 */
export interface UpdateCredentialDTO {
  readonly site?: string;
  readonly username?: string;
  readonly password?: string;
  readonly url?: string;
  readonly notes?: string;
  readonly custom_fields?: Readonly<Record<string, string>>;
  readonly category?: CredentialCategory;
  readonly tags?: readonly string[];
  readonly is_favorite?: boolean;
  readonly expiration_config?: ExpirationConfig;
  readonly version: number; // For optimistic locking
}

/**
 * DTO for changing master password
 */
export interface ChangeMasterPasswordDTO {
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly keepSalt?: boolean; // Optional flag to keep existing salt (default: false, generate new salt)
}

/**
 * Result of master password change operation
 */
export interface ChangeMasterPasswordResult {
  readonly credentialsUpdated: number;
  readonly verificationDataUpdated: boolean;
  readonly sessionUpdated: boolean;
  readonly newSalt: string;
}

/**
 * Progress tracking for master password change
 */
export interface MasterPasswordChangeProgress {
  readonly phase: 'verifying' | 'fetching' | 'decrypting' | 're-encrypting' | 'updating' | 'finalizing';
  readonly totalCredentials: number;
  readonly processedCredentials: number;
  readonly message: string;
}

/**
 * Filters for credential listing
 */
export interface CredentialFilters {
  readonly category?: CredentialCategory;
  readonly tags?: readonly string[];
  readonly is_favorite?: boolean;
  readonly expiration_status?: ExpirationStatus;
  readonly search_query?: string;
  readonly is_weak?: boolean; // Filter weak passwords
  readonly is_reused?: boolean; // Filter reused passwords
  readonly is_expired?: boolean; // Filter expired passwords
  readonly sort_by?: SortField;
  readonly sort_order?: SortOrder;
  readonly limit?: number;
  readonly offset?: number;
}

/**
 * Options for exporting credentials
 */
export interface ExportOptions {
  readonly format: ExportFormat;
  readonly include_deleted?: boolean;
  readonly credential_ids?: readonly string[];
  readonly encryption_password?: string; // For encrypted exports
}

/**
 * Result of import operation
 */
export interface ImportResult {
  readonly total: number;
  readonly imported: number;
  readonly failed: number;
  readonly skipped: number;
  readonly errors: readonly ImportError[];
  readonly imported_ids: readonly string[];
}

/**
 * Import error details
 */
export interface ImportError {
  readonly row: number;
  readonly field?: string;
  readonly message: string;
  readonly data?: unknown;
}

// ==========================================
// VAULT STATISTICS
// ==========================================

/**
 * Vault health and statistics
 */
export interface VaultStats {
  readonly total_credentials: number;
  readonly active_credentials: number;
  readonly favorites: number;
  readonly expired: number;
  readonly expiring_soon: number;
  readonly weak_passwords: number;
  readonly reused_passwords: number;
  readonly average_password_strength: number;
  readonly total_access_count: number;
  readonly by_category: Readonly<Record<CredentialCategory, number>>;
  readonly most_accessed?: {
    readonly credential_id: string;
    readonly access_count: number;
  };
  readonly health_score: number; // 0-100
}

/**
 * Password health analysis
 */
export interface PasswordHealth {
  readonly is_weak: boolean;
  readonly is_reused: boolean;
  readonly is_compromised: boolean;
  readonly strength_score: 0 | 1 | 2 | 3 | 4;
  readonly reuse_count: number;
  readonly age_days: number;
  readonly recommendations: readonly string[];
}

// ==========================================
// RESULT TYPE (for error handling)
// ==========================================

/**
 * Success result
 */
export interface Success<T> {
  readonly success: true;
  readonly data: T;
}

/**
 * Failure result
 */
export interface Failure {
  readonly success: false;
  readonly error: VaultError;
}

/**
 * Result type - discriminated union for type-safe error handling
 */
export type Result<T> = Success<T> | Failure;

/**
 * Vault error interface
 */
export interface VaultError {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
  readonly timestamp: Date;
}

// ==========================================
// ENCRYPTION TYPES
// ==========================================

/**
 * Encryption result
 */
export interface EncryptionResult {
  readonly encrypted: string; // Base64 encoded
  readonly iv: string; // Base64 encoded
}

/**
 * Decryption input
 */
export interface DecryptionInput {
  readonly encrypted: string;
  readonly iv: string;
}

/**
 * Key derivation parameters
 */
export interface KeyDerivationParams {
  readonly salt: Uint8Array;
  readonly iterations: number;
  readonly keyLength: number;
}

// ==========================================
// SERVICE INTERFACES
// ==========================================

/**
 * Vault service interface
 */
export interface IVaultService {
  createCredential(data: CreateCredentialDTO): Promise<Result<VaultCredential>>;
  getCredential(id: string): Promise<Result<DecryptedCredential>>;
  updateCredential(id: string, data: UpdateCredentialDTO): Promise<Result<VaultCredential>>;
  deleteCredential(id: string, hard?: boolean): Promise<Result<void>>;
  listCredentials(filters?: CredentialFilters): Promise<Result<readonly VaultCredential[]>>;
  searchCredentials(query: string): Promise<Result<readonly DecryptedCredential[]>>;
  getVaultStats(): Promise<Result<VaultStats>>;
  changeMasterPassword(
    currentPassword: string,
    newPassword: string,
    progressCallback?: (progress: MasterPasswordChangeProgress) => void,
    keepSalt?: boolean
  ): Promise<Result<ChangeMasterPasswordResult>>;
}

/**
 * Encryption service interface
 */
export interface IEncryptionService {
  encrypt(data: string, key: CryptoKey): Promise<EncryptionResult>;
  decrypt(input: DecryptionInput, key: CryptoKey): Promise<string>;
  deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey>;
  generateIV(): Uint8Array;
  generateSalt(): Uint8Array;
}

/**
 * Expiration service interface
 */
export interface IExpirationService {
  calculateExpirationStatus(credential: VaultCredential): ExpirationStatus;
  getExpiringCredentials(days: number): Promise<Result<readonly VaultCredential[]>>;
  setExpirationDate(credentialId: string, expiresAt: Date): Promise<Result<void>>;
  createExpirationEvent(credentialId: string, eventType: ExpirationEventType): Promise<Result<void>>;
  getUnacknowledgedEvents(): Promise<Result<readonly ExpirationEvent[]>>;
  acknowledgeEvent(eventId: string): Promise<Result<void>>;
}

/**
 * History service interface
 */
export interface IHistoryService {
  addToHistory(credentialId: string, oldPassword: string, reason: ChangeReason): Promise<Result<void>>;
  getHistory(credentialId: string, limit?: number): Promise<Result<readonly PasswordHistoryEntry[]>>;
  checkPasswordReuse(passwordHash: string, excludeCredentialId?: string): Promise<Result<boolean>>;
  clearHistory(credentialId: string): Promise<Result<void>>;
}

/**
 * Import/Export service interface
 */
export interface IImportExportService {
  importCredentials(file: File, format: ImportFormat): Promise<Result<ImportResult>>;
  exportCredentials(options: ExportOptions): Promise<Result<Blob>>;
  detectFormat(file: File): Promise<ImportFormat>;
  validateImportData(data: unknown, format: ImportFormat): Result<readonly CreateCredentialDTO[]>;
}

// ==========================================
// UTILITY TYPES
// ==========================================

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Required fields
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Optional fields
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Mutable version of type (removes readonly)
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// ==========================================
// CONSTANTS
// ==========================================

/**
 * Category display names
 */
export const CATEGORY_LABELS: Readonly<Record<CredentialCategory, string>> = {
  [CredentialCategory.SOCIAL]: 'Social Media',
  [CredentialCategory.WORK]: 'Work & Business',
  [CredentialCategory.SHOPPING]: 'Shopping & Finance',
  [CredentialCategory.ENTERTAINMENT]: 'Entertainment',
  [CredentialCategory.UTILITIES]: 'Utilities & Services',
  [CredentialCategory.DEVELOPMENT]: 'Development & Tech',
  [CredentialCategory.PERSONAL]: 'Personal',
  [CredentialCategory.OTHER]: 'Other',
};

/**
 * Expiration status labels
 */
export const EXPIRATION_STATUS_LABELS: Readonly<Record<ExpirationStatus, string>> = {
  [ExpirationStatus.ACTIVE]: 'Active',
  [ExpirationStatus.EXPIRING_SOON]: 'Expiring Soon',
  [ExpirationStatus.EXPIRED]: 'Expired',
};

/**
 * Password strength labels
 */
export const PASSWORD_STRENGTH_LABELS = {
  0: 'Very Weak',
  1: 'Weak',
  2: 'Fair',
  3: 'Strong',
  4: 'Very Strong',
} as const;

/**
 * Default pagination limit
 */
export const DEFAULT_PAGE_LIMIT = 50;

/**
 * Maximum password history entries per credential
 */
export const MAX_PASSWORD_HISTORY = 10;

/**
 * Encryption constants
 */
export const ENCRYPTION_CONSTANTS = {
  ALGORITHM: 'AES-GCM',
  KEY_LENGTH: 256,
  IV_LENGTH: 12,
  SALT_LENGTH: 16,
  PBKDF2_ITERATIONS: 100000,
} as const;

