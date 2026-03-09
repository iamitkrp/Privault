import { CRYPTO_CONFIG } from "@/constants";
import { bufferToBase64 } from "./core";

/**
 * Utility: Convert Base64 string to Uint8Array
 */
export function base64ToBuffer(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

/**
 * Utility: Convert Data text to Uint8Array
 */
export function textToBuffer(text: string): Uint8Array {
    return new TextEncoder().encode(text);
}

/**
 * Utility: Convert Uint8Array to Text
 */
export function bufferToText(buffer: Uint8Array): string {
    return new TextDecoder().decode(buffer);
}

/**
 * Derives a cryptographic key from a provided master password and a salt using PBKDF2.
 * 
 * @param password The user's plaintext master password.
 * @param saltBase64 The base64 stored salt for this user.
 * @param iterations Optional PBKDF2 iteration count. When omitted, uses CRYPTO_CONFIG.iterations (600K).
 *                   Pass the user's persisted kdf_iterations value to honour per-user versioning.
 * @returns CryptoKey for use with AES-GCM
 */
export async function deriveKeyFromPassword(
    password: string,
    saltBase64: string,
    iterations?: number
): Promise<CryptoKey> {
    const passwordBuffer = textToBuffer(password);
    const saltBuffer = base64ToBuffer(saltBase64);
    const iterCount = iterations ?? CRYPTO_CONFIG.iterations;

    // 1. Import the raw password material
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        passwordBuffer as unknown as BufferSource,
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    // 2. Derive the AES-GCM CryptoKey using PBKDF2
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: saltBuffer as unknown as BufferSource,
            iterations: iterCount,
            hash: CRYPTO_CONFIG.hashAlgorithm
        },
        keyMaterial,
        { name: CRYPTO_CONFIG.algorithm, length: CRYPTO_CONFIG.keyLength },
        // Not extractable for security. We don't want the raw key to leave the CryptoKey object.
        false,
        ["encrypt", "decrypt"]
    );
}

/**
 * Encrypts a plaintext string using the provided AES-256-GCM CryptoKey.
 * Generates a random 12-byte IV for this specific encryption operation.
 * 
 * @param plaintext The string to encrypt
 * @param key The derived AES-GCM CryptoKey
 * @returns Object with Base64 encoded encrypted data and Base64 encoded IV
 */
export async function encryptData(
    plaintext: string,
    key: CryptoKey
): Promise<{ encryptedData: string, iv: string }> {
    // 1. Generate new unique IV
    const ivBuffer = new Uint8Array(CRYPTO_CONFIG.ivLength);
    window.crypto.getRandomValues(ivBuffer);

    // 2. Encrypt
    const plaintextBuffer = textToBuffer(plaintext);
    const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
            name: CRYPTO_CONFIG.algorithm,
            iv: ivBuffer,
            tagLength: CRYPTO_CONFIG.tagLength
        },
        key,
        plaintextBuffer as unknown as BufferSource
    );

    // 3. Convert to base64
    return {
        encryptedData: bufferToBase64(new Uint8Array(encryptedBuffer)),
        iv: bufferToBase64(ivBuffer)
    };
}

/**
 * Decrypts a base64 encoded string using the provided AES-256-GCM CryptoKey and IV.
 * 
 * @param encryptedBase64 The Base64 encrypted data string
 * @param ivBase64 The Base64 IV used during encryption
 * @param key The derived AES-GCM CryptoKey
 * @returns The decrypted plaintext string
 */
export async function decryptData(
    encryptedBase64: string,
    ivBase64: string,
    key: CryptoKey
): Promise<string> {
    const encryptedBuffer = base64ToBuffer(encryptedBase64);
    const ivBuffer = base64ToBuffer(ivBase64);

    try {
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
                name: CRYPTO_CONFIG.algorithm,
                iv: ivBuffer as unknown as BufferSource,
                tagLength: CRYPTO_CONFIG.tagLength
            },
            key,
            encryptedBuffer as unknown as BufferSource
        );

        return bufferToText(new Uint8Array(decryptedBuffer));
    } catch (error) {
        // If decryption fails, it usually means the key or IV is wrong, or the data is tampered with (GCM authentication failed)
        // We intentionally swallow the console.error here so legitimate "wrong password" 
        // attempts don't pollute the DevTools console. The error is still thrown to be handled by the UI.
        throw new Error("Failed to decrypt data. Invalid key or corrupted data.");
    }
}

/**
 * Produces a salted HMAC-SHA256 hash of a password for reuse-detection in password history.
 * Uses the user's existing salt as the HMAC key, preventing rainbow-table attacks.
 *
 * This is NOT used for primary key derivation — only for safe equality comparisons
 * (e.g. checking password_hash in password_history without decrypting).
 *
 * @param password  The plaintext password to hash.
 * @param saltBase64  The user's Base64-encoded salt (same salt used for PBKDF2 key derivation).
 * @returns Base64-encoded HMAC-SHA256 digest.
 */
export async function hashPasswordForStorage(password: string, saltBase64: string): Promise<string> {
    const passwordBuffer = textToBuffer(password);
    const saltBuffer = base64ToBuffer(saltBase64);

    // Import the salt as an HMAC key
    const hmacKey = await window.crypto.subtle.importKey(
        "raw",
        saltBuffer as unknown as BufferSource,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    // Sign the password bytes with the HMAC key
    const hmacBuffer = await window.crypto.subtle.sign(
        "HMAC",
        hmacKey,
        passwordBuffer as unknown as BufferSource
    );

    return bufferToBase64(new Uint8Array(hmacBuffer));
}
