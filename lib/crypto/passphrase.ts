import { CRYPTO_CONFIG, SESSION_CONFIG } from "@/constants";
import { deriveKeyFromPassword, encryptData, decryptData } from "./engine";
import { generateVerificationToken } from "./core";

/**
 * Singleton class to securely hold the master passphrase and derived CryptoKey in memory.
 * NEVER persists to localStorage, sessionStorage, or cookies.
 * Auto-locks after configured inactivity.
 */
class PassphraseManager {
    private cryptoKey: CryptoKey | null = null;
    private locked = true;
    private autoLockTimer: NodeJS.Timeout | null = null;
    private lockListeners: Set<(locked: boolean) => void> = new Set();

    // We keep the raw string only temporarily and try to clear it, but JS garbage collection
    // means we can't truly guarantee it's removed immediately. However, keeping the derived 
    // CryptoKey (which is unextractable by design) is the primary goal.

    /**
     * Unlocks the vault in memory. Derives the AES key and sets up auto-timeout.
     *
     * @param password  The user's master password.
     * @param saltBase64  The Base64-encoded salt from the user's profile.
     * @param iterations  Optional PBKDF2 iteration count (from profile.kdf_iterations).
     *                    When omitted, uses CRYPTO_CONFIG.iterations (600K).
     */
    async unlock(password: string, saltBase64: string, iterations?: number): Promise<void> {
        try {
            this.cryptoKey = await deriveKeyFromPassword(password, saltBase64, iterations);
            this.locked = false;
            this.resetAutoLockTimer();
            this.notifyListeners();
        } catch (e) {
            console.error("Passphrase manager unlock failed", e);
            throw new Error("Failed to derive encryption keys.");
        }
    }

    /**
     * Locks the vault immediately, destroying the key reference.
     */
    lock(): void {
        this.cryptoKey = null;
        this.locked = true;
        if (this.autoLockTimer) {
            clearTimeout(this.autoLockTimer);
            this.autoLockTimer = null;
        }
        this.notifyListeners();
    }

    /**
     * Checks if the vault is currently unlocked (key in memory).
     */
    isUnlocked(): boolean {
        return !this.locked && this.cryptoKey !== null;
    }

    /**
     * Gets the active encryption key. Throws if locked.
     * Resets the auto-lock timer upon access.
     */
    getKey(): CryptoKey {
        if (this.locked || !this.cryptoKey) {
            throw new Error("Vault is locked. No key available.");
        }
        this.resetAutoLockTimer();
        return this.cryptoKey;
    }

    /**
     * Subscribes to lock/unlock events.
     */
    subscribe(callback: (locked: boolean) => void): () => void {
        this.lockListeners.add(callback);
        // Return unsubscribe function
        return () => this.lockListeners.delete(callback);
    }

    private notifyListeners() {
        this.lockListeners.forEach(listener => listener(this.locked));
    }

    /**
     * Resets the inactivity timer.
     */
    resetAutoLockTimer() {
        // Only works in browser
        if (typeof window === 'undefined') return;

        if (this.autoLockTimer) {
            clearTimeout(this.autoLockTimer);
        }

        if (!this.locked) {
            this.autoLockTimer = setTimeout(() => {
                console.log("Vault auto-locked due to inactivity.");
                this.lock();
            }, SESSION_CONFIG.timeoutMs);
        }
    }

    /**
     * Helper: encrypts a random verification token and returns the JSON blob.
     * The blob shape is { encryptedData, iv, scheme: "random_token_v2" }.
     * The plaintext token is NEVER persisted — only its encrypted form.
     * AES-GCM's authenticated decryption ensures integrity: a wrong key
     * will fail the auth-tag check and throw, acting as the verification gate.
     */
    private async createVerificationBlob(key: CryptoKey): Promise<string> {
        const token = generateVerificationToken();
        const { encryptedData, iv } = await encryptData(token, key);
        return JSON.stringify({ encryptedData, iv, scheme: 'random_token_v2' });
    }

    /**
     * Validates that a decrypted verification token looks like a valid
     * Base64-encoded 32-byte random token (~44 characters).
     */
    private isValidTokenShape(decrypted: string): boolean {
        return typeof decrypted === 'string' && decrypted.length >= 40 && decrypted.length <= 48;
    }

    /**
     * Verifies the master password against the stored verification data.
     * If `vault_verification_data` is null (first login), it creates it.
     *
     * Verification data formats:
     *  - Current format (v2): { encryptedData, iv, scheme: "random_token_v2" } —
     *    AES-GCM decryption success = valid password (auth tag validates integrity).
     *    Decrypted token shape/length is validated as an extra guard.
     *  - Transitional format: { encryptedData, iv, token } — from a brief window where
     *    the plaintext token was stored. Auto-upgrades to v2 on success.
     *  - Legacy format: { encryptedData, iv } — decrypts and compares against
     *    CRYPTO_CONFIG.verificationString. Auto-upgrades to v2 on success.
     *
     * Supports per-user KDF iteration migration:
     *  - First tries with the user's stored `kdfIterations` (or the current default if null).
     *  - If decryption fails and the stored iterations differ from legacy, retries at legacy (100K).
     *  - When the legacy fallback succeeds, returns `needsKdfUpgrade: true` along with
     *    re-encrypted verification data and the resolved iteration count, so the caller can
     *    persist the upgrade.
     *
     * @param password            The master password to verify.
     * @param saltBase64          The user's Base64-encoded salt.
     * @param verificationDataStr The stored encrypted verification blob, or null for first-time setup.
     * @param kdfIterations       The user's persisted kdf_iterations value (null = legacy user).
     */
    async verifyOrSetupMasterPassword(
        password: string,
        saltBase64: string,
        verificationDataStr: string | null,
        kdfIterations: number | null
    ): Promise<{
        isValid: boolean;
        newVerificationData?: string;
        needsKdfUpgrade?: boolean;
        /** The iteration count that successfully verified the password */
        resolvedIterations?: number;
    }> {
        // Determine the effective iteration count for this user
        const effectiveIterations = kdfIterations ?? CRYPTO_CONFIG.legacyIterations;

        // ── Setup Mode (first time unlocking vault) ──
        if (!verificationDataStr) {
            // New users always start at the current (strongest) iteration count
            // and use a per-user random token instead of the static known-plaintext string
            const tempKey = await deriveKeyFromPassword(password, saltBase64, CRYPTO_CONFIG.iterations);
            const newVerificationData = await this.createVerificationBlob(tempKey);
            return {
                isValid: true,
                newVerificationData,
                needsKdfUpgrade: false,
                resolvedIterations: CRYPTO_CONFIG.iterations,
            };
        }

        // ── Verification Mode ──
        // 1. Try with the effective (stored or legacy) iteration count
        try {
            const tempKey = await deriveKeyFromPassword(password, saltBase64, effectiveIterations);
            const parsed = JSON.parse(verificationDataStr);
            if (!parsed.iv || !parsed.encryptedData) return { isValid: false };

            const decrypted = await decryptData(parsed.encryptedData, parsed.iv, tempKey);

            // Determine verification based on blob format
            if (parsed.scheme === 'random_token_v2') {
                // Current format: AES-GCM decryption succeeded (auth tag passed).
                // Validate decrypted token shape as extra guard.
                if (!this.isValidTokenShape(decrypted)) return { isValid: false };
            } else if (parsed.token) {
                // Transitional format: plaintext token was stored — compare and upgrade
                if (decrypted !== parsed.token) return { isValid: false };
            } else {
                // Legacy format: compare against static verification string
                if (decrypted !== CRYPTO_CONFIG.verificationString) return { isValid: false };
            }

            // Verification succeeded at effectiveIterations
            const needsKdfUpgrade = effectiveIterations < CRYPTO_CONFIG.iterations;
            const needsSchemeUpgrade = parsed.scheme !== 'random_token_v2';

            if (needsKdfUpgrade || needsSchemeUpgrade) {
                // Re-encrypt with a fresh random token at the current iteration count
                const upgradedKey = await deriveKeyFromPassword(password, saltBase64, CRYPTO_CONFIG.iterations);
                const upgradedVerificationData = await this.createVerificationBlob(upgradedKey);
                return {
                    isValid: true,
                    newVerificationData: upgradedVerificationData,
                    needsKdfUpgrade: needsKdfUpgrade || needsSchemeUpgrade,
                    resolvedIterations: effectiveIterations,
                };
            }

            return { isValid: true, resolvedIterations: effectiveIterations };
        } catch {
            // Decryption failed — could be wrong password or iteration mismatch
        }

        // 2. Fallback: if effectiveIterations != legacyIterations, try legacy
        //    (covers edge case where kdf_iterations was manually set to a non-legacy value
        //     but the verification data hasn't been re-encrypted yet)
        if (effectiveIterations !== CRYPTO_CONFIG.legacyIterations) {
            try {
                const legacyKey = await deriveKeyFromPassword(password, saltBase64, CRYPTO_CONFIG.legacyIterations);
                const parsed = JSON.parse(verificationDataStr);
                if (!parsed.iv || !parsed.encryptedData) return { isValid: false };

                const decrypted = await decryptData(parsed.encryptedData, parsed.iv, legacyKey);

                // Determine verification based on blob format
                if (parsed.scheme === 'random_token_v2') {
                    if (!this.isValidTokenShape(decrypted)) return { isValid: false };
                } else if (parsed.token) {
                    if (decrypted !== parsed.token) return { isValid: false };
                } else {
                    if (decrypted !== CRYPTO_CONFIG.verificationString) return { isValid: false };
                }

                // Legacy verification succeeded — re-encrypt with random token at current iterations
                const upgradedKey = await deriveKeyFromPassword(password, saltBase64, CRYPTO_CONFIG.iterations);
                const upgradedVerificationData = await this.createVerificationBlob(upgradedKey);

                return {
                    isValid: true,
                    newVerificationData: upgradedVerificationData,
                    needsKdfUpgrade: true,
                    resolvedIterations: CRYPTO_CONFIG.legacyIterations,
                };
            } catch {
                // Also failed — definitely wrong password
            }
        }

        return { isValid: false };
    }
}

// Export a singleton instance to be shared across the client app
export const passphraseManager = new PassphraseManager();

// Setup global event listeners to reset timer on user activity 
// (Mouse move, key down, etc. so they aren't locked out while actively working)
if (typeof window !== 'undefined') {
    const resetTimer = () => {
        if (passphraseManager.isUnlocked()) {
            passphraseManager.resetAutoLockTimer();
        }
    };

    SESSION_CONFIG.activityEvents.forEach(eventType => {
        window.addEventListener(eventType, resetTimer, { passive: true });
    });
}

