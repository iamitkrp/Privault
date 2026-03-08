"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { passphraseManager } from "@/lib/crypto/passphrase";
import { CRYPTO_CONFIG } from "@/constants";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SecurityService } from "@/services/security.service";

interface VaultUnlockProps {
    onUnlock: () => void;
}

export function VaultUnlock({ onUnlock }: VaultUnlockProps) {
    const { profile } = useAuth();
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || !profile.salt) {
            setError("Profile or crypto salt is missing. Please contact support.");
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
                setIsLoading(false);
                setError("Incorrect master password. Please verify and try again.");
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
                    // @ts-expect-error
                    .update(updatePayload)
                    .eq("id", profile.id);

                if (dbError) {
                    throw new Error("Failed to save vault verification setup.");
                }
            }

            // Unlock the vault in memory.
            // After a successful upgrade (or first-time setup) the key should be derived at
            // the new (600K) iterations. For existing users who are already at 600K (or any
            // stored value), use their stored value.
            const unlockIterations =
                (newVerificationData && (needsKdfUpgrade || !profile.vault_verification_data))
                    ? CRYPTO_CONFIG.iterations
                    : (profile.kdf_iterations ?? CRYPTO_CONFIG.legacyIterations);

            await passphraseManager.unlock(password, profile.salt, unlockIterations);

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
                        disabled={isLoading}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-colors disabled:opacity-50 text-center text-xl tracking-widest font-mono"
                        placeholder="••••••••••••"
                    />

                    <button
                        type="submit"
                        disabled={isLoading || !password}
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
