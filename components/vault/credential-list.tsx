"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { VaultService } from "@/services/vault.service";
import { VaultCredential, DecryptedCredential } from "@/types";
import { Plus, Search, ServerCrash, KeyRound, LayoutGrid, List } from "lucide-react";
import { CredentialCard } from "./credential-card";
// @ts-ignore - module exists
import { CredentialRow } from "./credential-row";
import { CredentialModal } from "./credential-modal";
import { motion } from "framer-motion";

interface CredentialListProps {
    onCredentialsLoad?: (credentials: VaultCredential[]) => void;
}

export function CredentialList({ onCredentialsLoad }: CredentialListProps) {
    const { user, supabaseClient } = useAuth();

    const [credentials, setCredentials] = useState<VaultCredential[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCred, setEditingCred] = useState<VaultCredential | undefined>(undefined);

    const vaultService = new VaultService(supabaseClient);

    useEffect(() => {
        const loadVault = async () => {
            if (!user?.id) return;

            if (credentials.length === 0) {
                setIsLoading(true);
            }

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
    }, [user?.id]);

    useEffect(() => {
        if (onCredentialsLoad) onCredentialsLoad(credentials);
    }, [credentials, onCredentialsLoad]);

    const handleSave = async (decrypted: DecryptedCredential, metadata: Record<string, unknown>) => {
        if (!user) return;

        if (editingCred) {
            const result = await vaultService.updateCredential(editingCred.id, decrypted, metadata);
            if (!result.success) throw result.error;

            setCredentials(prev =>
                prev.map(c => c.id === editingCred.id ? result.data! : c)
            );
        } else {
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
            <div className="flex flex-col items-center justify-center py-20 text-center bg-[#0A0A0A] border border-[#222]">
                <ServerCrash className="w-10 h-10 mb-6 text-red-500 opacity-50" />
                <h3 className="mono text-sm tracking-widest font-bold text-red-500 uppercase mb-2">Decryption Failed</h3>
                <p className="mono text-[10px] text-gray-500 tracking-widest uppercase">{error}</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-3 mono text-xs text-gray-500 uppercase tracking-widest">
                    <div className="w-2 h-2 bg-gray-500 animate-pulse" />
                    Decrypting Local Volume...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-0">

            {/* ── Toolbar ── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                {/* Search */}
                <div className="relative flex-1 flex items-center group">
                    <Search className="w-4 h-4 absolute left-4 text-gray-600 group-focus-within:text-white transition-colors" />
                    <input
                        type="text"
                        placeholder="SEARCH VAULT..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 bg-[#050505] border border-[#222] focus:border-[#444] text-white mono text-[10px] tracking-widest uppercase pl-11 pr-4 outline-none transition-all duration-300 placeholder:text-gray-800 focus:shadow-[0_0_20px_rgba(255,255,255,0.03)]"
                    />
                </div>

                {/* View toggle */}
                <div className="flex border border-[#222] bg-[#050505] h-11">
                    <button
                        onClick={() => setViewMode("list")}
                        className={`px-3 flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-white/5 text-white" : "text-gray-600 hover:text-gray-400"}`}
                        title="List View"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`px-3 flex items-center justify-center transition-colors border-l border-[#222] ${viewMode === "grid" ? "bg-white/5 text-white" : "text-gray-600 hover:text-gray-400"}`}
                        title="Grid View"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                </div>

                {/* Add button */}
                <button
                    onClick={() => { setEditingCred(undefined); setIsModalOpen(true); }}
                    className="h-11 px-6 bg-white hover:bg-gray-200 text-black transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden shrink-0"
                >
                    <span className="mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 relative z-10">
                        <Plus className="w-3.5 h-3.5" />
                        New Credential
                    </span>
                </button>
            </div>

            {/* ── Results Header ── */}
            <div className="flex items-center justify-between mb-4 px-1">
                <p className="mono text-[10px] text-gray-600 uppercase tracking-widest">
                    {filteredCreds.length} {filteredCreds.length === 1 ? "entry" : "entries"}
                    {searchQuery && <span className="text-gray-700"> · matching &quot;{searchQuery}&quot;</span>}
                </p>
                <p className="mono text-[10px] text-gray-700 uppercase tracking-widest">
                    {viewMode === "list" ? "LIST" : "GRID"} VIEW
                </p>
            </div>

            {/* ── Content ── */}
            {filteredCreds.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20 bg-[#050505] border border-[#222] border-dashed relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#333]" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#333]" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#333]" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#333]" />

                    <div className="w-14 h-14 bg-white/5 border border-white/10 text-white flex items-center justify-center mx-auto mb-5">
                        <KeyRound className="w-5 h-5" />
                    </div>
                    <h3 className="mono text-xs font-bold tracking-widest text-white uppercase mb-2">Vault Empty</h3>
                    <p className="mono text-[10px] text-gray-500 tracking-widest uppercase">
                        {searchQuery ? "No matches found." : "Store your credentials securely."}
                    </p>
                </motion.div>
            ) : viewMode === "list" ? (
                /* ── LIST VIEW: Compact rows ── */
                <div className="flex flex-col gap-[1px] bg-[#1a1a1a] border border-[#1a1a1a]">
                    {filteredCreds.map((cred, idx) => (
                        <motion.div
                            key={cred.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.03 }}
                        >
                            <CredentialRow
                                credential={cred}
                                onEdit={(c: VaultCredential) => { setEditingCred(c); setIsModalOpen(true); }}
                                onDelete={handleDelete}
                            />
                        </motion.div>
                    ))}
                </div>
            ) : (
                /* ── GRID VIEW: Cards ── */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredCreds.map((cred, idx) => (
                        <motion.div
                            key={cred.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                        >
                            <CredentialCard
                                credential={cred}
                                onEdit={(c) => { setEditingCred(c); setIsModalOpen(true); }}
                                onDelete={handleDelete}
                            />
                        </motion.div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <CredentialModal
                    key={editingCred ? editingCred.id : 'new-cred'}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    existingCredential={editingCred}
                />
            )}
        </div>
    );
}
