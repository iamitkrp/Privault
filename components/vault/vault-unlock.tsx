"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { passphraseManager } from "@/lib/crypto/passphrase";
import { CRYPTO_CONFIG } from "@/constants";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SecurityService } from "@/services/security.service";

interface VaultUnlockProps {
    onUnlock: () => void;
}

/** Backoff only kicks in at this many failed attempts */
const BACKOFF_THRESHOLD = 5;

export function VaultUnlock({ onUnlock }: VaultUnlockProps) {
    const { profile } = useAuth();
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
        if (!profile || !profile.salt) {
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
            // Verify the master password, passing the user's stored KDF iterations
            const { isValid, newVerificationData, needsKdfUpgrade } =
                await passphraseManager.verifyOrSetupMasterPassword(
                    password,
                    profile.salt,
                    profile.vault_verification_data,
                    profile.kdf_iterations
                );

            if (!isValid) {
                const newFailedAttempts = failedAttempts + 1;
                setFailedAttempts(newFailedAttempts);

                // Log failed attempt as suspicious activity (non-blocking)
                try {
                    const sb = createClient();
                    const sec = new SecurityService(sb);
                    await sec.logEvent(
                        profile.id,
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

            const supabase = createClient();

            // Determine what to persist: first-time setup, KDF upgrade, or nothing
            if (newVerificationData) {
                // Build the update payload
                const updatePayload: Record<string, unknown> = {
                    vault_verification_data: newVerificationData,
                };

                if (needsKdfUpgrade || !profile.vault_verification_data) {
                    // Upgrade to current iterations OR first-time setup at current iterations
                    updatePayload.kdf_iterations = CRYPTO_CONFIG.iterations;
                }

                const { error: dbError } = await supabase
                    .from("profiles")
                    // @ts-expect-error Dynamic payload for kdf upgrade
                    .update(updatePayload)
                    .eq("id", profile.id);

                if (dbError) {
                    throw new Error("Failed to save vault verification setup.");
                }
            }

            // Unlock the vault in memory.
            const unlockIterations =
                (newVerificationData && (needsKdfUpgrade || !profile.vault_verification_data))
                    ? CRYPTO_CONFIG.iterations
                    : (profile.kdf_iterations ?? CRYPTO_CONFIG.legacyIterations);

            await passphraseManager.unlock(password, profile.salt, unlockIterations);

            // Clear password from state immediately after deriving keys
            setPassword("");

            // Reset brute-force counters on successful unlock
            setFailedAttempts(0);
            setLockoutUntil(null);

            // Log vault unlock event
            try {
                const sb = createClient();
                const sec = new SecurityService(sb);
                await sec.logEvent(profile.id, 'vault_unlocked', 'info');
            } catch { /* non-blocking */ }

            setIsLoading(false);
            onUnlock();

        } catch (err) {
            console.error(err);
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
