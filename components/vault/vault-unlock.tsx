"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { passphraseManager } from "@/lib/crypto/passphrase";
import { CRYPTO_CONFIG } from "@/constants";
import { ChevronRight, Activity, X } from "lucide-react";
import { SecurityService } from "@/services/security.service";
import { VaultService } from "@/services/vault.service";
import { motion, AnimatePresence } from "framer-motion";

interface VaultUnlockProps {
    onUnlock: () => void;
    onClose?: () => void;
}

/** Backoff only kicks in at this many failed attempts */
const BACKOFF_THRESHOLD = 5;

export function VaultUnlock({ onUnlock, onClose }: VaultUnlockProps) {
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

    /* ─── Hex path constant used for both base + tracer ─── */
    const hexPath = "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-[420px] bg-[#050505] border border-white/10 shadow-2xl overflow-hidden p-8 sm:p-10 font-sans selection:bg-[#ff4500]/30"
        >
            {/* Subtle top highlight */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Grid background inside modal */}
            <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

            {/* Close button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white border border-[#333] hover:border-[#444] bg-transparent hover:bg-white/5 transition-colors z-20"
                >
                    <X className="w-4 h-4" />
                </button>
            )}

            {/* ── Loading overlay ── */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-6"
                    >
                        <div className="relative w-16 h-16">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ff4500" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20">
                                <path d={hexPath} />
                            </svg>
                            <motion.svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ff4500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute inset-0 drop-shadow-[0_0_12px_rgba(255,69,0,0.8)]">
                                <motion.path
                                    d={hexPath}
                                    initial={{ pathLength: 0, pathOffset: 0 }}
                                    animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 1, 2] }}
                                    transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                                />
                            </motion.svg>
                        </div>
                        <span className="mono text-[9px] uppercase tracking-widest text-gray-500">
                            DECRYPTING VAULT...
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Header: Brand Logo ── */}
            <div className="flex flex-col items-center mb-10 relative z-[1]">
                {/* Hexagon logo with tracer — matches landing nav */}
                <div className="relative w-10 h-10 mb-5">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/20">
                        <path d={hexPath} />
                    </svg>
                    <motion.svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff4500] drop-shadow-[0_0_8px_rgba(255,69,0,0.8)] absolute inset-0">
                        <motion.path
                            d={hexPath}
                            initial={{ pathLength: 0, pathOffset: 0 }}
                            animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 1, 2] }}
                            transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                        />
                    </motion.svg>
                </div>

                <span className="mono text-sm tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
                    PRIVAULT.
                </span>

                <h2 className="text-2xl font-bold tracking-tight text-white uppercase mb-2">
                    Unlock Vault
                </h2>
                <p className="mono text-[10px] text-gray-500 uppercase tracking-[0.15em] text-center leading-relaxed max-w-[280px]">
                    Enter your master password to decrypt and mount your local vault
                </p>
            </div>

            {/* ── Error banner ── */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="mono text-[10px] uppercase tracking-wider text-red-400 border border-red-900/40 bg-red-950/20 px-4 py-3 flex items-start gap-3 overflow-hidden relative z-[1]"
                    >
                        <span className="text-red-500 font-bold shrink-0 mt-[1px]">!</span>
                        <span className="leading-relaxed">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Form ── */}
            <form onSubmit={handleUnlock} className="relative z-[1] flex flex-col gap-6">
                {/* Password input */}
                <div className="flex flex-col gap-2">
                    <label className="mono text-[9px] text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Activity className="w-3 h-3 text-[#ff4500]" />
                        Master Password
                    </label>
                    <div className="relative group">
                        <input
                            type="password"
                            autoFocus
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading || isLockedOut}
                            placeholder="Enter decryption key..."
                            className="w-full h-12 bg-black/60 border border-[#333] focus:border-[#ff4500]/50 text-white mono text-sm tracking-wider px-4 outline-none transition-all duration-300 placeholder:text-gray-700 disabled:opacity-40 focus:shadow-[0_0_20px_rgba(255,69,0,0.08)]"
                        />
                        {/* Bottom glow line on focus */}
                        <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#ff4500]/0 to-transparent group-focus-within:via-[#ff4500]/60 transition-all duration-500" />
                    </div>
                </div>

                {/* Lockout timer */}
                {isLockedOut && (
                    <div className="mono text-[10px] text-[#ff4500] uppercase tracking-widest text-center">
                        Locked — {remainingSeconds}s remaining
                    </div>
                )}

                {/* Submit button — landing page CTA style */}
                <button
                    type="submit"
                    disabled={isLoading || !password || isLockedOut}
                    className="group relative overflow-hidden h-12 text-black bg-white hover:bg-gray-200 transition-all duration-300 w-full disabled:opacity-30 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed"
                >
                    {/* Shimmer sweep */}
                    {!isLoading && password && !isLockedOut && (
                        <motion.div
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-black/10 to-transparent skew-x-12"
                        />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-2 mono text-[11px] font-bold uppercase tracking-widest">
                        {isLoading ? (
                            <>
                                <motion.svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40">
                                    <motion.path
                                        d={hexPath}
                                        initial={{ pathLength: 0, pathOffset: 0 }}
                                        animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 1, 2] }}
                                        transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                                    />
                                </motion.svg>
                                Decrypting...
                            </>
                        ) : (
                            <>
                                Initialize Decryption <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </span>
                </button>
            </form>

            {/* ── Footer metadata ── */}
            <div className="mt-8 pt-5 border-t border-white/[0.06] flex items-center justify-between relative z-[1]">
                <span className="mono text-[8px] text-gray-600 uppercase tracking-widest">
                    Protocol: PBKDF2-HMAC-SHA256
                </span>
                <span className="mono text-[8px] text-gray-600 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-2.5 h-2.5" /> AES-256-GCM
                </span>
            </div>
        </motion.div>
    );
}
