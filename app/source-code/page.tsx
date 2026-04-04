import { ImmersiveBackground } from "@/components/landing/immersive-background";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hexagon, Github, GitBranch, Code, Database, ExternalLink, FileCode, Shield, Lock } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Source Code — Privault",
    description: "Privault is open source. Inspect, audit, and verify every line of our zero-knowledge encryption implementation.",
};

const repoStats = [
    { label: "Language", value: "TypeScript", icon: Code },
    { label: "Framework", value: "Next.js 15", icon: FileCode },
    { label: "Encryption", value: "AES-256-GCM", icon: Lock },
    { label: "License", value: "MIT", icon: Shield },
];

const coreModules = [
    {
        name: "crypto-engine",
        path: "/lib/crypto",
        desc: "AES-256-GCM encryption/decryption, PBKDF2 key derivation, and IV generation using the Web Crypto API.",
        accent: "var(--pipeline-neon-1)",
        status: "AUDITED",
    },
    {
        name: "vault-manager",
        path: "/services/vault",
        desc: "Client-side vault CRUD operations, encrypted payload serialization, and Supabase sync layer.",
        accent: "var(--pipeline-neon-2)",
        status: "AUDITED",
    },
    {
        name: "auth-module",
        path: "/components/auth",
        desc: "Authentication flows, session management, and master password verification without server exposure.",
        accent: "var(--pipeline-neon-3)",
        status: "VERIFIED",
    },
    {
        name: "entropy-generator",
        path: "/lib/password-gen",
        desc: "CSPRNG-based password generation with configurable entropy, character class selection, and strength analysis.",
        accent: "var(--pipeline-neon-2)",
        status: "AUDITED",
    },
    {
        name: "rls-policies",
        path: "/database/migrations",
        desc: "Row-Level Security schemas ensuring per-user data isolation at the PostgreSQL layer.",
        accent: "var(--pipeline-neon-1)",
        status: "ENFORCED",
    },
    {
        name: "middleware",
        path: "/middleware.ts",
        desc: "Security headers, CSP nonce injection, route protection, and request validation pipeline.",
        accent: "var(--pipeline-neon-3)",
        status: "ACTIVE",
    },
];

export default function SourceCodePage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-transparent font-sans text-foreground selection:bg-brand-subtle">
            <ImmersiveBackground />
            <LandingNav />

            <main className="relative z-10 pt-28 pb-24 px-6 md:px-12 max-w-6xl mx-auto md:pt-32">
                {/* Header */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="mono text-[10px] tracking-[0.3em] text-fg-muted uppercase">SYS::SOURCE_CODE</span>
                        <span className="w-8 h-[1px] bg-[var(--pipeline-neon-1)]"></span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground mb-6 uppercase">
                        Source Code
                    </h1>
                    <p className="mono text-sm text-fg-muted max-w-2xl uppercase tracking-widest leading-relaxed mb-8">
                        Privault is fully open source. Every cryptographic operation, every security policy, every line of code 
                        is available for public inspection and audit.
                    </p>

                    {/* CTA */}
                    <a
                        href="https://github.com/iamitkrp/Privault"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-3 border border-border hover:border-foreground/30 px-6 py-4 bg-bg-secondary/50 hover:bg-bg-secondary transition-all mono text-xs uppercase tracking-widest"
                    >
                        <Github className="w-5 h-5" strokeWidth={1.5} />
                        <span className="font-bold text-foreground">View on GitHub</span>
                        <ExternalLink className="w-3.5 h-3.5 text-fg-muted group-hover:text-foreground transition-colors" />
                    </a>
                </div>

                {/* Repository Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-border/50 p-[1px] mb-16">
                    {repoStats.map((stat) => (
                        <div key={stat.label} className="bg-bg-secondary p-5 md:p-6 group hover:bg-bg-tertiary transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                                <stat.icon className="w-3.5 h-3.5 text-fg-muted" strokeWidth={1.5} />
                                <span className="mono text-[10px] text-fg-muted uppercase tracking-[0.2em]">{stat.label}</span>
                            </div>
                            <span className="mono text-sm md:text-base font-bold text-foreground tracking-wider">{stat.value}</span>
                        </div>
                    ))}
                </div>

                {/* Core Modules */}
                <div className="mb-8">
                    <h2 className="mono text-xs font-bold text-foreground uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                        <span className="w-4 h-[2px] bg-[var(--pipeline-neon-2)]"></span>
                        Core Modules
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-border/50 p-[1px]">
                    {coreModules.map((mod, i) => (
                        <div
                            key={mod.name}
                            className="group relative bg-bg-secondary p-6 md:p-8 hover:bg-bg-tertiary transition-all overflow-hidden"
                        >
                            {/* Hover glow */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                style={{
                                    background: `radial-gradient(circle at 50% 120%, ${mod.accent}15 0%, transparent 70%)`
                                }}
                            />

                            {/* Status badge */}
                            <div className="relative z-10 flex items-center justify-between mb-4">
                                <span className="mono text-[10px] tracking-[0.2em] text-fg-muted uppercase font-bold">
                                    MOD_{String(i + 1).padStart(2, "0")}
                                </span>
                                <span
                                    className="mono text-[9px] tracking-[0.15em] uppercase font-bold px-2 py-0.5"
                                    style={{ color: mod.accent, backgroundColor: `${mod.accent}15` }}
                                >
                                    {mod.status}
                                </span>
                            </div>

                            <h3 className="relative z-10 mono text-base font-bold text-foreground mb-2 tracking-wider uppercase">
                                {mod.name}
                            </h3>
                            <p className="relative z-10 mono text-[10px] text-fg-muted mb-4 tracking-widest uppercase">
                                {mod.path}
                            </p>
                            <p className="relative z-10 mono text-xs text-fg-secondary leading-[1.8] tracking-wider">
                                {mod.desc}
                            </p>

                            {/* Left accent */}
                            <div
                                className="absolute top-0 bottom-0 left-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ backgroundColor: mod.accent }}
                            />
                        </div>
                    ))}
                </div>

                {/* Open Source Statement */}
                <div className="border border-border/50 bg-bg-secondary/50 p-6 md:p-8 mt-16">
                    <h2 className="mono text-xs font-bold text-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <span className="w-4 h-[2px] bg-[var(--pipeline-neon-3)]"></span>
                        Why Open Source
                    </h2>
                    <p className="mono text-sm text-fg-secondary leading-[2] tracking-wider">
                        Security through obscurity is not security. By making our entire codebase publicly auditable, 
                        we invite the global security community to verify our claims. Every cryptographic operation, 
                        every data flow, every server interaction can be independently inspected. 
                        Trust is not demanded — it is mathematically verifiable.
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-20 pt-16 pb-20 border-t border-border bg-transparent text-xs text-fg-secondary mono uppercase tracking-widest mt-auto">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <Hexagon className="w-4 h-4 text-fg-muted" strokeWidth={1.5} />
                        <span>© {new Date().getFullYear()} Privault [SECURE].</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                    </div>
                </div>
            </footer>

            {/* Terminal bottom bar */}
            <div className="fixed bottom-0 inset-x-0 h-8 border-t border-border-secondary bg-background/80 backdrop-blur-md z-50 flex items-center justify-between px-4 mono text-[10px] uppercase text-fg-muted hidden sm:flex">
                <div className="flex items-center gap-4">
                    <span className="text-foreground bg-bg-secondary px-2 py-0.5">SECURE_ENV: READY</span>
                    <span>&gt;&gt;&gt;&gt;&gt;</span>
                    <span className="text-success">REPO: PUBLIC</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1"><Database className="w-3 h-3" /> VAULT_SYNC: ACTIVE</span>
                    <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> PROTOCOL: v2.4.0</span>
                </div>
            </div>
        </div>
    );
}
