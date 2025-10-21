/**
 * Privault Vault V2 - Error Hierarchy
 * 
 * Comprehensive error classes for vault operations.
 * All errors are serializable for logging and debugging.
 */

// ==========================================
// ERROR CODES
// ==========================================

/**
 * Error codes for type-safe error handling
 */
export enum VaultErrorCode {
  // Vault errors
  VAULT_LOCKED = 'VAULT_LOCKED',
  VAULT_NOT_INITIALIZED = 'VAULT_NOT_INITIALIZED',
  VAULT_ALREADY_UNLOCKED = 'VAULT_ALREADY_UNLOCKED',
  
  // Credential errors
  CREDENTIAL_NOT_FOUND = 'CREDENTIAL_NOT_FOUND',
  CREDENTIAL_ALREADY_EXISTS = 'CREDENTIAL_ALREADY_EXISTS',
  CREDENTIAL_DELETED = 'CREDENTIAL_DELETED',
  
  // Encryption errors
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  KEY_DERIVATION_FAILED = 'KEY_DERIVATION_FAILED',
  INVALID_KEY = 'INVALID_KEY',
  INVALID_IV = 'INVALID_IV',
  
  // Validation errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Expiration errors
  EXPIRATION_CALCULATION_FAILED = 'EXPIRATION_CALCULATION_FAILED',
  INVALID_EXPIRATION_DATE = 'INVALID_EXPIRATION_DATE',
  
  // Import/Export errors
  IMPORT_FAILED = 'IMPORT_FAILED',
  EXPORT_FAILED = 'EXPORT_FAILED',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  PARSE_ERROR = 'PARSE_ERROR',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  QUERY_FAILED = 'QUERY_FAILED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  
  // Concurrency errors
  OPTIMISTIC_LOCK_FAILED = 'OPTIMISTIC_LOCK_FAILED',
  VERSION_MISMATCH = 'VERSION_MISMATCH',
  
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_PASSPHRASE = 'INVALID_PASSPHRASE',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Master password change errors
  MASTER_PASSWORD_CHANGE_FAILED = 'MASTER_PASSWORD_CHANGE_FAILED',
  ROLLBACK_FAILED = 'ROLLBACK_FAILED',
  VERIFICATION_DATA_UPDATE_FAILED = 'VERIFICATION_DATA_UPDATE_FAILED',
  
  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
}

// ==========================================
// BASE ERROR CLASS
// ==========================================

/**
 * Base error class for all vault errors
 */
export class VaultError extends Error {
  public readonly code: VaultErrorCode;
  public readonly timestamp: Date;
  public readonly details?: unknown;
  public readonly isOperational: boolean; // True for expected errors, false for bugs

  constructor(
    code: VaultErrorCode,
    message: string,
    details?: unknown,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'VaultError';
    this.code = code;
    this.timestamp = new Date();
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serializes error to JSON for logging
   */
  toJSON(): object {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      details: this.details,
      stack: this.stack,
      isOperational: this.isOperational,
    };
  }

  /**
   * Returns a user-friendly error message
   */
  getUserMessage(): string {
    return this.message;
  }
}

// ==========================================
// SPECIFIC ERROR CLASSES
// ==========================================

/**
 * Error thrown when vault is locked and operation requires unlocked vault
 */
export class VaultLockedError extends VaultError {
  constructor(message: string = 'Vault is locked. Please unlock to access credentials.', details?: unknown) {
    super(VaultErrorCode.VAULT_LOCKED, message, details);
    this.name = 'VaultLockedError';
  }

  getUserMessage(): string {
    return 'Your vault is locked. Please enter your master password to continue.';
  }
}

/**
 * Error thrown when vault is not initialized
 */
export class VaultNotInitializedError extends VaultError {
  constructor(message: string = 'Vault is not initialized.', details?: unknown) {
    super(VaultErrorCode.VAULT_NOT_INITIALIZED, message, details);
    this.name = 'VaultNotInitializedError';
  }

  getUserMessage(): string {
    return 'Your vault needs to be set up. Please create a master password first.';
  }
}

/**
 * Error thrown when credential is not found
 */
export class CredentialNotFoundError extends VaultError {
  constructor(credentialId: string, details?: unknown) {
    super(
      VaultErrorCode.CREDENTIAL_NOT_FOUND,
      `Credential with ID '${credentialId}' not found.`,
      { credentialId, ...details }
    );
    this.name = 'CredentialNotFoundError';
  }

  getUserMessage(): string {
    return 'The credential you are looking for does not exist or has been deleted.';
  }
}

/**
 * Error thrown when credential already exists
 */
export class CredentialAlreadyExistsError extends VaultError {
  constructor(message: string, details?: unknown) {
    super(VaultErrorCode.CREDENTIAL_ALREADY_EXISTS, message, details);
    this.name = 'CredentialAlreadyExistsError';
  }

  getUserMessage(): string {
    return 'A credential with similar information already exists.';
  }
}

/**
 * Error thrown when encryption fails
 */
export class EncryptionError extends VaultError {
  constructor(message: string = 'Encryption failed.', details?: unknown) {
    super(VaultErrorCode.ENCRYPTION_FAILED, message, details, false);
    this.name = 'EncryptionError';
  }

  getUserMessage(): string {
    return 'Failed to encrypt your data. Please try again.';
  }
}

/**
 * Error thrown when decryption fails
 */
export class DecryptionError extends VaultError {
  constructor(message: string = 'Decryption failed.', details?: unknown) {
    super(VaultErrorCode.DECRYPTION_FAILED, message, details, false);
    this.name = 'DecryptionError';
  }

  getUserMessage(): string {
    return 'Failed to decrypt your data. The master password might be incorrect.';
  }
}

/**
 * Error thrown when key derivation fails
 */
export class KeyDerivationError extends VaultError {
  constructor(message: string = 'Key derivation failed.', details?: unknown) {
    super(VaultErrorCode.KEY_DERIVATION_FAILED, message, details, false);
    this.name = 'KeyDerivationError';
  }

  getUserMessage(): string {
    return 'Failed to derive encryption key. Please try again.';
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends VaultError {
  public readonly field?: string;
  public readonly validationErrors?: readonly string[];

  constructor(message: string, field?: string, validationErrors?: readonly string[], details?: unknown) {
    super(VaultErrorCode.VALIDATION_FAILED, message, { field, validationErrors, ...details });
    this.name = 'ValidationError';
    this.field = field;
    this.validationErrors = validationErrors;
  }

  getUserMessage(): string {
    if (this.field) {
      return `Validation failed for ${this.field}: ${this.message}`;
    }
    return `Validation failed: ${this.message}`;
  }
}

/**
 * Error thrown when expiration calculation fails
 */
export class ExpirationError extends VaultError {
  constructor(message: string, details?: unknown) {
    super(VaultErrorCode.EXPIRATION_CALCULATION_FAILED, message, details);
    this.name = 'ExpirationError';
  }

  getUserMessage(): string {
    return 'Failed to calculate password expiration. Please try again.';
  }
}

/**
 * Error thrown when import fails
 */
export class ImportError extends VaultError {
  public readonly row?: number;
  public readonly importErrors?: readonly { row: number; message: string }[];

  constructor(message: string, importErrors?: readonly { row: number; message: string }[], details?: unknown) {
    super(VaultErrorCode.IMPORT_FAILED, message, { importErrors, ...details });
    this.name = 'ImportError';
    this.importErrors = importErrors;
  }

  getUserMessage(): string {
    if (this.importErrors && this.importErrors.length > 0) {
      return `Import failed with ${this.importErrors.length} error(s). Please check your file and try again.`;
    }
    return 'Failed to import credentials. Please check your file format and try again.';
  }
}

/**
 * Error thrown when export fails
 */
export class ExportError extends VaultError {
  constructor(message: string, details?: unknown) {
    super(VaultErrorCode.EXPORT_FAILED, message, details);
    this.name = 'ExportError';
  }

  getUserMessage(): string {
    return 'Failed to export credentials. Please try again.';
  }
}

/**
 * Error thrown when unsupported format is encountered
 */
export class UnsupportedFormatError extends VaultError {
  constructor(format: string, details?: unknown) {
    super(
      VaultErrorCode.UNSUPPORTED_FORMAT,
      `Unsupported format: ${format}`,
      { format, ...details }
    );
    this.name = 'UnsupportedFormatError';
  }

  getUserMessage(): string {
    return 'The file format is not supported. Please use a supported format.';
  }
}

/**
 * Error thrown when database operation fails
 */
export class DatabaseError extends VaultError {
  public readonly operation?: string;

  constructor(message: string, operation?: string, details?: unknown) {
    super(VaultErrorCode.DATABASE_ERROR, message, { operation, ...details }, false);
    this.name = 'DatabaseError';
    this.operation = operation;
  }

  getUserMessage(): string {
    return 'A database error occurred. Please try again later.';
  }
}

/**
 * Error thrown when optimistic locking fails
 */
export class ConcurrencyError extends VaultError {
  public readonly expectedVersion?: number;
  public readonly actualVersion?: number;

  constructor(message: string, expectedVersion?: number, actualVersion?: number, details?: unknown) {
    super(
      VaultErrorCode.OPTIMISTIC_LOCK_FAILED,
      message,
      { expectedVersion, actualVersion, ...details }
    );
    this.name = 'ConcurrencyError';
    this.expectedVersion = expectedVersion;
    this.actualVersion = actualVersion;
  }

  getUserMessage(): string {
    return 'This credential was modified by another session. Please refresh and try again.';
  }
}

/**
 * Error thrown when user is unauthorized
 */
export class UnauthorizedError extends VaultError {
  constructor(message: string = 'Unauthorized access.', details?: unknown) {
    super(VaultErrorCode.UNAUTHORIZED, message, details);
    this.name = 'UnauthorizedError';
  }

  getUserMessage(): string {
    return 'You are not authorized to perform this action.';
  }
}

/**
 * Error thrown when passphrase is invalid
 */
export class InvalidPassphraseError extends VaultError {
  public readonly attemptsRemaining?: number;

  constructor(message: string = 'Invalid passphrase.', attemptsRemaining?: number, details?: unknown) {
    super(VaultErrorCode.INVALID_PASSPHRASE, message, { attemptsRemaining, ...details });
    this.name = 'InvalidPassphraseError';
    this.attemptsRemaining = attemptsRemaining;
  }

  getUserMessage(): string {
    if (this.attemptsRemaining !== undefined) {
      return `Invalid master password. ${this.attemptsRemaining} attempt(s) remaining.`;
    }
    return 'Invalid master password. Please try again.';
  }
}

/**
 * Error thrown when master password change fails
 */
export class MasterPasswordChangeError extends VaultError {
  public readonly phase?: string;

  constructor(message: string, phase?: string, details?: unknown) {
    super(VaultErrorCode.MASTER_PASSWORD_CHANGE_FAILED, message, { phase, ...details });
    this.name = 'MasterPasswordChangeError';
    this.phase = phase;
  }

  getUserMessage(): string {
    if (this.phase) {
      switch (this.phase) {
        case 'verifying':
          return 'Failed to verify current master password. Please check and try again.';
        case 'fetching':
          return 'Failed to retrieve your credentials. Please try again.';
        case 'decrypting':
          return 'Failed to decrypt credentials with current password. Please try again.';
        case 're-encrypting':
          return 'Failed to encrypt credentials with new password. Please try again.';
        case 'updating':
          return 'Failed to update credentials in database. Please try again.';
        case 'finalizing':
          return 'Failed to finalize password change. Please try again.';
        default:
          return `Master password change failed during ${this.phase}. Please try again.`;
      }
    }
    return 'Failed to change master password. Please try again.';
  }
}

/**
 * Error thrown when rollback fails after partial master password change
 */
export class RollbackError extends VaultError {
  public readonly originalError?: unknown;
  public readonly partiallyUpdatedCredentials?: readonly string[];

  constructor(message: string, originalError?: unknown, partiallyUpdatedCredentials?: readonly string[], details?: unknown) {
    super(
      VaultErrorCode.ROLLBACK_FAILED,
      message,
      { originalError, partiallyUpdatedCredentials, ...details },
      false
    );
    this.name = 'RollbackError';
    this.originalError = originalError;
    this.partiallyUpdatedCredentials = partiallyUpdatedCredentials;
  }

  getUserMessage(): string {
    const count = this.partiallyUpdatedCredentials?.length || 0;
    if (count > 0) {
      return `Master password change failed and rollback was unsuccessful. ${count} credential(s) may be in an inconsistent state. Please contact support.`;
    }
    return 'Master password change failed and rollback encountered an error. Your vault may need recovery. Please contact support.';
  }
}

// ==========================================
// ERROR FACTORY FUNCTIONS
// ==========================================

/**
 * Creates a VaultError from an unknown error
 */
export function createVaultError(error: unknown): VaultError {
  if (error instanceof VaultError) {
    return error;
  }

  if (error instanceof Error) {
    return new VaultError(
      VaultErrorCode.UNKNOWN_ERROR,
      error.message,
      { originalError: error.stack },
      false
    );
  }

  return new VaultError(
    VaultErrorCode.UNKNOWN_ERROR,
    String(error),
    { originalError: error },
    false
  );
}

/**
 * Wraps an error with additional context
 */
export function wrapError(error: unknown, context: string): VaultError {
  const vaultError = createVaultError(error);
  // Create a new VaultError with merged details to avoid mutating readonly property
  return new VaultError(
    vaultError.code,
    vaultError.message,
    {
      ...vaultError.details,
      context,
    },
    vaultError.isOperational
  );
}

/**
 * Type guard to check if error is a VaultError
 */
export function isVaultError(error: unknown): error is VaultError {
  return error instanceof VaultError;
}

/**
 * Type guard to check if error is operational (expected)
 */
export function isOperationalError(error: unknown): boolean {
  return isVaultError(error) && error.isOperational;
}

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(error: unknown): string {
  if (isVaultError(error)) {
    return error.getUserMessage();
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Log error with appropriate level
 */
export function logError(error: unknown, context?: string): void {
  const vaultError = createVaultError(error);
  
  const logData = {
    ...vaultError.toJSON(),
    context,
  };

  if (vaultError.isOperational) {
    console.warn('[Vault Warning]', logData);
  } else {
    console.error('[Vault Error]', logData);
  }
}

// ==========================================
// ERROR RESULT HELPERS
// ==========================================

/**
 * Creates a success result
 */
export function success<T>(data: T): { success: true; data: T } {
  return { success: true, data };
}

/**
 * Creates a failure result
 */
export function failure(error: VaultError): { 
  success: false; 
  error: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: Date;
  };
} {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: error.timestamp,
    },
  };
}

/**
 * Wraps a function to catch errors and return Result type
 */
export function tryCatch<T>(
  fn: () => T | Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: ReturnType<typeof failure>['error'] }> {
  return Promise.resolve(fn())
    .then(data => success(data))
    .catch(error => failure(createVaultError(error)));
}

