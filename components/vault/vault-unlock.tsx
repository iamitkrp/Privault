"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { passphraseManager } from "@/lib/crypto/passphrase";
import { CRYPTO_CONFIG } from "@/constants";
import { ChevronRight, Fingerprint, ShieldCheck, Unlock } from "lucide-react";
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

    return (
        <>

            <motion.div 
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                className="relative z-10 w-full max-w-[440px] flex flex-col items-center p-8 sm:p-12 mb-20"
            >
                {/* Glass Panel Base */}
                <div className="absolute inset-0 bg-[#030303]/40 backdrop-blur-[50px] rounded-[32px] border border-white/[0.06] shadow-2xl pointer-events-none" />
                
                {/* Inner Highlight */}
                <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_0_100px_rgba(255,255,255,0.01)] pointer-events-none" />
                <div className="absolute top-0 inset-x-0 h-[1px] w-1/2 mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                {/* Close Button */}
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-white/30 hover:text-white bg-white/[0.03] hover:bg-white/[0.1] rounded-full transition-all duration-300 z-50 backdrop-blur-md"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                )}

                {/* Cryptographic Core Visualization */}
                <div className="relative w-32 h-32 mb-8 flex items-center justify-center z-10">
                    <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border border-dashed border-white/10"
                    />
                    <motion.div 
                        // Spin faster when user types
                        animate={{ rotate: -360 }} 
                        transition={{ duration: password.length > 0 ? Math.max(2, 10 - password.length) : 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-3 rounded-full border-[1.5px] border-transparent border-t-[#ff4500]/70 border-b-[#ff4500]/70"
                    />
                    <div className="absolute inset-6 bg-gradient-to-br from-[#1a1a1a] to-black rounded-full border border-white/10 shadow-[0_0_30px_rgba(255,69,0,0.1)] flex items-center justify-center overflow-hidden">
                        {/* Shimmer inside core */}
                        <motion.div 
                            animate={{ y: ["-100%", "200%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 w-full bg-gradient-to-b from-transparent via-white/5 to-transparent skew-y-12"
                        />
                        {isLoading ? (
                            <Unlock className="w-8 h-8 text-[#ff4500] animate-pulse relative z-10" strokeWidth={1.5} />
                        ) : (
                            <ShieldCheck className={`w-8 h-8 transition-colors duration-500 relative z-10 ${password.length > 0 ? 'text-white' : 'text-white/30'}`} strokeWidth={1.5} />
                        )}
                    </div>
                </div>

                <h2 className="relative z-10 text-3xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-3 text-center w-full">
                    Master Cipher
                </h2>
                <p className="relative z-10 text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] text-center w-full leading-relaxed mb-10 max-w-[280px]">
                    Enter your decryption key to mount local vault
                </p>

                <form onSubmit={handleUnlock} className="w-full relative z-10 flex flex-col items-center">
                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className="w-full border border-red-900/40 bg-red-950/20 text-red-400 font-mono text-[10px] uppercase px-4 py-3 rounded-xl flex items-start gap-3 backdrop-blur-md overflow-hidden"
                            >
                                <span className="font-bold shrink-0 mt-[1px] text-red-500">!</span>
                                <span className="leading-relaxed">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Innovative Password Visualizer */}
                    <div className="relative w-full mb-10 group cursor-text">
                        <div className={`relative w-full h-16 bg-black/40 rounded-2xl border ${password ? 'border-[#ff4500]/40 shadow-[0_0_20px_rgba(255,69,0,0.1)]' : 'border-white/[0.05]'} shadow-inner overflow-hidden flex items-center justify-center transition-all duration-500`}>
                            
                            {/* Inner ambient glow on focus */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#ff4500]/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />

                            <div className="flex items-center gap-2 pointer-events-none relative z-10">
                                {password.length === 0 ? (
                                    <motion.span 
                                        animate={{ opacity: [0.3, 1, 0.3] }} 
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="font-mono text-[11px] tracking-[0.3em] text-gray-600 uppercase flex items-center gap-2"
                                    >
                                        <Fingerprint className="w-3.5 h-3.5" /> Awaiting Input
                                    </motion.span>
                                ) : (
                                    Array.from({ length: password.length }).map((_, i) => (
                                        <motion.div 
                                            key={i}
                                            initial={{ scale: 0, opacity: 0, rotate: -45 }}
                                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                            className="w-2 h-2 bg-white rounded-sm shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                                        />
                                    ))
                                )}
                                {password.length > 0 && (
                                    <motion.div 
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                        className="w-2 h-4 bg-[#ff4500] ml-1 rounded-[1px]"
                                    />
                                )}
                            </div>

                            <input
                                type="password"
                                autoFocus
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading || isLockedOut}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-text z-20"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !password || isLockedOut}
                        className="relative w-full h-14 rounded-2xl bg-[#ff4500] text-black font-bold font-mono tracking-[0.2em] text-[11px] uppercase overflow-hidden group disabled:opacity-50 disabled:bg-white/5 disabled:text-white/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,69,0,0.3)] hover:-translate-y-0.5"
                    >
                        {!isLoading && password && !isLockedOut && (
                            <motion.div 
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                            />
                        )}
                        
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {isLoading ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Decrypting Sequence...
                                </>
                            ) : (
                                <>
                                    Initialize Decryption <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </span>
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/[0.04] w-full flex items-center justify-between opacity-60">
                    <div className="font-mono text-[9px] text-gray-500 tracking-[0.2em] uppercase">
                        Protocol: PBKDF2-HMAC-SHA256
                    </div>
                </div>
            </motion.div>
        </>
    );
}
