"use client";

import { LockKeyhole, FileText, ArrowRight, Activity, Database, GitBranch, ShieldCheck, Fingerprint, Globe, Server } from "lucide-react";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type Module = {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge: string;
    live: boolean;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const MODULES: Module[] = [
    {
        id: "passwords",
        label: "Password Vault",
        description: "AES-256-GCM encrypted. Your master key never leaves your device.",
        icon: <LockKeyhole className="w-5 h-5" strokeWidth={1.5} />,
        badge: "ACTIVE",
        live: true,
    },
    {
        id: "notes",
        label: "Secure Notes",
        description: "End-to-end encrypted notes. Zero knowledge, always client-side.",
        icon: <FileText className="w-5 h-5" strokeWidth={1.5} />,
        badge: "LIVE",
        live: true,
    },
];

const TRUST_STATS = [
    { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "AES-256-GCM", sub: "Encryption standard" },
    { icon: <Fingerprint className="w-3.5 h-3.5" />, label: "100K Iterations", sub: "PBKDF2 key derivation" },
    { icon: <Globe className="w-3.5 h-3.5" />, label: "Zero-Knowledge", sub: "Blind server architecture" },
    { icon: <Server className="w-3.5 h-3.5" />, label: "Client-Side Only", sub: "No data ever leaves" },
];

const SYSTEM_ROWS = [
    { label: "Vault Encryption", value: "AES-256-GCM" },
    { label: "Key Derivation", value: "PBKDF2 · 100K" },
    { label: "Architecture", value: "Zero-Knowledge" },
    { label: "Connection", value: "E2E Encrypted" },
];

// ─── Module Card ─────────────────────────────────────────────────────────────

function ModuleCard({
    module,
    onNavigate,
    index,
}: {
    module: Module;
    onNavigate: (id: string, label: string) => void;
    index: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => module.live && onNavigate(module.id, module.label)}
            className="group relative cursor-pointer flex items-center gap-5 p-5 border border-border bg-bg-secondary hover:bg-bg-tertiary hover:border-border-secondary transition-all duration-300 overflow-hidden"
        >
            {/* Corner accent */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-border-secondary group-hover:border-success transition-colors duration-300" />

            {/* Icon */}
            <div className="shrink-0 w-10 h-10 border border-border-secondary group-hover:border-border bg-background flex items-center justify-center text-fg-muted group-hover:text-foreground transition-all duration-300">
                {module.icon}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="mono text-xs font-bold text-foreground uppercase tracking-widest">{module.label}</h3>
                    <span className="mono text-[9px] font-bold px-1.5 py-0.5 border border-success/40 text-success tracking-widest">
                        {module.badge}
                    </span>
                </div>
                <p className="mono text-[11px] text-fg-secondary leading-relaxed uppercase tracking-wider group-hover:text-fg-muted transition-colors">{module.description}</p>
            </div>

            {/* Arrow */}
            <ArrowRight className="shrink-0 w-3.5 h-3.5 text-fg-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-300" />
        </motion.div>
    );
}

// ─── Dashboard Home ───────────────────────────────────────────────────────────

export function DashboardHome({
    userName = "User",
    onToolNavigate,
}: {
    userName?: string;
    onToolNavigate: (id: string, label: string) => void;
}) {
    const displayName = userName.includes("@")
        ? userName.split("@")[0]
        : userName.split(" ")[0];

    return (
        <div className="relative w-full min-h-[calc(100vh-80px)] text-foreground overflow-hidden">
            {/* ── Main layout: two-column split ── */}
            <div className="relative z-10 flex flex-col lg:flex-row w-full h-full min-h-[calc(100vh-80px)]">

                {/* ─── LEFT PANE ─── */}
                <div className="flex-1 flex flex-col justify-center px-10 lg:px-16 py-8 lg:py-0 border-b lg:border-b-0 lg:border-r border-border">

                    {/* Status badge — landing page style */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="mono text-xs text-fg-secondary mb-10 tracking-widest uppercase flex items-center gap-2 border border-border-secondary px-3 py-1.5 bg-background/50 w-fit"
                    >
                        <Activity className="w-3 h-3 text-success" />
                        <span>[[ VAULT_STATUS // SECURE ]]</span>
                    </motion.div>

                    {/* Greeting */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-12"
                    >
                        <p className="mono text-xs text-fg-secondary uppercase tracking-widest mb-4">
                            Welcome back, <span className="text-foreground">{displayName}</span>
                        </p>
                        <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tighter text-foreground mb-2 leading-[0.95] uppercase">
                            Your
                        </h1>
                        <h2 className="text-4xl lg:text-5xl xl:text-6xl font-normal tracking-tighter text-fg-secondary mb-8 leading-[0.95] uppercase">
                            [Secure Vault.]
                        </h2>
                        <p className="mono text-sm text-fg-muted max-w-sm leading-relaxed">
                            Client-side encryption. Zero-knowledge architecture means only you can access your data.
                        </p>
                    </motion.div>

                    {/* Trust stats grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.35 }}
                        className="grid grid-cols-2 gap-[1px] bg-border border border-border"
                    >
                        {TRUST_STATS.map((s, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 bg-bg-secondary hover:bg-bg-tertiary transition-colors duration-200">
                                <span className="text-fg-muted mt-0.5 shrink-0">{s.icon}</span>
                                <div>
                                    <p className="mono text-foreground text-[11px] font-bold uppercase tracking-widest">{s.label}</p>
                                    <p className="mono text-fg-muted text-[10px] mt-0.5 uppercase tracking-wide">{s.sub}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* ─── RIGHT PANE ─── */}
                <div className="w-full lg:w-[440px] xl:w-[500px] flex flex-col justify-center px-8 lg:px-10 py-8">

                    {/* Section label */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                        className="mono text-[10px] font-bold uppercase tracking-[0.2em] text-fg-muted mb-4"
                    >
                        Your Modules
                    </motion.p>

                    {/* Module cards */}
                    <div className="flex flex-col gap-[1px] bg-border border border-border mb-8">
                        {MODULES.map((module, idx) => (
                            <ModuleCard
                                key={module.id}
                                module={module}
                                onNavigate={onToolNavigate}
                                index={idx}
                            />
                        ))}
                    </div>

                    {/* System status panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="border border-border bg-bg-secondary p-5"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <p className="mono text-[10px] font-bold uppercase tracking-[0.2em] text-fg-muted">System Status</p>
                            <span className="flex items-center gap-1.5 mono text-[10px] text-success uppercase tracking-widest">
                                <Activity className="w-3 h-3" />
                                Online
                            </span>
                        </div>

                        <div className="space-y-3">
                            {SYSTEM_ROWS.map((row, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1 h-1 bg-success" />
                                        <span className="mono text-[11px] text-fg-secondary uppercase tracking-wide">{row.label}</span>
                                    </div>
                                    <span className="mono text-[11px] font-bold text-foreground uppercase tracking-widest">{row.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                            <span className="mono text-[10px] text-fg-muted uppercase tracking-widest">Core version</span>
                            <span className="mono text-[10px] text-fg-secondary">v2.4.0</span>
                        </div>
                    </motion.div>

                    {/* Bottom status line */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.65, duration: 0.5 }}
                        className="mt-5 flex items-center gap-3 mono text-[10px] text-fg-muted uppercase tracking-widest"
                    >
                        <Database className="w-3 h-3" />
                        <span>Encrypted end-to-end.</span>
                        <span className="text-fg-secondary">·</span>
                        <GitBranch className="w-3 h-3" />
                        <span>Never stored in plaintext.</span>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export type { Module };
