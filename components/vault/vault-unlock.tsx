"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { passphraseManager } from "@/lib/crypto/passphrase";
import { CRYPTO_CONFIG } from "@/constants";
import { ChevronRight, Activity, Lock, Key, Terminal, AlertTriangle, Shield } from "lucide-react";
import { SecurityService } from "@/services/security.service";
import { VaultService } from "@/services/vault.service";
import { OTPGate } from "@/components/auth/otp-gate";
import { motion, AnimatePresence } from "framer-motion";

interface VaultUnlockProps {
    onUnlock: () => void;
}

/** Backoff only kicks in at this many failed attempts */
const BACKOFF_THRESHOLD = 5;

export function VaultUnlock({ onUnlock }: VaultUnlockProps) {
    const { profile, profileError, user, supabaseClient, loginPasswordHash } = useAuth();
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const lockoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [vaultOtpVerified, setVaultOtpVerified] = useState(false);

    // Check if OTP on vault unlock is required
    const requireOtpOnVaultUnlock = profile?.security_settings?.require_otp_on_vault_unlock ?? false;


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
            // Vault ≠ Login password enforcement:
            // On first-time setup (no verification data), the user is choosing their vault password.
            // Block if it matches their login password.
            if (!profile.vault_verification_data && loginPasswordHash) {
                const encoder = new TextEncoder();
                const data = encoder.encode(password);
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const vaultPasswordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                if (vaultPasswordHash === loginPasswordHash) {
                    setError("Your vault master password must be different from your login password. Please choose a unique password for added security.");
                    setIsLoading(false);
                    return;
                }
            }

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
                    console.log("[VaultUnlock] Running self-healing logic. Importing engine...");
                    const { deriveKeyFromPassword, encryptData, decryptData } = await import('@/lib/crypto/engine');
                    console.log("[VaultUnlock] Engine imported. Deriving test key...");
                    const testKey = await deriveKeyFromPassword(password, profile.salt, targetIterations);

                    console.log("[VaultUnlock] Test key derived. Fetching rows...");
                    const { data: rows, error: fetchError } = await supabase.from('vault_credentials').select('*').eq('user_id', user.id);
                    if (fetchError) console.error("[VaultUnlock] Fetch error:", fetchError);
                    console.log("[VaultUnlock] Rows fetched:", rows?.length);

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
                                console.log(`[VaultUnlock] Applying ${updates.length} row updates...`);
                                // Iterate to update each row directly, bypassing any missing RPC functions.
                                const updatePromises = updates.map(update =>
                                    supabase.from('vault_credentials')
                                        // @ts-expect-error Dynamic payload mapping
                                        .update({ encrypted_data: update.encrypted_data, iv: update.iv })
                                        .eq('id', update.id)
                                );
                                await Promise.all(updatePromises);
                                console.log(`[VaultUnlock] Row updates complete.`);

                                const { generateVerificationToken } = await import('@/lib/crypto/core');
                                const vToken = generateVerificationToken();
                                console.log(`[VaultUnlock] Encrypting new verification token...`);
                                const vResult = await encryptData(vToken, testKey);
                                const newVerificationDataStr = JSON.stringify({ ...vResult, scheme: 'random_token_v2' });

                                console.log(`[VaultUnlock] Updating profile verification string...`);
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
                console.log("[VaultUnlock] Self-healing block finished.");
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

    /* ─── Hex path constant ─── */
    const hexPath = "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-2xl relative z-10 mx-auto"
        >
            <div className="flex flex-col gap-8 w-full">
                {/* Main Panel */}
                <div className="border border-border bg-bg-secondary p-8 sm:p-10 relative overflow-hidden">
                    {/* Background accents */}
                    <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

                    <div className="flex flex-col gap-8 relative z-10 w-full">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-secondary pb-6">
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5 text-success" />
                                <span className="mono text-sm uppercase tracking-[0.2em] text-foreground">
                                    Encrypted Storage
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-widest text-success px-3 py-1.5 bg-success/10 border border-success/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                Locked
                            </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-3">
                            <h3 className="mono text-sm tracking-widest text-fg-muted uppercase flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                Authentication Required
                            </h3>
                            <p className="mono text-xs leading-relaxed text-fg-secondary uppercase tracking-widest max-w-[480px]">
                                Your vault is currently sealed using AES-256-GCM encryption. Provide your master decryption key to mount the local secure volume.
                            </p>
                        </div>

                        {/* OTP Gate (if required) */}
                        {requireOtpOnVaultUnlock && !vaultOtpVerified ? (
                            <div className="mt-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="w-4 h-4 text-success" />
                                    <span className="mono text-[10px] uppercase tracking-widest text-fg-muted">
                                        Step 1 of 2 — Identity Verification
                                    </span>
                                </div>
                                <OTPGate
                                    purpose="vault_unlock"
                                    actionLabel="Send Verification Code"
                                    description="Your security settings require OTP verification before unlocking the vault."
                                    onVerified={() => setVaultOtpVerified(true)}
                                />
                            </div>
                        ) : (
                        <>

                        {/* Error/Sync Banner */}
                        <AnimatePresence>
                            {!profile && !profileError ? (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mono text-[10px] uppercase tracking-widest text-success bg-success/10 border border-success/20 px-4 py-3 flex items-center justify-between gap-3 mt-2">
                                        <div className="flex items-start gap-3">
                                            <Activity className="w-3.5 h-3.5 shrink-0 mt-[1px] animate-pulse" />
                                            <span className="leading-relaxed">SYNCHRONIZING SECURE PROFILE...</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => window.location.reload()}
                                            className="shrink-0 px-2 py-1 border border-success/30 hover:bg-success/20 transition-colors text-[9px]"
                                        >
                                            RETRY
                                        </button>
                                    </div>
                                </motion.div>
                            ) : profileError ? (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mono text-[10px] uppercase tracking-widest text-error bg-error/10 border border-error/20 px-4 py-3 flex items-center justify-between gap-3 mt-2">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-[1px]" />
                                            <span className="leading-relaxed">SYNC FAILED: {profileError}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => window.location.reload()}
                                            className="shrink-0 px-2 py-1 border border-error/30 hover:bg-error/20 transition-colors text-[9px]"
                                        >
                                            RETRY
                                        </button>
                                    </div>
                                </motion.div>
                            ) : error ? (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mono text-[10px] uppercase tracking-widest text-error bg-error/10 border border-error/20 px-4 py-3 flex items-start gap-3 mt-2">
                                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-[1px]" />
                                        <span className="leading-relaxed">{error}</span>
                                    </div>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>

                        {/* Form */}
                        <form onSubmit={handleUnlock} className="flex flex-col gap-6 mt-2">
                            <div className="flex flex-col gap-3">
                                <label className="mono text-[10px] text-fg-secondary uppercase tracking-widest flex items-center gap-2">
                                    <Key className="w-3 h-3 text-success" />
                                    Master Decryption Key
                                </label>
                                <div className="relative flex items-center group">
                                    <span className="absolute left-4 text-success font-mono text-sm group-focus-within:animate-pulse">
                                        &gt;
                                    </span>
                                    <input
                                        type="password"
                                        autoFocus
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading || isLockedOut}
                                        placeholder="Enter decryption key..."
                                        className="w-full h-14 bg-background/60 border border-border-secondary focus:border-success/50 text-foreground mono text-sm sm:text-base tracking-[0.2em] sm:tracking-[0.3em] pl-10 pr-4 outline-none transition-all duration-300 placeholder:text-fg-muted focus:shadow-[0_0_20px_rgba(255,69,0,0.05)] disabled:opacity-50"
                                    />
                                    {/* Bottom glow line on focus */}
                                    <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-success/0 to-transparent group-focus-within:via-success/40 transition-all duration-500" />
                                </div>
                            </div>

                            {/* Lockout Timer */}
                            {isLockedOut && (
                                <div className="mono text-[10px] text-success uppercase tracking-widest mt-[-8px]">
                                    Locked — {remainingSeconds}s remaining
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || !password || isLockedOut || !profile}
                                className="h-14 mt-2 bg-foreground hover:opacity-90 text-background transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-40 disabled:bg-foreground/10 disabled:text-fg-secondary disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                {/* Shimmer sweep */}
                                {!isLoading && password && !isLockedOut && profile && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                )}
                                <span className="relative z-10 flex items-center gap-2 mono text-xs font-bold uppercase tracking-[0.2em]">
                                    {isLoading ? (
                                        <>
                                            <motion.svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/50">
                                                <motion.path
                                                    d={hexPath}
                                                    initial={{ pathLength: 0, pathOffset: 0 }}
                                                    animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 1, 2] }}
                                                    transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                                                />
                                            </motion.svg>
                                            Decrypting Volume...
                                        </>
                                    ) : profileError ? (
                                        <>SYNC ERROR</>
                                    ) : !profile ? (
                                        <>Awaiting Profile Sync...</>
                                    ) : (
                                        <>
                                            Mount Volume <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>
                        </>
                        )}
                    </div>
                </div>

                {/* Footer Metrics */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-fg-secondary mono text-[9px] uppercase tracking-widest px-2 relative z-10">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2">
                            <Activity className="w-3 h-3 text-success" /> 
                            SYSTEM_STATUS: OK
                        </span>
                        <span className="hidden sm:inline">PROTOCOL: PBKDF2-HMAC-SHA256</span>
                    </div>
                    <span>LOCAL_STATE: UNMOUNTED</span>
                </div>
            </div>
        </motion.div>
    );
}
