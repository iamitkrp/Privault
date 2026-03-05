"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { passphraseManager } from "@/lib/crypto/passphrase";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
            // For first time users, this will encrypt the verification string and return it
            const { isValid, newVerificationData } = await passphraseManager.verifyOrSetupMasterPassword(
                password,
                profile.salt,
                profile.vault_verification_data
            );

            if (!isValid) {
                setIsLoading(false);
                setError("Incorrect master password. Please verify and try again.");
                return;
            }

            // If it's the first time unlocking, persist the magic verification string 
            // back to the profile before fully unlocking the memory vault
            if (newVerificationData) {
                const supabase = createClient();
                const { error: dbError } = await supabase
                    .from("profiles")
                    .update({ vault_verification_data: newVerificationData })
                    .eq("id", profile.id);

                if (dbError) {
                    throw new Error("Failed to save vault verification setup.");
                }
            }

            // Officially unlock the vault in memory
            await passphraseManager.unlock(password, profile.salt);
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
