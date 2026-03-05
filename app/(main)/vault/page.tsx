"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { passphraseManager } from "@/lib/crypto/passphrase";
import { ShieldCheck, LockOpen } from "lucide-react";
import { CredentialList } from "@/components/vault/credential-list";
import { VaultUnlock } from "@/components/vault/vault-unlock";

export default function VaultPage() {
    const { user, signOut } = useAuth();

    // Track unlock state reactively
    const [isUnlocked, setIsUnlocked] = useState(passphraseManager.isUnlocked());

    useEffect(() => {
        // Subscribe to memory manager lock/unlock events so UI perfectly syncs
        // with 15-minute inactivity auto-locks
        const unsubscribe = passphraseManager.subscribe((locked) => {
            setIsUnlocked(!locked);
        });
        return unsubscribe;
    }, []);

    const handleManualLock = () => {
        passphraseManager.lock();
    };

    // 1. Vault is locked -> Show Unlock Screen
    if (!isUnlocked) {
        return <VaultUnlock onUnlock={() => setIsUnlocked(true)} />;
    }

    // 2. Vault is unlocked -> Show secure dashboard
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <LockOpen className="w-8 h-8 text-success" />
                        Your Vault
                    </h1>
                    <p className="text-secondary mt-1">
                        Welcome back, {user?.email}
                    </p>
                </div>

                <button
                    onClick={handleManualLock}
                    className="px-6 py-2 rounded-lg bg-error/10 hover:bg-error/20 text-error transition-colors text-sm font-medium border border-error/20"
                >
                    Lock Vault Now
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 md:p-8 rounded-xl shadow-glass md:col-span-3">
                    <CredentialList />
                </div>

                <div className="glass p-6 rounded-xl shadow-glass flex flex-col">
                    <h2 className="text-lg font-semibold mb-4 text-foreground">Security Health</h2>
                    <div className="space-y-4 flex-1">
                        <div className="bg-success/10 text-success p-3 rounded-md text-sm flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Vault is currently unlocked
                        </div>

                        <p className="text-xs text-secondary leading-relaxed">
                            Your cryptographic keys are currently held dynamically in memory. They will be securely purged after 15 minutes of inactivity.
                        </p>
                    </div>

                    <button
                        onClick={signOut}
                        className="w-full px-4 py-2 mt-4 rounded-md bg-secondary/10 hover:bg-secondary/20 text-foreground transition-colors text-sm font-medium border border-border"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
