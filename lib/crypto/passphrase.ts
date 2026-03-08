import { CRYPTO_CONFIG, SESSION_CONFIG } from "@/constants";
import { deriveKeyFromPassword, encryptData, decryptData } from "./engine";

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
     * Verifies the master password against the stored test verification string.
     * If `vault_verification_data` is null (first login), it creates it.
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
            const tempKey = await deriveKeyFromPassword(password, saltBase64, CRYPTO_CONFIG.iterations);
            const result = await encryptData(CRYPTO_CONFIG.verificationString, tempKey);
            const newVerificationData = JSON.stringify(result);
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
            if (decrypted !== CRYPTO_CONFIG.verificationString) return { isValid: false };

            // Verification succeeded at effectiveIterations
            const needsUpgrade = effectiveIterations < CRYPTO_CONFIG.iterations;

            if (needsUpgrade) {
                // Re-encrypt verification data at the new iteration count
                const upgradedKey = await deriveKeyFromPassword(password, saltBase64, CRYPTO_CONFIG.iterations);
                const upgradedResult = await encryptData(CRYPTO_CONFIG.verificationString, upgradedKey);
                const upgradedVerificationData = JSON.stringify(upgradedResult);
                return {
                    isValid: true,
                    newVerificationData: upgradedVerificationData,
                    needsKdfUpgrade: true,
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
                if (decrypted !== CRYPTO_CONFIG.verificationString) return { isValid: false };

                // Legacy verification succeeded — re-encrypt at current iterations
                const upgradedKey = await deriveKeyFromPassword(password, saltBase64, CRYPTO_CONFIG.iterations);
                const upgradedResult = await encryptData(CRYPTO_CONFIG.verificationString, upgradedKey);
                const upgradedVerificationData = JSON.stringify(upgradedResult);

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
