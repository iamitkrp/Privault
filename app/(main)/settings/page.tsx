"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { VaultService } from "@/services/vault.service";
import { Settings, KeyRound, Shield, LogOut, Eye, EyeOff, Check, AlertTriangle, Loader2, Download, Upload, FileText, Lock, X } from "lucide-react";
import { exportToJSON, exportToCSV, exportToEncryptedJSON } from "@/services/export.service";
import { parseJSON, parseCSV, ImportResult } from "@/services/import.service";

export default function SettingsPage() {
    return (
        <div className="space-y-8 p-6 md:p-12 pt-24">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-3 mono uppercase tracking-widest">
                    <Settings className="w-7 h-7 text-success" />
                    Settings
                </h1>
                <p className="text-fg-secondary mt-1">Manage your vault security and account preferences.</p>
            </div>

            {/* Settings Sections */}
            <div className="space-y-6">
                <ChangeMasterPasswordSection />
                <ExportDataSection />
                <ImportDataSection />
                <DangerZoneSection />
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────
   Change Master Password Section
   ────────────────────────────────────────────────────────── */
function ChangeMasterPasswordSection() {
    const { user, profile, supabaseClient } = useAuth();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    // Clear passwords from state on unmount
    useEffect(() => {
        return () => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        };
    }, []);

    const isFormValid =
        currentPassword.length >= 1 &&
        newPassword.length >= 8 &&
        newPassword === confirmPassword &&
        newPassword !== currentPassword;

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid || !user || !profile?.salt) return;

        setStatus("loading");
        setMessage("");

        try {
            const vaultService = new VaultService(supabaseClient);

            const result = await vaultService.rotateMasterPassword(
                user.id,
                currentPassword,
                newPassword,
                profile.salt,
                profile.vault_verification_data,
                profile.kdf_iterations
            );

            if (!result.success) {
                setStatus("error");
                setMessage(result.error?.message || "Password change failed.");
                return;
            }

            setStatus("success");
            setMessage("Master password changed successfully! All credentials have been re-encrypted.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setStatus("error");
            setMessage("An unexpected error occurred.");
            console.error(err);
        }
    };

    const passwordStrength = (() => {
        if (newPassword.length === 0) return null;
        if (newPassword.length < 8) return { label: "Too short", color: "text-error", bar: "w-1/5 bg-error" };
        if (newPassword.length < 12) return { label: "Fair", color: "text-warning", bar: "w-2/5 bg-warning" };
        if (newPassword.length < 16) return { label: "Good", color: "text-success", bar: "w-3/5 bg-success" };
        return { label: "Strong", color: "text-success", bar: "w-full bg-success" };
    })();

    return (
        <section className="bg-bg-secondary border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 border border-success/20 flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-success" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-foreground mono uppercase tracking-wider">Change Master Password</h2>
                    <p className="text-sm text-fg-secondary">All stored credentials will be re-encrypted with your new password.</p>
                </div>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-5">
                {/* Current Password */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-fg-secondary">Current Master Password</label>
                    <div className="relative">
                        <input
                            type={showCurrent ? "text" : "password"}
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            className="w-full bg-bg-tertiary border border-border-secondary px-3 pr-10 py-2.5 text-foreground focus:ring-1 focus:ring-success focus:border-success font-mono outline-none"
                            placeholder="Enter your current master password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-secondary hover:text-foreground transition-colors"
                        >
                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-fg-secondary">New Master Password</label>
                    <div className="relative">
                        <input
                            type={showNew ? "text" : "password"}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full bg-bg-tertiary border border-border-secondary px-3 pr-10 py-2.5 text-foreground focus:ring-1 focus:ring-success focus:border-success font-mono outline-none"
                            placeholder="Minimum 8 characters"
                            required
                            minLength={8}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-secondary hover:text-foreground transition-colors"
                        >
                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {/* Strength Meter */}
                    {passwordStrength && (
                        <div className="space-y-1">
                            <div className="h-1.5 w-full bg-border overflow-hidden">
                                <div className={`h-full transition-all duration-300 ${passwordStrength.bar}`} />
                            </div>
                            <p className={`text-xs ${passwordStrength.color}`}>{passwordStrength.label}</p>
                        </div>
                    )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-fg-secondary">Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className={`w-full bg-bg-tertiary border px-3 py-2.5 text-foreground focus:ring-1 focus:ring-success focus:border-success font-mono outline-none ${confirmPassword && confirmPassword !== newPassword ? "border-error" : "border-border-secondary"}`}
                        placeholder="Re-enter the new password"
                        required
                    />
                    {confirmPassword && confirmPassword !== newPassword && (
                        <p className="text-xs text-error">Passwords do not match.</p>
                    )}
                </div>

                {/* Status Message */}
                {message && (
                    <div className={`flex items-center gap-2 p-3 text-sm ${status === "success" ? "bg-success/10 text-success border border-success/20" : "bg-error/10 text-error border border-error/20"}`}>
                        {status === "success" ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                        {message}
                    </div>
                )}

                {/* Warning */}
                <div className="flex items-start gap-2 p-3 bg-warning/5 border border-warning/20 text-warning text-sm">
                    <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>This will re-encrypt <strong>all</strong> your stored credentials. Make sure you remember your new password — there is no recovery option.</span>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={!isFormValid || status === "loading"}
                    className="w-full py-3 font-semibold bg-foreground text-background hover:opacity-90 transition-all shadow-[0_0_15px_rgba(var(--success),0.4)] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mono uppercase tracking-widest text-sm"
                >
                    {status === "loading" ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Re-encrypting credentials...
                        </>
                    ) : (
                        <>
                            <KeyRound className="w-4 h-4" />
                            Change Master Password
                        </>
                    )}
                </button>
            </form>
        </section>
    );
}

/* ──────────────────────────────────────────────────────────
   Export Data Section
   ────────────────────────────────────────────────────────── */
function ExportDataSection() {
    const { supabaseClient } = useAuth();
    const [exportStatus, setExportStatus] = useState("");
    const [exportStatusType, setExportStatusType] = useState<"idle" | "success" | "error">("idle");
    const [warningDismissed, setWarningDismissed] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingFormat, setPendingFormat] = useState<"json" | "csv" | "encrypted-json" | null>(null);
    const [exportPassphrase, setExportPassphrase] = useState("");
    const [confirmExportPassphrase, setConfirmExportPassphrase] = useState("");
    const [showPassphrase, setShowPassphrase] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!pendingFormat) return;
        setIsExporting(true);
        setExportStatus("");
        setExportStatusType("idle");

        try {
            const vaultService = new VaultService(supabaseClient);
            const result = await vaultService.getCredentials();

            if (!result.success || !result.data) {
                setExportStatus("Failed to fetch credentials for export.");
                setExportStatusType("error");
                setIsExporting(false);
                return;
            }

            if (pendingFormat === "encrypted-json") {
                await exportToEncryptedJSON(result.data, exportPassphrase);
            } else if (pendingFormat === "json") {
                exportToJSON(result.data);
            } else {
                exportToCSV(result.data);
            }

            setExportStatus(`Exported ${result.data.length} credentials successfully.`);
            setExportStatusType("success");
            setTimeout(() => {
                setExportStatus("");
                setExportStatusType("idle");
            }, 3000);

            // Cleanup
            setShowConfirmDialog(false);
            setPendingFormat(null);
            setExportPassphrase("");
            setConfirmExportPassphrase("");
        } catch (e) {
            setExportStatus("Export failed.");
            setExportStatusType("error");
            console.error(e);
        } finally {
            setIsExporting(false);
        }
    };

    const cancelExport = () => {
        setShowConfirmDialog(false);
        setPendingFormat(null);
        setExportPassphrase("");
        setConfirmExportPassphrase("");
    };

    return (
        <section className="bg-bg-secondary border border-border overflow-hidden relative">
            <div className="p-6 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 border border-success/20 flex items-center justify-center">
                    <Download className="w-5 h-5 text-success" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-foreground mono uppercase tracking-wider">Export Data</h2>
                    <p className="text-sm text-fg-secondary">Download your vault data to your device.</p>
                </div>
            </div>
            <div className="p-6 space-y-4">
                {!warningDismissed && (
                    <div className="flex items-start justify-between gap-3 p-4 bg-warning/5 border border-warning/20 text-warning text-sm">
                        <div className="flex gap-3">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold mb-1">Security Warning</p>
                                <p className="text-warning/90">
                                    Plaintext exports contain your UNENCRYPTED passwords in a readable file. Anyone with access to this file can read all your passwords. Use &quot;Export Encrypted JSON&quot; to protect the file with a passphrase.
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setWarningDismissed(true)} className="text-warning hover:text-warning/80 transition-colors p-1" title="Dismiss">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                        onClick={() => { setPendingFormat("json"); setShowConfirmDialog(true); }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-bg-tertiary border border-border hover:bg-foreground/5 text-foreground transition-colors text-sm font-medium mono uppercase tracking-widest"
                    >
                        <FileText className="w-4 h-4 text-fg-secondary" />
                        JSON (Plain)
                    </button>
                    <button
                        onClick={() => { setPendingFormat("csv"); setShowConfirmDialog(true); }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-bg-tertiary border border-border hover:bg-foreground/5 text-foreground transition-colors text-sm font-medium mono uppercase tracking-widest"
                    >
                        <FileText className="w-4 h-4 text-fg-secondary" />
                        CSV (Plain)
                    </button>
                    <button
                        onClick={() => { setPendingFormat("encrypted-json"); setShowConfirmDialog(true); }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background hover:opacity-90 transition-colors text-sm font-medium shadow-[0_0_15px_rgba(var(--success),0.4)] mono uppercase tracking-widest"
                    >
                        <Lock className="w-4 h-4" />
                        Encrypted JSON
                    </button>
                </div>

                {exportStatusType !== "idle" && (
                    <p className={`text-sm flex items-center gap-1.5 ${exportStatusType === 'error' ? 'text-error' : 'text-success'}`}>
                        {exportStatusType === 'error' ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />} {exportStatus}
                    </p>
                )}

                {/* Confirmation Dialog Overlay */}
                {showConfirmDialog && (
                    <div className="mt-4 p-5 border border-border bg-bg-tertiary space-y-4">
                        {pendingFormat === "encrypted-json" ? (
                            <>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1 mono uppercase tracking-widest">
                                        <Lock className="w-4 h-4 text-success" /> Encrypted Export
                                    </h3>
                                    <p className="text-xs text-fg-secondary">
                                        Choose a strong passphrase to encrypt your exported file. You will need this to import or decrypt the file later.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type={showPassphrase ? "text" : "password"}
                                            value={exportPassphrase}
                                            onChange={e => setExportPassphrase(e.target.value)}
                                            placeholder="Export Passphrase (min 8 chars)"
                                            className="w-full bg-background border border-border-secondary px-3 pr-10 py-2.5 text-foreground focus:ring-1 focus:ring-success focus:border-success text-sm font-mono outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassphrase(!showPassphrase)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-secondary hover:text-foreground transition-colors"
                                        >
                                            {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <input
                                        type="password"
                                        value={confirmExportPassphrase}
                                        onChange={e => setConfirmExportPassphrase(e.target.value)}
                                        placeholder="Confirm Passphrase"
                                        className={`w-full bg-background border px-3 py-2.5 text-foreground focus:ring-1 focus:ring-success focus:border-success text-sm font-mono outline-none ${confirmExportPassphrase && confirmExportPassphrase !== exportPassphrase ? "border-error" : "border-border-secondary"}`}
                                    />
                                    {confirmExportPassphrase && confirmExportPassphrase !== exportPassphrase && (
                                        <p className="text-xs text-error">Passphrases do not match.</p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button onClick={cancelExport} className="px-4 py-2 text-sm font-medium bg-foreground/5 border border-border-secondary text-foreground hover:bg-foreground/10 transition-colors mono uppercase tracking-widest">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleExport}
                                        disabled={isExporting || exportPassphrase.length < 8 || exportPassphrase !== confirmExportPassphrase}
                                        className="px-4 py-2 text-sm font-medium bg-foreground text-background hover:opacity-90 transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 mono uppercase tracking-widest"
                                    >
                                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Download"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <h3 className="text-sm font-semibold text-warning flex items-center gap-2 mb-1 mono uppercase tracking-widest">
                                        <AlertTriangle className="w-4 h-4" /> Plaintext Confirm
                                    </h3>
                                    <p className="text-sm text-foreground">
                                        This file will contain your passwords in <strong className="text-warning">plain text</strong>. Are you sure?
                                    </p>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button onClick={cancelExport} className="px-4 py-2 text-sm font-medium bg-foreground/5 border border-border-secondary text-foreground hover:bg-foreground/10 transition-colors mono uppercase tracking-widest">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleExport}
                                        disabled={isExporting}
                                        className="px-4 py-2 text-sm font-medium bg-warning text-background hover:bg-warning/80 transition-colors disabled:opacity-50 flex items-center gap-2 mono uppercase tracking-widest"
                                    >
                                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Download Anyway"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

/* ──────────────────────────────────────────────────────────
   Import Data Section
   ────────────────────────────────────────────────────────── */
function ImportDataSection() {
    const { user, supabaseClient } = useAuth();
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [importing, setImporting] = useState(false);
    const [importDone, setImportDone] = useState("");

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result as string;
            const result = file.name.endsWith(".json") ? parseJSON(text) : parseCSV(text);
            setImportResult(result);
            setImportDone("");
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (!importResult || !user) return;
        setImporting(true);

        try {
            const vaultService = new VaultService(supabaseClient);

            let imported = 0;
            for (const cred of importResult.credentials) {
                await vaultService.addCredential(user.id, cred, { category: "other" });
                imported++;
            }

            setImportDone(`Successfully imported ${imported} credentials.`);
            setImportResult(null);
        } catch (e) {
            setImportDone("Import failed.");
            console.error(e);
        } finally {
            setImporting(false);
        }
    };

    return (
        <section className="bg-bg-secondary border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 border border-success/20 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-success" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-foreground mono uppercase tracking-wider">Import Data</h2>
                    <p className="text-sm text-fg-secondary">Import credentials from a JSON or CSV file.</p>
                </div>
            </div>
            <div className="p-6 space-y-4">
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-bg-tertiary border border-dashed border-border-secondary hover:bg-foreground/5 cursor-pointer text-foreground transition-colors text-sm font-medium mono uppercase tracking-widest">
                    <Upload className="w-4 h-4 text-fg-secondary" />
                    Choose File
                    <input type="file" accept=".json,.csv" onChange={handleFileSelect} className="hidden" />
                </label>

                {importResult && (
                    <div className="space-y-3">
                        <div className="p-3 bg-bg-tertiary border border-border">
                            <p className="text-sm text-foreground font-medium">{importResult.credentials.length} credentials ready to import</p>
                            {importResult.skipped > 0 && (
                                <p className="text-xs text-warning mt-1">{importResult.skipped} rows skipped due to errors.</p>
                            )}
                            {importResult.errors.length > 0 && (
                                <ul className="mt-2 text-xs text-error space-y-0.5">
                                    {importResult.errors.slice(0, 3).map((err: string, i: number) => <li key={i}>{err}</li>)}
                                </ul>
                            )}
                        </div>
                        <button
                            onClick={handleImport}
                            disabled={importing || importResult.credentials.length === 0}
                            className="w-full py-2.5 font-semibold bg-foreground text-background hover:opacity-90 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm mono uppercase tracking-widest"
                        >
                            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            Import Credentials
                        </button>
                    </div>
                )}

                {importDone && (
                    <p className="text-sm text-success flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> {importDone}
                    </p>
                )}
            </div>
        </section>
    );
}

/* ──────────────────────────────────────────────────────────
   Danger Zone (Account Deletion / Logout)
   ────────────────────────────────────────────────────────── */
function DangerZoneSection() {
    const { user, supabaseClient } = useAuth();
    const [confirmText, setConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDeleteAccount = async () => {
        if (confirmText !== "DELETE" || !user) return;
        setIsDeleting(true);
        try {
            await supabaseClient.auth.signOut();
            window.location.href = "/login";
        } catch (e) {
            console.error("Account deletion error:", e);
            setIsDeleting(false);
        }
    };

    const handleLogout = async () => {
        await supabaseClient.auth.signOut();
        window.location.href = "/login";
    };

    return (
        <section className="bg-bg-secondary border border-error/20 overflow-hidden">
            <div className="p-6 border-b border-error/10 flex items-center gap-3">
                <div className="w-10 h-10 bg-error/10 border border-error/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-error" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-foreground mono uppercase tracking-wider">Danger Zone</h2>
                    <p className="text-sm text-fg-secondary">Irreversible and destructive actions.</p>
                </div>
            </div>

            <div className="p-6 space-y-4">
                {/* Logout */}
                <div className="flex items-center justify-between p-4 bg-bg-tertiary border border-border-secondary">
                    <div>
                        <p className="text-sm font-medium text-foreground">Sign Out</p>
                        <p className="text-xs text-fg-secondary">Locks the vault and signs you out of your account.</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-foreground/5 border border-border-secondary hover:bg-foreground/10 text-foreground transition-colors flex items-center gap-2 mono uppercase tracking-widest text-xs"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>

                {/* Delete Account */}
                <div className="p-4 bg-error/5 border border-error/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground">Delete Account</p>
                            <p className="text-xs text-fg-secondary">Permanently delete your account and all vault data.</p>
                        </div>
                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 bg-error/10 border border-error/30 text-error hover:bg-error/20 transition-colors mono uppercase tracking-widest text-xs"
                            >
                                Delete Account
                            </button>
                        ) : null}
                    </div>

                    {showDeleteConfirm && (
                        <div className="mt-4 pt-4 border-t border-error/20 space-y-3">
                            <p className="text-sm text-error">Type <strong>DELETE</strong> to confirm account deletion:</p>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={e => setConfirmText(e.target.value)}
                                className="w-full bg-background border border-error/30 px-3 py-2 text-foreground focus:ring-1 focus:ring-error focus:border-error font-mono text-sm outline-none"
                                placeholder="Type DELETE"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setShowDeleteConfirm(false); setConfirmText(""); }}
                                    className="px-4 py-2 bg-foreground/5 border border-border-secondary text-foreground hover:bg-foreground/10 transition-colors mono uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={confirmText !== "DELETE" || isDeleting}
                                    className="px-4 py-2 font-semibold bg-error text-foreground hover:bg-error/90 transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 mono uppercase tracking-widest text-xs"
                                >
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    Permanently Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
