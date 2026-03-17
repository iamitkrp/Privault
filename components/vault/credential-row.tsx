"use client";

import { useState, useRef, useEffect } from "react";
import { Copy, Check, MoreVertical, Edit2, Trash2, KeyRound, Clock } from "lucide-react";
import { VaultCredential } from "@/types";
import { SESSION_CONFIG } from "@/constants";

interface CredentialRowProps {
    credential: VaultCredential;
    onEdit: (cred: VaultCredential) => void;
    onDelete: (id: string) => void;
}

export function CredentialRow({ credential, onEdit, onDelete }: CredentialRowProps) {
    const [copied, setCopied] = useState<"username" | "password" | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const clipboardClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
            if (clipboardClearTimer.current) clearTimeout(clipboardClearTimer.current);
            clipboardClearTimer.current = setTimeout(
                () => navigator.clipboard.writeText('').catch(() => { }),
                SESSION_CONFIG.clipboardClearMs
            );
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    const getStrength = () => {
        if (credential.category === "secure_note") return null;
        const pw = credential.decrypted.password;
        if (pw.length >= 16 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) return "strong";
        if (pw.length >= 10) return "fair";
        return "weak";
    };

    const strength = getStrength();
    const strengthColors = { strong: "bg-green-500", fair: "bg-yellow-500", weak: "bg-red-500" };

    const isNote = credential.category === "secure_note";

    return (
        <div className="group relative bg-bg-secondary hover:bg-bg-tertiary transition-all duration-200 overflow-hidden">
            {/* Corner accent */}
            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-border-secondary group-hover:border-success transition-colors duration-300" />

            <div className="flex items-center gap-4 px-5 py-4">
                {/* Icon / Initial */}
                <div className="shrink-0 w-9 h-9 border border-border-secondary group-hover:border-border bg-background flex items-center justify-center text-fg-muted group-hover:text-foreground transition-all duration-300 mono text-sm font-bold">
                    {credential.decrypted.site_name.charAt(0).toUpperCase()}
                </div>

                {/* Site Name + Category */}
                <div className="min-w-[120px] w-[180px] shrink-0">
                    <h3 className="text-foreground text-sm font-bold leading-tight truncate tracking-wide">
                        {credential.decrypted.site_name}
                    </h3>
                    <span className="mono text-[9px] text-fg-muted uppercase tracking-widest">
                        {credential.category}
                    </span>
                </div>

                {/* Username & Password */}
                {!isNote ? (
                    <div className="flex-1 min-w-0 flex items-center gap-6">
                        {/* Username */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-fg-secondary text-xs truncate mono" title={credential.decrypted.username}>
                                {credential.decrypted.username}
                            </span>
                            <button
                                onClick={() => handleCopy("username")}
                                className="shrink-0 text-fg-secondary hover:text-foreground transition-colors"
                                title="Copy Username"
                            >
                                {copied === "username" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                        </div>

                        {/* Password */}
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="text-fg-muted font-mono tracking-widest flex items-center gap-2 text-xs">
                                <KeyRound className="w-3 h-3" />
                                ••••••••
                            </div>
                            <button
                                onClick={() => handleCopy("password")}
                                className="shrink-0 text-fg-secondary hover:text-foreground transition-colors"
                                title="Copy Password"
                            >
                                {copied === "password" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 min-w-0">
                        <p className="text-fg-muted text-xs mono truncate">
                            {credential.decrypted.notes || "No content"}
                        </p>
                    </div>
                )}

                {/* Status indicators */}
                <div className="hidden md:flex items-center gap-3 shrink-0">
                    {/* Strength dot */}
                    {strength && (
                        <span
                            className={`w-1.5 h-1.5 ${strengthColors[strength]}`}
                            title={`Password: ${strength}`}
                        />
                    )}

                    {/* Expiration */}
                    {credential.expiration_status === "expired" && (
                        <span className="text-red-500 flex items-center gap-1 border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 mono text-[9px] uppercase tracking-widest">
                            <Clock className="w-2.5 h-2.5" /> EXP
                        </span>
                    )}
                    {credential.expiration_status === "expiring_soon" && (
                        <span className="text-yellow-500 flex items-center gap-1 border border-yellow-500/20 bg-yellow-500/10 px-1.5 py-0.5 mono text-[9px] uppercase tracking-widest">
                            <Clock className="w-2.5 h-2.5" /> SOON
                        </span>
                    )}

                    {/* Date */}
                    <span className="mono text-[9px] text-fg-secondary uppercase tracking-widest hidden xl:block">
                        {new Date(credential.updated_at).toLocaleDateString()}
                    </span>
                </div>

                {/* Actions menu */}
                <div className="relative shrink-0">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1.5 text-fg-secondary hover:text-foreground transition-colors"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-32 bg-background border border-border shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                                <button
                                    onClick={() => { setShowMenu(false); onEdit(credential); }}
                                    className="w-full text-left px-3 py-2.5 text-[10px] mono uppercase tracking-widest text-fg-secondary hover:bg-foreground/5 hover:text-foreground flex items-center gap-2.5 transition-colors"
                                >
                                    <Edit2 className="w-3 h-3" /> Edit
                                </button>
                                <button
                                    onClick={() => { setShowMenu(false); onDelete(credential.id); }}
                                    className="w-full text-left px-3 py-2.5 text-[10px] mono uppercase tracking-widest text-red-500/80 hover:bg-red-500/10 hover:text-red-500 flex items-center gap-2.5 transition-colors border-t border-border"
                                >
                                    <Trash2 className="w-3 h-3" /> Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
