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
            <div className="glass w-full max-w-lg rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/50">
                    <h2 className="text-xl font-semibold text-foreground">
                        {isEditing ? "Edit Credential" : "Add to Vault"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/5 text-secondary transition-colors focus:outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/20 flex gap-3 items-start text-error text-sm">
                            <ShieldAlert className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form id="cred-form" onSubmit={handleSubmit} className="space-y-5">

                        {/* Type Tabs */}
                        {!isEditing && (
                            <div className="flex bg-background/50 border border-border rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => setType("login")}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${type === "login" ? "bg-white/10 text-foreground shadow-sm" : "text-secondary hover:text-foreground"}`}
                                >
                                    Login
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType("secure_note")}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${type === "secure_note" ? "bg-white/10 text-foreground shadow-sm" : "text-secondary hover:text-foreground"}`}
                                >
                                    Secure Note
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className={`space-y-1.5 ${type === "secure_note" ? "col-span-2" : "col-span-2 md:col-span-1"}`}>
                                <label className="text-sm font-medium text-secondary">
                                    {type === "secure_note" ? "Note Title" : "Service / Site Name"} <span className="text-error">*</span>
                                </label>
                                <input
                                    type="text" required autoFocus
                                    value={siteName} onChange={e => setSiteName(e.target.value)}
                                    className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-1 focus:ring-brand focus:border-brand"
                                    placeholder="e.g. Google, GitHub"
                                />
                            </div>
                            <div className="space-y-1.5 col-span-2 md:col-span-1">
                                <label className="text-sm font-medium text-secondary">Category</label>
                                <select
                                    value={category} onChange={e => setCategory(e.target.value as VaultCredential['category'])}
                                    className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-1 focus:ring-brand focus:border-brand appearance-none"
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
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-secondary">Password Expiration</label>
                                <select
                                    value={expirationDays}
                                    onChange={e => setExpirationDays(e.target.value)}
                                    className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-1 focus:ring-brand focus:border-brand appearance-none"
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
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-secondary">Username / Email <span className="text-error">*</span></label>
                                    <input
                                        type="text" required spellCheck="false"
                                        value={username} onChange={e => setUsername(e.target.value)}
                                        className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-1 focus:ring-brand focus:border-brand"
                                        placeholder="name@example.com"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-end">
                                        <label className="text-sm font-medium text-secondary">Password <span className="text-error">*</span></label>
                                        <button type="button" onClick={() => setShowGenerator(!showGenerator)} className="text-xs text-brand hover:text-brand-hover hover:underline transition-colors focus:outline-none">
                                            {showGenerator ? "Hide Generator" : "Generate Secure Password"}
                                        </button>
                                    </div>

                                    <div className="relative flex items-center">
                                        <input
                                            type={showPassword ? "text" : "password"} required spellCheck="false"
                                            value={password} onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-background/50 border border-border rounded-lg pl-3 pr-20 py-2 text-foreground focus:ring-1 focus:ring-brand focus:border-brand font-mono"
                                        />
                                        <div className="absolute right-2 flex gap-1 bg-background/50 backdrop-blur-sm rounded px-1">
                                            <button
                                                type="button" tabIndex={-1}
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="p-1.5 text-secondary hover:text-foreground transition-colors rounded focus:outline-none"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button
                                                type="button" tabIndex={-1}
                                                onClick={copyPassword}
                                                className="p-1.5 text-secondary hover:text-success transition-colors rounded focus:outline-none"
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
                                                    // Only auto-update the password field if explicitly triggered by the user (button/slider)
                                                    // OR if the field is currently completely empty on mount.
                                                    if (userInitiated || !prev) {
                                                        return generated;
                                                    }
                                                    // Otherwise, preserve the existing password (e.g. they opened generator while editing)
                                                    return prev;
                                                });
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-secondary">Website URL</label>
                                    <input
                                        type="url" placeholder="https://"
                                        value={url} onChange={e => setUrl(e.target.value)}
                                        className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-1 focus:ring-brand focus:border-brand"
                                    />
                                </div>
                            </>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-secondary">
                                {type === "secure_note" ? "Secure Note Content" : "Additional Notes"}
                                {type === "secure_note" && <span className="text-error ml-1">*</span>}
                            </label>
                            <textarea
                                rows={type === "secure_note" ? 10 : 3}
                                required={type === "secure_note"}
                                value={notes} onChange={e => setNotes(e.target.value)}
                                className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-foreground focus:ring-1 focus:ring-brand focus:border-brand resize-none"
                                placeholder="Any additional recovery codes or notes..."
                            />
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border/50 bg-white/5 flex gap-3 justify-end rounded-b-2xl">
                    <button
                        type="button" onClick={onClose} disabled={isSaving}
                        className="px-6 py-2 rounded-lg font-medium text-secondary hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        form="cred-form" type="submit"
                        disabled={isSaving || !siteName || (type === "login" && (!username || !password)) || (type === "secure_note" && !notes)}
                        className="px-6 py-2 rounded-lg font-semibold bg-brand text-brand-foreground hover:bg-brand-hover hover:scale-105 active:scale-95 transition-all shadow-glow disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <span className="w-4 h-4 border-2 border-brand-foreground/30 border-t-brand-foreground rounded-full animate-spin block" />
                                {isEditing ? "Updating..." : "Encrypting..."}
                            </>
                        ) : (isEditing ? "Update securely" : "Save securely")}
                    </button>
                </div>
            </div >
        </div >
    );
}
