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
     */
    async unlock(password: string, saltBase64: string): Promise<void> {
        try {
            this.cryptoKey = await deriveKeyFromPassword(password, saltBase64);
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
     */
    async verifyOrSetupMasterPassword(
        password: string,
        saltBase64: string,
        verificationDataStr: string | null
    ): Promise<{ isValid: boolean, newVerificationData?: string }> {

        // 1. Derive temporary key specifically to test
        const tempKey = await deriveKeyFromPassword(password, saltBase64);

        // 2. Setup Mode (first time unlocking vault ever)
        if (!verificationDataStr) {
            // Encrypt our known magic string and return it so the caller can save it to the DB
            const result = await encryptData(CRYPTO_CONFIG.verificationString, tempKey);

            // We encode iv and encrypted data together for easy DB storage
            const newVerificationData = JSON.stringify(result);

            return { isValid: true, newVerificationData };
        }

        // 3. Verification Mode
        try {
            const parsed = JSON.parse(verificationDataStr);
            if (!parsed.iv || !parsed.encryptedData) return { isValid: false };

            const decrypted = await decryptData(parsed.encryptedData, parsed.iv, tempKey);

            const isValid = decrypted === CRYPTO_CONFIG.verificationString;
            return { isValid };
        } catch (e) {
            // JSON parse error or decrypt error = wrong password
            return { isValid: false };
        }
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
