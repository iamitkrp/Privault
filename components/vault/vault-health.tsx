"use client";

import { useAuth } from "@/components/auth/auth-context";
import { ShieldCheck, ShieldAlert, KeyRound, Activity } from "lucide-react";
import { VaultCredential } from "@/types";
import { passphraseManager } from "@/lib/crypto/passphrase";

interface VaultHealthProps {
    credentials: VaultCredential[];
}

export function VaultHealth({ credentials }: VaultHealthProps) {
    const { signOut } = useAuth();

    // Analyze Vault Health
    const totalCount = credentials.length;

    // Calculate simple health metrics
    const expiringSoon = credentials.filter(c => c.expiration_status === "expiring_soon").length;
    const expired = credentials.filter(c => c.expiration_status === "expired").length;

    // Find reused passwords (comparing literal decrypted strings - done client side securely)
    const passwordCounts = credentials.reduce((acc, c) => {
        const pw = c.decrypted.password;
        acc[pw] = (acc[pw] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const reusedPasswords = Object.values(passwordCounts).filter(count => count > 1).length;

    // Determine overall health status
    let healthScore = 100;
    if (expired > 0) healthScore -= 20;
    if (reusedPasswords > 0) healthScore -= 15 * reusedPasswords;
    if (expiringSoon > 0) healthScore -= 5 * expiringSoon;

    healthScore = Math.max(0, healthScore);

    const getHealthColor = () => {
        if (healthScore >= 90) return "text-success bg-success/10 border-success/20";
        if (healthScore >= 70) return "text-[#eab308] bg-[#eab308]/10 border-[#eab308]/20";
        return "text-error bg-error/10 border-error/20";
    };

    const handleManualLock = () => {
        passphraseManager.lock();
    };

    return (
        <div className="glass p-6 rounded-xl shadow-glass flex flex-col h-full border border-border/50">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Activity className="w-5 h-5 text-brand" />
                    Vault Analytics
                </h2>
            </div>

            <div className="space-y-5 flex-1 w-full">

                {/* Health Score Card */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${getHealthColor()} transition-colors`}>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">Health Score</p>
                        <div className="text-3xl font-bold flex items-baseline gap-1">
                            {healthScore} <span className="text-sm font-medium opacity-60">/ 100</span>
                        </div>
                    </div>
                    {healthScore >= 90 ? <ShieldCheck className="w-10 h-10 opacity-80" /> : <ShieldAlert className="w-10 h-10 opacity-80" />}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background/40 border border-border/50 p-3 rounded-lg">
                        <p className="text-xs text-secondary mb-1">Total</p>
                        <p className="text-lg font-semibold text-foreground flex items-center gap-1.5">
                            <KeyRound className="w-4 h-4 text-brand" /> {totalCount}
                        </p>
                    </div>
                    <div className="bg-background/40 border border-border/50 p-3 rounded-lg">
                        <p className="text-xs text-secondary mb-1">Reused</p>
                        <p className={`text-lg font-semibold flex items-center gap-1.5 ${reusedPasswords > 0 ? 'text-[#eab308]' : 'text-foreground'}`}>
                            {reusedPasswords}
                        </p>
                    </div>
                    <div className="bg-background/40 border border-border/50 p-3 rounded-lg">
                        <p className="text-xs text-secondary mb-1">Expiring</p>
                        <p className={`text-lg font-semibold flex items-center gap-1.5 ${expiringSoon > 0 ? 'text-[#eab308]' : 'text-foreground'}`}>
                            {expiringSoon}
                        </p>
                    </div>
                    <div className="bg-background/40 border border-border/50 p-3 rounded-lg">
                        <p className="text-xs text-secondary mb-1">Expired</p>
                        <p className={`text-lg font-semibold flex items-center gap-1.5 ${expired > 0 ? 'text-error' : 'text-foreground'}`}>
                            {expired}
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t border-border/50 space-y-3">
                    <p className="text-xs text-secondary leading-relaxed">
                        Keys are in memory. They will be securely purged after 15 minutes of inactivity.
                    </p>
                </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/50">
                <button
                    onClick={handleManualLock}
                    className="flex-1 px-4 py-2 rounded-lg bg-error/10 hover:bg-error/20 text-error transition-colors text-sm font-medium border border-error/20"
                >
                    Lock Vault
                </button>
                <button
                    onClick={signOut}
                    className="flex-1 px-4 py-2 rounded-lg bg-background hover:bg-white/5 text-foreground transition-colors text-sm font-medium border border-border"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
