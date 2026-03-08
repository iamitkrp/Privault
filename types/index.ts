// ============================================
// PRIVAULT — Core Type Definitions
// ============================================

/**
 * Result type for error handling.
 * All service methods return this instead of throwing errors.
 * This prevents sensitive information from leaking through error stacks.
 */
export type Result<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E };

/**
 * Credential categories for organizing vault items.
 */
export const CREDENTIAL_CATEGORIES = [
    "social",
    "work",
    "finance",
    "shopping",
    "entertainment",
    "health",
    "education",
    "travel",
    "government",
    "secure_note",
    "other",
] as const;

export type CredentialCategory = (typeof CREDENTIAL_CATEGORIES)[number];

/**
 * Password expiration status.
 */
export type ExpirationStatus = "active" | "expiring_soon" | "expired";

/**
 * Password strength score from zxcvbn (0–4).
 */
export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

/**
 * Encrypted credential as stored in the database.
 * Sensitive data is inside `encrypted_data` — not accessible without the key.
 */
export interface EncryptedCredential {
    id: string;
    user_id: string;
    credential_id: string;
    encrypted_data: string;
    iv: string;
    category: CredentialCategory;
    tags: string[];
    is_favorite: boolean;
    expires_at: string | null;
    last_password_change: string | null;
    access_count: number;
    last_accessed: string | null;
    version: number;
    created_at: string;
    updated_at: string;
}

/**
 * Decrypted credential — exists only in client memory.
 * NEVER send this to the server or persist to storage.
 */
export interface DecryptedCredential {
    site_name: string;
    username: string;
    password: string;
    url?: string;
    notes?: string;
}

/**
 * Full credential combining decrypted data with metadata.
 * Used in components for rendering.
 */
export interface VaultCredential {
    id: string;
    credential_id: string;
    decrypted: DecryptedCredential;
    category: CredentialCategory;
    tags: string[];
    is_favorite: boolean;
    expires_at: string | null;
    expiration_status: ExpirationStatus;
    last_password_change: string | null;
    access_count: number;
    last_accessed: string | null;
    version: number;
    created_at: string;
    updated_at: string;
}

/**
 * User profile as stored in the database.
 */
export interface UserProfile {
    id: string;
    user_id: string;
    email: string;
    salt: string | null;
    vault_verification_data: string | null;
    /** Per-user PBKDF2 iteration count. null = legacy (100K), populated = upgraded. */
    kdf_iterations: number | null;
    security_settings: SecuritySettings;
    created_at: string;
    updated_at: string;
}

/**
 * User-configurable security settings.
 */
export interface SecuritySettings {
    auto_lock_timeout_minutes: number;
    require_otp_after_logout: boolean;
}

/**
 * Audit log entry.
 */
export interface AuditLogEntry {
    id: string;
    user_id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    metadata: Record<string, unknown>;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

/**
 * Security event entry.
 */
export interface SecurityEvent {
    id: string;
    user_id: string;
    event_type: string;
    severity: "info" | "warning" | "critical";
    details: Record<string, unknown>;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

/**
 * OTP verification record.
 */
export interface OTPVerification {
    id: string;
    user_id: string;
    otp_code: string;
    purpose: "vault_access" | "vault_password_change" | "email_update" | "profile_delete";
    expires_at: string;
    is_used: boolean;
    created_at: string;
}

/**
 * Password history entry.
 */
export interface PasswordHistoryEntry {
    id: string;
    user_id: string;
    credential_id: string;
    encrypted_old_password: string;
    iv: string;
    password_hash: string;
    change_reason: string | null;
    changed_at: string;
}
