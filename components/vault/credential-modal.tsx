"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check, X, ShieldAlert } from "lucide-react";
import { VaultCredential, DecryptedCredential } from "@/types";
import { PasswordGenerator } from "./password-generator";

interface CredentialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (decrypted: DecryptedCredential, metadata: Record<string, unknown>) => Promise<void>;
    existingCredential?: VaultCredential;
}

export function CredentialModal({ isOpen, onClose, onSave, existingCredential }: CredentialModalProps) {
    const isEditing = !!existingCredential;

    const [siteName, setSiteName] = useState(existingCredential?.decrypted.site_name || "");
    const [username, setUsername] = useState(existingCredential?.decrypted.username || "");
    const [password, setPassword] = useState(existingCredential?.decrypted.password || "");
    const [url, setUrl] = useState(existingCredential?.decrypted.url || "");
    const [notes, setNotes] = useState(existingCredential?.decrypted.notes || "");
    const [category, setCategory] = useState(existingCredential?.category || "other");
    const [expirationDays, setExpirationDays] = useState<string>(() =>
        existingCredential?.expires_at
            ? String(Math.round((new Date(existingCredential.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            : "0"
    );

    // Type selection: "login" or "secure_note"
    // We derive initial state based on the category. If it was explicitly a secure_note, default to that tab.
    const [type, setType] = useState<"login" | "secure_note">(
        existingCredential?.category === "secure_note" ? "secure_note" : "login"
    );

    const [showPassword, setShowPassword] = useState(false);
    const [showGenerator, setShowGenerator] = useState(!isEditing);
    const [copied, setCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Escape listener
    if (!isOpen) return null;

    const copyPassword = async () => {
        if (!password) return;
        try {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const decrypted: DecryptedCredential = {
                site_name: siteName,
                username: type === "login" ? username : "",
                password: type === "login" ? password : "",
                url: type === "login" && url ? url : undefined,
                notes: notes || undefined
            };

            const expiresAt = expirationDays !== "0"
                ? new Date(Date.now() + parseInt(expirationDays) * 24 * 60 * 60 * 1000).toISOString()
                : null;

            const metadata = {
                category: type === "secure_note" ? "secure_note" : category,
                expires_at: expiresAt,
            };

            await onSave(decrypted, metadata);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to save credential");
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-bg-secondary w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-border flex flex-col max-h-[90vh] relative overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border relative z-10">
                    <h2 className="mono text-xs font-bold uppercase tracking-widest text-foreground">
                        {isEditing ? "Edit Credential" : "Add to Vault"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-foreground/5 text-fg-muted hover:text-foreground transition-colors focus:outline-none"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-6 flex-1 custom-scrollbar relative z-10">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 flex gap-3 items-start text-red-500 text-xs mono">
                            <ShieldAlert className="w-4 h-4 shrink-0" />
                            <p className="uppercase tracking-widest">{error}</p>
                        </div>
                    )}

                    <form id="cred-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Type Tabs */}
                        {!isEditing && (
                            <div className="flex border border-border bg-bg-secondary p-1">
                                <button
                                    type="button"
                                    onClick={() => setType("login")}
                                    className={`flex-1 py-2 text-[10px] mono uppercase tracking-widest font-bold transition-colors ${type === "login" ? "bg-foreground text-background" : "text-fg-muted hover:text-foreground"}`}
                                >
                                    Login
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType("secure_note")}
                                    className={`flex-1 py-2 text-[10px] mono uppercase tracking-widest font-bold transition-colors ${type === "secure_note" ? "bg-foreground text-background" : "text-fg-muted hover:text-foreground"}`}
                                >
                                    Secure Note
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className={`space-y-2 ${type === "secure_note" ? "col-span-2" : "col-span-2 md:col-span-1"}`}>
                                <label className="mono text-[10px] tracking-widest text-fg-muted uppercase">
                                    {type === "secure_note" ? "Note Title" : "Service Name"} <span className="text-error">*</span>
                                </label>
                                <input
                                    type="text" required autoFocus
                                    value={siteName} onChange={e => setSiteName(e.target.value)}
                                    className="w-full h-12 bg-background/60 border border-border px-4 text-foreground mono focus:border-foreground focus:outline-none transition-colors placeholder:text-fg-secondary text-sm"
                                    placeholder="e.g. GitHub"
                                />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="mono text-[10px] tracking-widest text-fg-muted uppercase">Category</label>
                                <select
                                    value={category} onChange={e => setCategory(e.target.value as VaultCredential['category'])}
                                    className="w-full h-12 bg-bg-secondary border border-border px-4 text-foreground mono focus:border-foreground focus:outline-none transition-colors text-sm appearance-none"
                                >
                                    <option value="other">General / Other</option>
                                    <option value="work">Work</option>
                                    <option value="social">Social</option>
                                    <option value="finance">Finance</option>
                                    <option value="shopping">Shopping</option>
                                </select>
                            </div>
                        </div>

                        {/* Expiration */}
                        {type === "login" && (
                            <div className="space-y-2">
                                <label className="mono text-[10px] tracking-widest text-fg-muted uppercase">Password Expiration</label>
                                <select
                                    value={expirationDays}
                                    onChange={e => setExpirationDays(e.target.value)}
                                    className="w-full h-12 bg-bg-secondary border border-border px-4 text-foreground mono focus:border-foreground focus:outline-none transition-colors text-sm appearance-none"
                                >
                                    <option value="0">Never</option>
                                    <option value="30">30 days</option>
                                    <option value="60">60 days</option>
                                    <option value="90">90 days</option>
                                    <option value="180">180 days</option>
                                    <option value="365">1 year</option>
                                </select>
                            </div>
                        )}

                        {type === "login" && (
                            <>
                                <div className="space-y-2">
                                    <label className="mono text-[10px] tracking-widest text-fg-muted uppercase">Username / Email <span className="text-error">*</span></label>
                                    <input
                                        type="text" required spellCheck="false"
                                        value={username} onChange={e => setUsername(e.target.value)}
                                        className="w-full h-12 bg-background/60 border border-border px-4 text-foreground mono focus:border-foreground focus:outline-none transition-colors placeholder:text-fg-secondary text-sm"
                                        placeholder="admin"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-end mb-1">
                                        <label className="mono text-[10px] tracking-widest text-fg-muted uppercase">Password <span className="text-error">*</span></label>
                                        <button type="button" onClick={() => setShowGenerator(!showGenerator)} className="mono text-[10px] tracking-widest text-fg-muted hover:text-foreground uppercase transition-colors focus:outline-none decoration-transparent">
                                            {showGenerator ? "Hide Generator" : "Generate"}
                                        </button>
                                    </div>

                                    <div className="relative flex items-center">
                                        <input
                                            type={showPassword ? "text" : "password"} required spellCheck="false"
                                            value={password} onChange={e => setPassword(e.target.value)}
                                            className="w-full h-12 bg-background/60 border border-border pl-4 pr-20 text-foreground mono focus:border-foreground focus:outline-none transition-colors placeholder:text-fg-secondary text-sm"
                                        />
                                        <div className="absolute right-2 flex gap-1 bg-bg-secondary px-1">
                                            <button
                                                type="button" tabIndex={-1}
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="p-1.5 text-fg-muted hover:text-foreground transition-colors focus:outline-none"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button
                                                type="button" tabIndex={-1}
                                                onClick={copyPassword}
                                                className="p-1.5 text-fg-muted hover:text-success transition-colors focus:outline-none"
                                            >
                                                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {showGenerator && (
                                    <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <PasswordGenerator
                                            onSelectPattern={(generated, userInitiated) => {
                                                setPassword((prev) => {
                                                    if (userInitiated || !prev) return generated;
                                                    return prev;
                                                });
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="mono text-[10px] tracking-widest text-fg-muted uppercase">Website URL</label>
                                    <input
                                        type="url" placeholder="https://"
                                        value={url} onChange={e => setUrl(e.target.value)}
                                        className="w-full h-12 bg-background/60 border border-border px-4 text-foreground mono focus:border-foreground focus:outline-none transition-colors placeholder:text-fg-secondary text-sm"
                                    />
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <label className="mono text-[10px] tracking-widest text-fg-muted uppercase">
                                {type === "secure_note" ? "Secure Note Content" : "Additional Notes"}
                                {type === "secure_note" && <span className="text-error ml-1">*</span>}
                            </label>
                            <textarea
                                rows={type === "secure_note" ? 10 : 3}
                                required={type === "secure_note"}
                                value={notes} onChange={e => setNotes(e.target.value)}
                                className="w-full bg-background/60 border border-border px-4 py-3 text-foreground mono focus:border-foreground focus:outline-none transition-colors placeholder:text-fg-secondary text-sm resize-none"
                                placeholder="..."
                            />
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-bg-secondary flex gap-4 justify-end items-center relative z-10">
                    <button
                        type="button" onClick={onClose} disabled={isSaving}
                        className="mono text-[10px] uppercase tracking-widest font-bold text-fg-muted hover:text-foreground transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        form="cred-form" type="submit"
                        disabled={isSaving || !siteName || (type === "login" && (!username || !password)) || (type === "secure_note" && !notes)}
                        className="h-12 px-8 bg-foreground hover:opacity-90 text-background mono text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 group disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {isSaving ? (
                            <>
                                <span className="w-3 h-3 border-2 border-background/30 border-t-background rounded-full animate-spin block" />
                                {isEditing ? "Updating" : "Encrypting"}
                            </>
                        ) : (isEditing ? "Update" : "Save Securely")}
                    </button>
                </div>
            </div>
        </div>
    );
}
