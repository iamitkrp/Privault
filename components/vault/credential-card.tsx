"use client";

import { useState } from "react";
import { Copy, Check, MoreVertical, Edit2, Trash2, KeyRound, Clock } from "lucide-react";
import { VaultCredential } from "@/types";

interface CredentialCardProps {
    credential: VaultCredential;
    onEdit: (cred: VaultCredential) => void;
    onDelete: (id: string) => void;
}

export function CredentialCard({ credential, onEdit, onDelete }: CredentialCardProps) {
    const [copied, setCopied] = useState<"username" | "password" | null>(null);
    const [showMenu, setShowMenu] = useState(false);

    const handleCopy = async (type: "username" | "password") => {
        try {
            await navigator.clipboard.writeText(credential.decrypted[type]);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    return (
        <div className="glass p-5 rounded-xl border border-border/50 hover:border-brand/40 transition-all group flex flex-col justify-between h-full relative">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold text-lg">
                            {credential.decrypted.site_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-foreground font-semibold leading-tight line-clamp-1">{credential.decrypted.site_name}</h3>
                            <span className="text-xs text-secondary/70 uppercase tracking-wider">{credential.category}</span>
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1.5 text-secondary hover:text-foreground hover:bg-white/5 rounded-md transition-colors"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-1 w-32 glass border border-border rounded-lg shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                                    <button
                                        onClick={() => { setShowMenu(false); onEdit(credential); }}
                                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-white/10 flex items-center gap-2 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4 text-secondary" /> Edit
                                    </button>
                                    <button
                                        onClick={() => { setShowMenu(false); onDelete(credential.id); }}
                                        className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 flex items-center gap-2 transition-colors border-t border-border/50"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                {credential.category === "secure_note" ? (
                    <div className="space-y-2 mb-4 flex-1">
                        <div className="text-sm text-secondary bg-background/30 rounded-md p-3 border border-border/30 h-full max-h-32 overflow-hidden relative">
                            <p className="whitespace-pre-wrap font-mono text-xs">{credential.decrypted.notes || "No content"}</p>
                            {credential.decrypted.notes && credential.decrypted.notes.length > 100 && (
                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/80 to-transparent" />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm bg-background/40 hover:bg-background/80 rounded-md p-2 transition-colors border border-transparent hover:border-border/50">
                            <span className="text-secondary truncate mr-2" title={credential.decrypted.username}>
                                {credential.decrypted.username}
                            </span>
                            <button
                                onClick={() => handleCopy("username")}
                                className="text-secondary hover:text-brand transition-colors p-1"
                                title="Copy Username"
                            >
                                {copied === "username" ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between text-sm bg-background/40 hover:bg-background/80 rounded-md p-2 transition-colors border border-transparent hover:border-border/50">
                            <div className="text-secondary font-mono tracking-widest flex items-center gap-2">
                                <KeyRound className="w-3.5 h-3.5" />
                                ••••••••
                            </div>
                            <button
                                onClick={() => handleCopy("password")}
                                className="text-secondary hover:text-success transition-colors p-1"
                                title="Copy Password safely"
                            >
                                {copied === "password" ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Metadata */}
            <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center text-xs text-secondary/60">
                <div className="flex items-center gap-2">
                    <span>Updated: {new Date(credential.updated_at).toLocaleDateString()}</span>
                    {credential.expiration_status === "expired" && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-error/10 text-error border border-error/20 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Expired
                        </span>
                    )}
                    {credential.expiration_status === "expiring_soon" && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#eab308]/10 text-[#eab308] border border-[#eab308]/20 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Expiring
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    {credential.category !== "secure_note" && (() => {
                        const pw = credential.decrypted.password;
                        const strength = pw.length >= 16 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)
                            ? "strong" : pw.length >= 10 ? "fair" : "weak";
                        const colors = { strong: "bg-success", fair: "bg-[#eab308]", weak: "bg-error" };
                        return <span className={`w-2 h-2 rounded-full ${colors[strength]}`} title={`Password: ${strength}`} />;
                    })()}
                    {credential.is_favorite && <span className="text-brand">★</span>}
                </div>
            </div>

        </div>
    );
}
