"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { passphraseManager } from "@/lib/crypto/passphrase";
import { LockOpen } from "lucide-react";
import { CredentialList } from "@/components/vault/credential-list";
import { VaultUnlock } from "@/components/vault/vault-unlock";
import { VaultHealth } from "@/components/vault/vault-health";
import { VaultCredential } from "@/types";

export default function VaultPage() {
    const { user } = useAuth();

    // Track unlock state reactively
    const [isUnlocked, setIsUnlocked] = useState(passphraseManager.isUnlocked());
    const [credentials, setCredentials] = useState<VaultCredential[]>([]);

    useEffect(() => {
        // Subscribe to memory manager lock/unlock events so UI perfectly syncs
        // with 15-minute inactivity auto-locks
        const unsubscribe = passphraseManager.subscribe((locked) => {
            setIsUnlocked(!locked);
        });
        return unsubscribe;
    }, []);

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                <div className="md:col-span-3">
                    <CredentialList onCredentialsLoad={setCredentials} />
                </div>

                <div className="sticky top-6">
                    <VaultHealth credentials={credentials} />
                </div>
            </div>
        </div>
    );
}
