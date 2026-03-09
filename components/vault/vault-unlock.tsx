"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { passphraseManager } from "@/lib/crypto/passphrase";
import { CRYPTO_CONFIG } from "@/constants";
import { Lock } from "lucide-react";
import { SecurityService } from "@/services/security.service";
import { VaultService } from "@/services/vault.service";

interface VaultUnlockProps {
    onUnlock: () => void;
}

/** Backoff only kicks in at this many failed attempts */
const BACKOFF_THRESHOLD = 5;

export function VaultUnlock({ onUnlock }: VaultUnlockProps) {
    const { profile, user, supabaseClient } = useAuth();
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const lockoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Timer-driven lockout countdown: ticks every second and auto-clears when expired
    useEffect(() => {
        // Clear any existing timer
        if (lockoutTimerRef.current) {
            clearInterval(lockoutTimerRef.current);
            lockoutTimerRef.current = null;
        }

        if (lockoutUntil === null) {
            setRemainingSeconds(0);
            return;
        }

        // Immediately compute remaining time
        const calcRemaining = () => Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
        setRemainingSeconds(calcRemaining());

        lockoutTimerRef.current = setInterval(() => {
            const remaining = calcRemaining();
            setRemainingSeconds(remaining);

            if (remaining <= 0) {
                // Lockout expired — clear state and re-enable controls
                setLockoutUntil(null);
                setError(null);
                if (lockoutTimerRef.current) {
                    clearInterval(lockoutTimerRef.current);
                    lockoutTimerRef.current = null;
                }
            }
        }, 1000);

        return () => {
            if (lockoutTimerRef.current) {
                clearInterval(lockoutTimerRef.current);
                lockoutTimerRef.current = null;
            }
        };
    }, [lockoutUntil]);

    // Clear password from state on unmount
    useEffect(() => {
        return () => { setPassword(""); };
    }, []);

    const isLockedOut = lockoutUntil !== null && remainingSeconds > 0;

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || !profile.salt || !user) {
            setError("Profile or crypto salt is missing. Please contact support.");
            return;
        }

        // Lockout guard: block attempts during backoff period
        if (isLockedOut) {
            setError(`Too many failed attempts. Please wait ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}.`);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log("[VaultUnlock] Starting verifyOrSetupMasterPassword...");
            // Verify the master password, passing the user's stored KDF iterations
            const { isValid, newVerificationData } =
                await passphraseManager.verifyOrSetupMasterPassword(
                    password,
                    profile.salt,
                    profile.vault_verification_data,
                    profile.kdf_iterations
                );
            console.log("[VaultUnlock] verifyOrSetupMasterPassword finished:", { isValid, hasNewData: !!newVerificationData });

            if (!isValid) {
                const newFailedAttempts = failedAttempts + 1;
                setFailedAttempts(newFailedAttempts);

                // Log failed attempt as suspicious activity (non-blocking)
                try {
                    const sec = new SecurityService(supabaseClient);
                    await sec.logEvent(
                        user.id,
                        'suspicious_activity',
                        newFailedAttempts >= BACKOFF_THRESHOLD ? 'critical' : 'warning',
                        { failed_attempts: newFailedAttempts }
                    );
                } catch { /* non-blocking */ }

                setIsLoading(false);

                // Only enforce backoff after reaching the threshold
                if (newFailedAttempts >= BACKOFF_THRESHOLD) {
                    // Exponential backoff starting from threshold: 1s, 2s, 4s, 8s, …
                    const backoffExponent = newFailedAttempts - BACKOFF_THRESHOLD;
                    const backoffMs = Math.pow(2, backoffExponent) * 1000;
                    setLockoutUntil(Date.now() + backoffMs);

                    const waitSeconds = Math.ceil(backoffMs / 1000);
                    setError(
                        `Too many failed attempts (${newFailedAttempts}). Please wait ${waitSeconds} second${waitSeconds !== 1 ? 's' : ''} before trying again.`
                    );
                } else {
                    // Below threshold: simple error, no delay
                    setError(
                        `Incorrect master password. ${BACKOFF_THRESHOLD - newFailedAttempts} attempt${BACKOFF_THRESHOLD - newFailedAttempts !== 1 ? 's' : ''} remaining before lockout.`
                    );
                }
                return;
            }

            console.log("[VaultUnlock] Creating Supabase client...");
            const supabase = supabaseClient;

            // Determine what to persist: first-time setup, KDF upgrade, or nothing
            console.log("[VaultUnlock] Checking how to persist...");
            if (!profile.vault_verification_data && newVerificationData) {
                console.log("[VaultUnlock] Branch 1: First-time setup...");
                // First-time setup - safely save new verification token and iterations
                const { error: dbError } = await supabase
                    .from("profiles")
                    // @ts-expect-error Dynamic payload for kdf upgrade
                    .update({
                        vault_verification_data: newVerificationData,
                        kdf_iterations: CRYPTO_CONFIG.iterations,
                    })
                    .eq("id", profile.id);

                if (dbError) {
                    throw new Error("Failed to save vault verification setup.");
                }

                await passphraseManager.unlock(password, profile.salt, CRYPTO_CONFIG.iterations);

            } else if (newVerificationData) {
                console.log("[VaultUnlock] Branch 2: Rotation required...");
                // Old iterations triggered an upgrade. Do an atomic rotation so existing items 
                // re-encrypt correctly; do NOT arbitrarily bump the profile iterations alone!
                const vaultService = new VaultService(supabase);
                const rotateResult = await vaultService.rotateMasterPassword(
                    user.id,
                    password,
                    password,
                    profile.salt,
                    profile.vault_verification_data,
                    profile.kdf_iterations
                );

                if (!rotateResult.success) {
                    throw rotateResult.error;
                }
            } else {
                console.log("[VaultUnlock] Branch 3: Standard unlock path...");
                const targetIterations = profile.kdf_iterations ?? CRYPTO_CONFIG.legacyIterations;

                // ==========================================
                // SELF-HEALING KDF DESYNC MECHANISM
                // Detect if previous bug upgraded verification data to 600K but abandoned items at 100K.
                // ==========================================
                if (targetIterations === CRYPTO_CONFIG.iterations) {
                    const { deriveKeyFromPassword, encryptData, decryptData } = await import('@/lib/crypto/engine');
                    const testKey = await deriveKeyFromPassword(password, profile.salt, targetIterations);

                    const { data: rows } = await supabase.from('vault_credentials').select('*').eq('user_id', user.id);
                    let needsHeal = false;

                    if (rows && rows.length > 0) {
                        try {
                            const firstRow = rows[0] as unknown as { encrypted_data: string; iv: string; };
                            await decryptData(firstRow.encrypted_data, firstRow.iv, testKey);
                        } catch {
                            needsHeal = true; // Failed to decrypt rows with the new upgraded key!
                        }
                    }

                    if (needsHeal) {
                        // Attempt to heal: Derive a 100K key, test rows, and manually fall back to iterative updates.
                        const oldKey = await deriveKeyFromPassword(password, profile.salt, CRYPTO_CONFIG.legacyIterations);

                        try {
                            const updates = [];
                            // Explicitly test-decrypt with 100K key. If this fails, then it's genuinely corrupted.
                            for (const row of rows!) {
                                const r = row as unknown as { id: string; encrypted_data: string; iv: string; };
                                const plaintext = await decryptData(r.encrypted_data, r.iv, oldKey);
                                const { encryptedData, iv } = await encryptData(plaintext, testKey);
                                updates.push({ id: r.id, encrypted_data: encryptedData, iv });
                            }

                            if (updates.length > 0) {
                                // Iterate to update each row directly, bypassing any missing RPC functions.
                                const updatePromises = updates.map(update =>
                                    supabase.from('vault_credentials')
                                        // @ts-expect-error Dynamic payload mapping
                                        .update({ encrypted_data: update.encrypted_data, iv: update.iv })
                                        .eq('id', update.id)
                                );
                                await Promise.all(updatePromises);

                                const { generateVerificationToken } = await import('@/lib/crypto/core');
                                const vToken = generateVerificationToken();
                                const vResult = await encryptData(vToken, testKey);
                                const newVerificationDataStr = JSON.stringify({ ...vResult, scheme: 'random_token_v2' });

                                await supabase.from('profiles')
                                    // @ts-expect-error Dynamic payload for kdf upgrade
                                    .update({ vault_verification_data: newVerificationDataStr, kdf_iterations: CRYPTO_CONFIG.iterations })
                                    .eq('id', user.id);

                                console.log("Database successfully self-healed from KDF desync via iterative fallback.");
                            }
                        } catch (corruptionErr) {
                            console.error("Self-healing failed: Data is irrecoverably out of sync.", corruptionErr);
                        }
                    }
                }
                // ==========================================

                console.log("[VaultUnlock] Calling passphraseManager.unlock...");
                // Finally unlock the vault in memory, AFTER the data is fully ready to be read.
                await passphraseManager.unlock(password, profile.salt, targetIterations);
                console.log("[VaultUnlock] passphraseManager.unlock successful.");
            }

            console.log("[VaultUnlock] Finalizing state...");
            // Clear password from state immediately after deriving keys
            setPassword("");

            // Reset brute-force counters on successful unlock
            setFailedAttempts(0);
            setLockoutUntil(null);

            // Log vault unlock event
            try {
                const sec = new SecurityService(supabaseClient);
                await sec.logEvent(user.id, 'vault_unlocked', 'info');
            } catch { /* non-blocking */ }

            console.log("[VaultUnlock] Unlock sequence complete. Calling onUnlock...");
            setIsLoading(false);
            onUnlock();

        } catch (err) {
            console.error("[VaultUnlock] Exception caught:", err);
            setIsLoading(false);
            setError("An unexpected error occurred while unlocking the vault.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass p-10 rounded-2xl shadow-glass max-w-md w-full text-center">
                <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-10 h-10" />
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">Vault Locked</h2>
                <p className="text-secondary text-sm mb-8">
                    Enter your master password to derive the cryptographic keys and decrypt your vault.
                </p>

                <form onSubmit={handleUnlock} className="space-y-6">
                    {error && (
                        <div className="p-3 rounded-md bg-error/10 border border-error/20 text-error text-sm text-center">
                            {error}
                        </div>
                    )}

                    <input
                        type="password"
                        autoFocus
                        required
                        spellCheck="false"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading || isLockedOut}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-colors disabled:opacity-50 text-center text-xl tracking-widest font-mono"
                        placeholder="••••••••••••"
                    />

                    <button
                        type="submit"
                        disabled={isLoading || !password || isLockedOut}
                        className="w-full bg-brand text-brand-foreground font-semibold rounded-lg px-4 py-3 hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 flex items-center justify-center">
                                <span className="w-4 h-4 border-2 border-brand-foreground/30 border-t-brand-foreground rounded-full animate-spin block" />
                            </div>
                        ) : (
                            "Decrypt Vault"
                        )}
                    </button>
                </form>

                <p className="text-xs text-secondary mt-6">
                    Everything happens securely on your device. The master password never leaves this browser window.
                </p>
            </div>
        </div>
    );
}
