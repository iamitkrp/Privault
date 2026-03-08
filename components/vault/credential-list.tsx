"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { createClient } from "@/lib/supabase/client";
import { VaultService } from "@/services/vault.service";
import { VaultCredential, DecryptedCredential } from "@/types";
import { Plus, Search, ServerCrash, KeyRound } from "lucide-react";
import { CredentialCard } from "./credential-card";
import { CredentialModal } from "./credential-modal";
interface CredentialListProps {
    onCredentialsLoad?: (credentials: VaultCredential[]) => void;
}

export function CredentialList({ onCredentialsLoad }: CredentialListProps) {
    const { user } = useAuth();

    const [credentials, setCredentials] = useState<VaultCredential[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCred, setEditingCred] = useState<VaultCredential | undefined>(undefined);

    const vaultService = new VaultService(createClient());

    useEffect(() => {
        const loadVault = async () => {
            if (!user) return;
            setIsLoading(true);
            const result = await vaultService.getCredentials();

            if (result.success) {
                setCredentials(result.data);
            } else {
                setError(result.error.message || "Failed to sync vault");
            }
            setIsLoading(false);
        };

        loadVault();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Sync credentials to parent via effect (avoids setState-during-render)
    useEffect(() => {
        if (onCredentialsLoad) onCredentialsLoad(credentials);
    }, [credentials, onCredentialsLoad]);

    const handleSave = async (decrypted: DecryptedCredential, metadata: any) => {
        if (!user) return;

        if (editingCred) {
            // Update
            const result = await vaultService.updateCredential(editingCred.id, decrypted, metadata);
            if (!result.success) throw result.error;

            setCredentials(prev =>
                prev.map(c => c.id === editingCred.id ? result.data! : c)
            );
        } else {
            // Add
            const result = await vaultService.addCredential(user.id, decrypted, metadata);
            if (!result.success) throw result.error;

            setCredentials(prev => [result.data!, ...prev]);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this credential? This cannot be undone.")) return;

        const result = await vaultService.deleteCredential(id);
        if (result.success) {
            setCredentials(prev => prev.filter(c => c.id !== id));
        } else {
            alert("Failed to delete credential");
        }
    };

    // Filter Logic
    const filteredCreds = credentials.filter(c =>
        c.decrypted.site_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.decrypted.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center text-error glass p-8 rounded-2xl">
                <ServerCrash className="w-12 h-12 mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">Decryption Failed</h3>
                <p className="text-sm opacity-80">{error}</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                    <input
                        type="text"
                        placeholder="Search vault..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-foreground focus:ring-1 focus:ring-brand focus:border-brand"
                    />
                </div>

                <button
                    onClick={() => { setEditingCred(undefined); setIsModalOpen(true); }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand text-brand-foreground font-semibold hover:bg-brand-hover hover:scale-105 active:scale-95 transition-all shadow-glow flex items-center justify-center gap-2 whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" />
                    New Credential
                </button>
            </div>

            {filteredCreds.length === 0 ? (
                <div className="text-center py-20 glass rounded-2xl border border-border border-dashed">
                    <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
                        <KeyRound className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Your vault is empty</h3>
                    <p className="text-sm text-secondary">
                        {searchQuery ? "No credentials match your search." : "Start securely storing your passwords today by adding a new credential."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredCreds.map(cred => (
                        <CredentialCard
                            key={cred.id}
                            credential={cred}
                            onEdit={(c) => { setEditingCred(c); setIsModalOpen(true); }}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            <CredentialModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                existingCredential={editingCred}
            />

        </div>
    );
}
