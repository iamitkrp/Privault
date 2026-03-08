/**
 * Generates a strong, random cryptographic salt for PBKDF2.
 * Returns a Base64 encoded string representing 32 bytes of secure random data.
 */
export function generateSalt(): string {
    // Web Crypto API is required. In Node (SSR/tests), we could use node:crypto
    // For now, we assume this is called on the client.
    if (typeof window !== 'undefined' && window.crypto) {
        const buffer = new Uint8Array(32);
        window.crypto.getRandomValues(buffer);
        return bufferToBase64(buffer);
    }

    // Fallback for SSR/tests using Node crypto if necessary
    if (typeof process !== 'undefined' && process.release?.name === 'node') {
        // We try/catch dynamic require so Webpack/Turbopack doesn't break in browser builds
        try {
            const crypto = require('crypto');
            return crypto.randomBytes(32).toString('base64');
        } catch (e) {
            console.warn("Node crypto fallback failed.");
        }
    }

    throw new Error('No secure crypto available to generate salt.');
}

/**
 * Generates a cryptographically random 32-byte verification token.
 * Used as the plaintext for vault verification — unique per user, eliminating
 * the known-plaintext advantage that a static string would give an attacker.
 * Returns a Base64 encoded string.
 */
export function generateVerificationToken(): string {
    if (typeof window !== 'undefined' && window.crypto) {
        const buffer = new Uint8Array(32);
        window.crypto.getRandomValues(buffer);
        return bufferToBase64(buffer);
    }

    if (typeof process !== 'undefined' && process.release?.name === 'node') {
        try {
            const crypto = require('crypto');
            return crypto.randomBytes(32).toString('base64');
        } catch (e) {
            console.warn("Node crypto fallback failed.");
        }
    }

    throw new Error('No secure crypto available to generate verification token.');
}

/**
 * Utility: Convert Uint8Array to Base64
 */
export function bufferToBase64(buffer: Uint8Array): string {
    // Using modern approach that handles large buffers well
    const binString = Array.from(buffer, (byte) =>
        String.fromCharCode(byte)
    ).join("");

    return btoa(binString);
}

