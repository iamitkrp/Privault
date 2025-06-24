import { CRYPTO_CONFIG } from '@/constants';

/**
 * Crypto Utilities for Zero-Knowledge Password Manager
 * All encryption/decryption happens client-side only
 */

// Base64 encoding utilities for safe storage
export const base64 = {
  encode: (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },

  decode: (base64String: string): ArrayBuffer => {
    const binary = atob(base64String);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  },
};

/**
 * Generate cryptographically secure random bytes
 */
export const generateRandomBytes = (length: number): ArrayBuffer => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array.buffer;
};

/**
 * Generate a random salt for PBKDF2 key derivation
 */
export const generateSalt = (): string => {
  const saltBuffer = generateRandomBytes(CRYPTO_CONFIG.SALT_LENGTH);
  return base64.encode(saltBuffer);
};

/**
 * Derive encryption key from master passphrase using PBKDF2
 */
export const deriveKey = async (
  passphrase: string,
  salt: string
): Promise<CryptoKey> => {
  // Convert passphrase to ArrayBuffer
  const encoder = new TextEncoder();
  const passphraseBuffer = encoder.encode(passphrase);

  // Import passphrase as raw key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passphraseBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Convert salt from base64
  const saltBuffer = base64.decode(salt);

  // Derive key using PBKDF2
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: CRYPTO_CONFIG.PBKDF2_ITERATIONS,
      hash: CRYPTO_CONFIG.HASH_ALGORITHM,
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: CRYPTO_CONFIG.KEY_LENGTH * 8, // Convert bytes to bits
    },
    false, // Not extractable for security
    ['encrypt', 'decrypt']
  );

  return derivedKey;
};

/**
 * Encrypt data using AES-256-GCM
 */
export const encrypt = async (
  data: string,
  key: CryptoKey
): Promise<{
  encryptedData: string;
  iv: string;
}> => {
  // Generate random IV for this encryption
  const iv = generateRandomBytes(CRYPTO_CONFIG.IV_LENGTH);

  // Convert data to ArrayBuffer
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    dataBuffer
  );

  return {
    encryptedData: base64.encode(encryptedBuffer),
    iv: base64.encode(iv),
  };
};

/**
 * Decrypt data using AES-256-GCM
 */
export const decrypt = async (
  encryptedData: string,
  iv: string,
  key: CryptoKey
): Promise<string> => {
  // Convert from base64
  const encryptedBuffer = base64.decode(encryptedData);
  const ivBuffer = base64.decode(iv);

  // Decrypt the data
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    key,
    encryptedBuffer
  );

  // Convert back to string
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
};

/**
 * Verify that a passphrase can derive the correct key
 * by trying to decrypt a known test value
 */
export const verifyPassphrase = async (
  passphrase: string,
  salt: string,
  testEncryptedData: string,
  testIv: string,
  expectedPlaintext: string
): Promise<boolean> => {
  try {
    const key = await deriveKey(passphrase, salt);
    const decryptedData = await decrypt(testEncryptedData, testIv, key);
    return decryptedData === expectedPlaintext;
  } catch {
    return false;
  }
};

/**
 * Create verification data for passphrase validation
 * This creates a small encrypted test value that can be used
 * to verify the correct passphrase without storing it
 */
export const createPassphraseVerification = async (
  passphrase: string,
  salt: string
): Promise<{
  testEncryptedData: string;
  testIv: string;
}> => {
  const key = await deriveKey(passphrase, salt);
  const testData = CRYPTO_CONFIG.PASSPHRASE_TEST_STRING;
  
  const { encryptedData, iv } = await encrypt(testData, key);
  
  return {
    testEncryptedData: encryptedData,
    testIv: iv,
  };
};

/**
 * Securely wipe sensitive data from memory
 * Note: This provides best-effort cleanup but JS doesn't guarantee memory wiping
 */
export const wipeSensitiveData = (data: unknown): void => {
  if (typeof data === 'string') {
    // Overwrite string characters (best effort)
    try {
      for (let i = 0; i < data.length; i++) {
        (data as string & { [key: number]: string })[i] = '\0';
      }
    } catch {
      // Strings are immutable in JS, so this might fail
      // At least we tried!
    }
  }
  
  if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
    // Zero out the buffer
    const view = new Uint8Array(data instanceof ArrayBuffer ? data : data.buffer);
    for (let i = 0; i < view.length; i++) {
      view[i] = 0;
    }
  }
};

/**
 * Calculate password strength score (0-4)
 */
export const calculatePasswordStrength = (password: string): { score: number; feedback: string[] } => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score++;
  else feedback.push('Use at least 8 characters');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Include uppercase letters');

  if (/\d/.test(password)) score++;
  else feedback.push('Include numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Include special characters');

  return { score, feedback };
};

/**
 * Generate a secure random password
 */
export const generateSecurePassword = (
  length: number = 16,
  includeSymbols: boolean = true
): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let charset = lowercase + uppercase + numbers;
  if (includeSymbols) {
    charset += symbols;
  }
  
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  
  return password;
};

/**
 * Hash data using SHA-256 (for non-sensitive operations like deduplication)
 */
export const hashData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return base64.encode(hashBuffer);
}; 