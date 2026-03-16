"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { passphraseManager } from "@/lib/crypto/passphrase";
import { CredentialList } from "@/components/vault/credential-list";
import { VaultUnlock } from "@/components/vault/vault-unlock";
import { VaultHealth } from "@/components/vault/vault-health";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon-panel";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { VaultCredential } from "@/types";
import { LayoutDashboard, ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type ActiveTool = { id: string; label: string } | null;

export default function VaultPage() {
    const { user } = useAuth();
    const [isUnlocked, setIsUnlocked] = useState(passphraseManager.isUnlocked());
    const [credentials, setCredentials] = useState<VaultCredential[]>([]);
    const [activeTool, setActiveTool] = useState<ActiveTool>(null);

    useEffect(() => {
        const unsubscribe = passphraseManager.subscribe((locked) => {
            setIsUnlocked(!locked);
        });
        return unsubscribe;
    }, []);

    function handleHomeNavigate(toolId: string, toolLabel: string) {
        setActiveTool({ id: toolId, label: toolLabel });
    }

    function goHome() {
        setActiveTool(null);
    }

    const VAULT_REQUIRED_TOOLS = new Set(['passwords', 'notes']);

    const isModalOpen = activeTool && VAULT_REQUIRED_TOOLS.has(activeTool.id) && !isUnlocked;
    const isHomeView = !activeTool || isModalOpen;

    return (
        <div className="pt-20 min-h-screen relative">
            {/* The Main View Layer */}
            <div
                className="w-full animate-in fade-in slide-in-from-bottom-4 duration-400"
                key={isHomeView ? "home" : activeTool?.id}
            >
                {isHomeView ? (
                    <DashboardHome
                        userName={user?.email}
                        onToolNavigate={handleHomeNavigate}
                    />
                ) : (
                    <div className="w-full">
                        {activeTool?.id === "passwords" ? (
                            <VaultCommandCenter
                                userEmail={user?.email}
                                credentials={credentials}
                                onCredentialsLoad={setCredentials}
                                onBack={goHome}
                            />
                        ) : (
                            <div className="px-6 md:px-12 max-w-[1600px] mx-auto pt-4 md:pt-8 w-full">
                                <button
                                    onClick={goHome}
                                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white mb-6 transition-colors group mono uppercase tracking-widest"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                                    <LayoutDashboard className="w-3 h-3" />
                                    Dashboard
                                </button>

                                <div className="mb-8">
                                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1.5">
                                        {user?.email}
                                    </p>
                                    <h1 className="text-3xl font-bold tracking-tight text-white capitalize">
                                        {activeTool?.label}
                                    </h1>
                                </div>

                                <ComingSoonPanel toolName={activeTool!.label} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Layer */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/80 backdrop-blur-md cursor-pointer"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) {
                                goHome();
                            }
                        }}
                    >
                        <VaultUnlock 
                            onUnlock={() => setIsUnlocked(true)} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Vault Command Center ──────────────────────────────────────────────────────
// A completely new layout inspired by landing page hero + dashboard split

import { Activity } from "lucide-react";

function VaultCommandCenter({
    userEmail,
    credentials,
    onCredentialsLoad,
    onBack,
}: {
    userEmail?: string;
    credentials: VaultCredential[];
    onCredentialsLoad: (creds: VaultCredential[]) => void;
    onBack: () => void;
}) {
    return (
        <div className="relative w-full min-h-[calc(100vh-80px)] text-white overflow-hidden">
            <div className="relative z-10 flex flex-col w-full">

                {/* ─── HERO HEADER ─── */}
                <div className="px-6 md:px-12 pt-4 pb-0">
                    {/* Back nav */}
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        onClick={onBack}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white mb-8 transition-colors group mono uppercase tracking-widest"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        <LayoutDashboard className="w-3 h-3" />
                        Dashboard
                    </motion.button>

                    {/* Hero section */}
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {/* Status badge */}
                            <div className="mono text-xs text-gray-500 mb-5 tracking-widest uppercase flex items-center gap-2 border border-[#333] px-3 py-1.5 bg-black/50 w-fit">
                                <Activity className="w-3 h-3 text-[#ff4500]" />
                                <span>[[ VAULT_MODE // DECRYPTED ]]</span>
                            </div>

                            <p className="mono text-xs text-gray-500 uppercase tracking-widest mb-3">
                                {userEmail}
                            </p>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-white leading-[0.95] uppercase">
                                Password
                            </h1>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tighter text-gray-500 leading-[0.95] uppercase">
                                [Vault.]
                            </h2>
                        </motion.div>

                        {/* Quick stats row — visible on large screens */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="hidden lg:flex items-center gap-6"
                        >
                            <QuickStat label="Credentials" value={credentials.length} />
                            <div className="w-px h-8 bg-[#222]" />
                            <QuickStat
                                label="Health"
                                value={`${calcHealthScore(credentials)}`}
                                suffix="/100"
                                color={calcHealthScore(credentials) >= 90 ? "text-green-500" : calcHealthScore(credentials) >= 70 ? "text-yellow-500" : "text-red-500"}
                            />
                            <div className="w-px h-8 bg-[#222]" />
                            <QuickStat
                                label="Weak"
                                value={countWeak(credentials)}
                                color={countWeak(credentials) > 0 ? "text-red-500" : "text-white"}
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-[#1a1a1a]" />

                {/* ─── TWO-COLUMN BODY ─── */}
                <div className="flex flex-col lg:flex-row w-full flex-1">
                    {/* ── LEFT: Credential List ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="flex-1 px-6 md:px-12 py-8 lg:border-r border-[#1a1a1a] min-w-0"
                    >
                        <CredentialList onCredentialsLoad={onCredentialsLoad} />
                    </motion.div>

                    {/* ── RIGHT: Analytics Sidebar ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="w-full lg:w-[380px] xl:w-[420px] shrink-0 px-6 md:px-8 py-8"
                    >
                        <VaultHealth credentials={credentials} />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}


// ─── Quick Stat Pill ────────────────────────────────────────────────────────────

function QuickStat({
    label,
    value,
    suffix,
    color = "text-white",
}: {
    label: string;
    value: string | number;
    suffix?: string;
    color?: string;
}) {
    return (
        <div className="text-right">
            <p className="mono text-[10px] text-gray-600 uppercase tracking-widest mb-1">{label}</p>
            <p className={`mono text-lg font-bold ${color} flex items-baseline gap-0.5 justify-end`}>
                {value}
                {suffix && <span className="text-xs text-gray-600 font-normal">{suffix}</span>}
            </p>
        </div>
    );
}


// ─── Utility Functions ──────────────────────────────────────────────────────────

function calcHealthScore(credentials: VaultCredential[]): number {
    if (credentials.length === 0) return 100;

    const expired = credentials.filter(c => c.expiration_status === "expired").length;
    const expiringSoon = credentials.filter(c => c.expiration_status === "expiring_soon").length;

    const passwordCounts = credentials.reduce((acc, c) => {
        const pw = c.decrypted.password;
        acc[pw] = (acc[pw] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const reusedPasswords = Object.values(passwordCounts).filter(count => count > 1).length;

    const weakPasswords = countWeak(credentials);

    let score = 100;
    if (expired > 0) score -= 20;
    if (reusedPasswords > 0) score -= 15 * reusedPasswords;
    if (expiringSoon > 0) score -= 5 * expiringSoon;
    if (weakPasswords > 0) score -= 5 * weakPasswords;

    return Math.max(0, score);
}

function countWeak(credentials: VaultCredential[]): number {
    return credentials.filter(c => {
        if (c.category === "secure_note") return false;
        const pw = c.decrypted.password;
        return pw.length < 10 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw) || !/[^A-Za-z0-9]/.test(pw);
    }).length;
}
