"use client";

import { useState, useRef, useEffect } from "react";
import { Copy, Check, MoreVertical, Edit2, Trash2, KeyRound, Clock } from "lucide-react";
import { VaultCredential } from "@/types";
import { SESSION_CONFIG } from "@/constants";

interface CredentialCardProps {
    credential: VaultCredential;
    onEdit: (cred: VaultCredential) => void;
    onDelete: (id: string) => void;
}

export function CredentialCard({ credential, onEdit, onDelete }: CredentialCardProps) {
    const [copied, setCopied] = useState<"username" | "password" | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const clipboardClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup pending clipboard-clear timer on unmount
    useEffect(() => {
        return () => {
            if (clipboardClearTimer.current) clearTimeout(clipboardClearTimer.current);
        };
    }, []);

    const handleCopy = async (type: "username" | "password") => {
        try {
            await navigator.clipboard.writeText(credential.decrypted[type]);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
            // Reset clipboard-clear timer so the latest copy gets the full retention window
            if (clipboardClearTimer.current) clearTimeout(clipboardClearTimer.current);
            clipboardClearTimer.current = setTimeout(
                () => navigator.clipboard.writeText('').catch(() => { }),
                SESSION_CONFIG.clipboardClearMs
            );
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    return (
        <div className="bg-[#0A0A0A] border border-[#222] hover:border-white/20 p-5 transition-all group flex flex-col justify-between h-full relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-white font-mono font-bold text-lg group-hover:border-white/30 transition-colors">
                            {credential.decrypted.site_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-white font-bold leading-tight line-clamp-1 tracking-wide">{credential.decrypted.site_name}</h3>
                            <span className="mono text-[10px] text-gray-500 uppercase tracking-widest">{credential.category}</span>
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1.5 text-gray-500 hover:text-white transition-colors"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-36 bg-[#0A0A0A] border border-[#222] shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                                    <button
                                        onClick={() => { setShowMenu(false); onEdit(credential); }}
                                        className="w-full text-left px-4 py-3 text-xs mono uppercase tracking-widest text-gray-400 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button
                                        onClick={() => { setShowMenu(false); onDelete(credential.id); }}
                                        className="w-full text-left px-4 py-3 text-xs mono uppercase tracking-widest text-red-500/80 hover:bg-red-500/10 hover:text-red-500 flex items-center gap-3 transition-colors border-t border-[#222]"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                {credential.category === "secure_note" ? (
                    <div className="space-y-2 mb-4 flex-1">
                        <div className="text-sm text-gray-400 bg-white/5 p-3 h-full max-h-32 overflow-hidden relative border border-white/5">
                            <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed">{credential.decrypted.notes || "No content"}</p>
                            {credential.decrypted.notes && credential.decrypted.notes.length > 100 && (
                                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 mb-4">
                        <div className="flex items-center justify-between text-sm group/item">
                            <span className="text-gray-400 truncate mr-2 tracking-wide text-xs" title={credential.decrypted.username}>
                                {credential.decrypted.username}
                            </span>
                            <button
                                onClick={() => handleCopy("username")}
                                className="text-gray-600 hover:text-white transition-colors"
                                title="Copy Username"
                            >
                                {copied === "username" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between text-sm group/item">
                            <div className="text-gray-500 font-mono tracking-widest flex items-center gap-3 text-xs">
                                <KeyRound className="w-3 h-3" />
                                ••••••••
                            </div>
                            <button
                                onClick={() => handleCopy("password")}
                                className="text-gray-600 hover:text-white transition-colors"
                                title="Copy Password safely"
                            >
                                {copied === "password" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Metadata */}
            <div className="mt-6 pt-4 border-t border-[#222] flex justify-between items-center text-[10px] mono text-gray-500 uppercase tracking-widest relative z-10">
                <div className="flex items-center gap-3">
                    <span>Updated: {new Date(credential.updated_at).toLocaleDateString()}</span>
                    {credential.expiration_status === "expired" && (
                        <span className="text-red-500 flex items-center gap-1.5 border border-red-500/20 bg-red-500/10 px-2 py-0.5">
                            <Clock className="w-3 h-3" /> Expired
                        </span>
                    )}
                    {credential.expiration_status === "expiring_soon" && (
                        <span className="text-yellow-500 flex items-center gap-1.5 border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5">
                            <Clock className="w-3 h-3" /> Expiring
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {credential.category !== "secure_note" && (() => {
                        const pw = credential.decrypted.password;
                        const strength = pw.length >= 16 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)
                            ? "strong" : pw.length >= 10 ? "fair" : "weak";
                        const colors = { strong: "bg-green-500", fair: "bg-yellow-500", weak: "bg-red-500" };
                        return <span className={`w-1.5 h-1.5 rounded-full ${colors[strength]}`} title={`Password: ${strength}`} />;
                    })()}
                    {credential.is_favorite && <span className="text-white">★</span>}
                </div>
            </div>

        </div>
    );
}
