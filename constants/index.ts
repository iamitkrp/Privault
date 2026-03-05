// ============================================
// PRIVAULT — Application Constants
// ============================================

/**
 * Cryptographic configuration.
 * These values are NON-NEGOTIABLE and must not be changed
 * without re-encrypting all existing data.
 */
export const CRYPTO_CONFIG = {
    /** AES-256-GCM — authenticated encryption */
    algorithm: "AES-GCM" as const,

    /** 256-bit key length */
    keyLength: 256,

    /** 96-bit IV (12 bytes) — NIST recommended for AES-GCM */
    ivLength: 12,

    /** 128-bit authentication tag */
    tagLength: 128,

    /** PBKDF2 iteration count — makes brute force 100K× slower */
    iterations: 100_000,

    /** SHA-256 for PBKDF2 key derivation */
    hashAlgorithm: "SHA-256" as const,

    /** 32-byte (256-bit) salt */
    saltLength: 32,

    /** Known test string for vault password verification */
    verificationString: "PRIVAULT_VAULT_VERIFICATION_v1",
} as const;

/**
 * Session configuration.
 */
export const SESSION_CONFIG = {
    /** Auto-lock vault after 15 minutes of inactivity */
    timeoutMs: 15 * 60 * 1000,

    /** Show "session expiring" warning 2 minutes before timeout */
    warningBeforeTimeoutMs: 2 * 60 * 1000,

    /** Events that extend the session */
    activityEvents: ["mousedown", "keydown", "scroll", "touchstart"] as const,

    /** Auto-clear clipboard after 30 seconds */
    clipboardClearMs: 30 * 1000,
} as const;

/**
 * Validation rules.
 */
export const VALIDATION = {
    /** Password requirements */
    password: {
        minLength: 8,
        maxLength: 128,
        /** Minimum zxcvbn score required (0–4) */
        minStrength: 2,
    },

    /** Email requirements */
    email: {
        maxLength: 254,
    },

    /** Credential field limits */
    credential: {
        siteNameMaxLength: 100,
        usernameMaxLength: 200,
        passwordMaxLength: 500,
        urlMaxLength: 2000,
        notesMaxLength: 5000,
        maxTags: 10,
        tagMaxLength: 30,
    },

    /** OTP */
    otp: {
        length: 6,
        expiryMs: 10 * 60 * 1000,
        resendCooldownMs: 60 * 1000,
    },

    /** Import/Export */
    import: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxCredentials: 5000,
    },

    /** Password history */
    passwordHistory: {
        maxEntriesPerCredential: 10,
    },
} as const;

/**
 * User-facing error messages.
 * SECURITY: These messages are intentionally vague to avoid
 * leaking implementation details to potential attackers.
 */
export const ERROR_MESSAGES = {
    // Authentication
    auth: {
        invalidCredentials: "Invalid email or password. Please try again.",
        emailNotVerified: "Please verify your email address before signing in.",
        accountLocked: "Your account has been temporarily locked. Please try again later.",
        signupFailed: "Unable to create account. Please try again.",
        resetFailed: "Unable to send password reset email. Please try again.",
        sessionExpired: "Your session has expired. Please sign in again.",
    },

    // Vault
    vault: {
        unlockFailed: "Unable to unlock vault. Please check your password.",
        saveFailed: "Unable to save credential. Please try again.",
        deleteFailed: "Unable to delete credential. Please try again.",
        loadFailed: "Unable to load credentials. Please try again.",
        encryptionFailed: "An encryption error occurred. Please try again.",
        decryptionFailed: "Unable to decrypt data. Please verify your password.",
    },

    // OTP
    otp: {
        invalidCode: "Invalid verification code. Please try again.",
        expiredCode: "This verification code has expired. Please request a new one.",
        sendFailed: "Unable to send verification code. Please try again.",
    },

    // Import/Export
    importExport: {
        invalidFormat: "Unsupported file format. Please use CSV or JSON.",
        fileTooLarge: "File is too large. Maximum size is 10MB.",
        importFailed: "Unable to import credentials. Please check the file format.",
        exportFailed: "Unable to export credentials. Please try again.",
    },

    // Generic
    generic: {
        unexpected: "An unexpected error occurred. Please try again.",
        networkError: "Unable to connect. Please check your internet connection.",
        permissionDenied: "You don't have permission to perform this action.",
    },
} as const;

/**
 * Credential categories with display labels and icons.
 */
export const CATEGORIES = [
    { value: "social", label: "Social", icon: "Users" },
    { value: "work", label: "Work", icon: "Briefcase" },
    { value: "finance", label: "Finance", icon: "CreditCard" },
    { value: "shopping", label: "Shopping", icon: "ShoppingCart" },
    { value: "entertainment", label: "Entertainment", icon: "Film" },
    { value: "health", label: "Health", icon: "Heart" },
    { value: "education", label: "Education", icon: "GraduationCap" },
    { value: "travel", label: "Travel", icon: "Plane" },
    { value: "government", label: "Government", icon: "Landmark" },
    { value: "other", label: "Other", icon: "MoreHorizontal" },
] as const;

/**
 * Password strength labels.
 */
export const STRENGTH_LABELS = [
    { score: 0, label: "Very Weak", color: "var(--color-error)" },
    { score: 1, label: "Weak", color: "#f97316" },
    { score: 2, label: "Fair", color: "var(--color-warning)" },
    { score: 3, label: "Strong", color: "var(--color-success)" },
    { score: 4, label: "Very Strong", color: "#16a34a" },
] as const;

/**
 * Audit log action types.
 */
export const AUDIT_ACTIONS = {
    CREDENTIAL_CREATED: "credential_created",
    CREDENTIAL_READ: "credential_read",
    CREDENTIAL_UPDATED: "credential_updated",
    CREDENTIAL_DELETED: "credential_deleted",
    VAULT_UNLOCKED: "vault_unlocked",
    VAULT_LOCKED: "vault_locked",
    MASTER_PASSWORD_CHANGED: "master_password_changed",
    CREDENTIALS_EXPORTED: "credentials_exported",
    CREDENTIALS_IMPORTED: "credentials_imported",
} as const;
