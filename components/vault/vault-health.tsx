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

    // Weak password detection (no uppercase, no digits, no symbols, or too short)
    const weakPasswords = credentials.filter(c => {
        if (c.category === "secure_note") return false;
        const pw = c.decrypted.password;
        return pw.length < 10 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw) || !/[^A-Za-z0-9]/.test(pw);
    }).length;

    // Determine overall health status
    let healthScore = 100;
    if (expired > 0) healthScore -= 20;
    if (reusedPasswords > 0) healthScore -= 15 * reusedPasswords;
    if (expiringSoon > 0) healthScore -= 5 * expiringSoon;
    if (weakPasswords > 0) healthScore -= 5 * weakPasswords;

    healthScore = Math.max(0, healthScore);

    const getHealthColor = () => {
        if (healthScore >= 90) return "text-green-500 bg-green-500/10 border-green-500/30";
        if (healthScore >= 70) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
        return "text-red-500 bg-red-500/10 border-red-500/30";
    };

    const handleManualLock = () => {
        passphraseManager.lock();
    };

    return (
        <div className="bg-[#0A0A0A] border border-[#222] p-8 flex flex-col h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                    <h2 className="mono text-xs font-bold uppercase tracking-widest text-white flex items-center gap-3">
                        <Activity className="w-4 h-4 text-white" />
                        Vault Analytics
                    </h2>
                </div>

                <div className="space-y-6 flex-1 w-full">
                    {/* Health Score Card */}
                    <div className={`p-5 border flex items-center justify-between ${getHealthColor()} transition-colors`}>
                        <div>
                            <p className="mono text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Health Score</p>
                            <div className="text-3xl font-bold flex items-baseline gap-1 mono">
                                {healthScore} <span className="text-sm font-medium opacity-60">/ 100</span>
                            </div>
                        </div>
                        {healthScore >= 90 ? <ShieldCheck className="w-8 h-8 opacity-80" /> : <ShieldAlert className="w-8 h-8 opacity-80" />}
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-px bg-[#222] border border-[#222]">
                        <div className="bg-[#0A0A0A] p-4">
                            <p className="mono text-[10px] text-gray-500 tracking-widest uppercase mb-2">Total</p>
                            <p className="mono text-lg font-bold text-white flex items-center gap-2">
                                <KeyRound className="w-3.5 h-3.5 text-gray-400" /> {totalCount}
                            </p>
                        </div>
                        <div className="bg-[#0A0A0A] p-4">
                            <p className="mono text-[10px] text-gray-500 tracking-widest uppercase mb-2">Reused</p>
                            <p className={`mono text-lg font-bold flex items-center gap-2 ${reusedPasswords > 0 ? 'text-yellow-500' : 'text-white'}`}>
                                {reusedPasswords}
                            </p>
                        </div>
                        <div className="bg-[#0A0A0A] p-4">
                            <p className="mono text-[10px] text-gray-500 tracking-widest uppercase mb-2">Expiring</p>
                            <p className={`mono text-lg font-bold flex items-center gap-2 ${expiringSoon > 0 ? 'text-yellow-500' : 'text-white'}`}>
                                {expiringSoon}
                            </p>
                        </div>
                        <div className="bg-[#0A0A0A] p-4">
                            <p className="mono text-[10px] text-gray-500 tracking-widest uppercase mb-2">Weak</p>
                            <p className={`mono text-lg font-bold flex items-center gap-2 ${weakPasswords > 0 ? 'text-red-500' : 'text-white'}`}>
                                {weakPasswords}
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-[#222] space-y-3">
                        <p className="mono text-[10px] text-gray-500 tracking-widest uppercase leading-relaxed max-w-[280px]">
                            Keys are stored securely in local memory. Auto-purge initialized on 15 minutes of inactivity.
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-6 border-t border-[#222]">
                    <button
                        onClick={handleManualLock}
                        className="flex-1 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-colors mono text-[10px] uppercase tracking-widest font-bold border border-white/10 hover:border-white/30"
                    >
                        Lock Vault
                    </button>
                    <button
                        onClick={signOut}
                        className="flex-1 h-12 flex items-center justify-center bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-colors mono text-[10px] uppercase tracking-widest font-bold border border-red-500/20 hover:border-red-500/30"
                    >
                        Disconnect
                    </button>
                </div>
            </div>
        </div>
    );
}
