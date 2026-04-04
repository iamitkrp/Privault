import { ImmersiveBackground } from "@/components/landing/immersive-background";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hexagon, Lock, Shield, Key, Server, Fingerprint, Layers, Database, GitBranch } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Whitepaper — Privault",
    description: "The Privault Whitepaper. A deep technical overview of our zero-knowledge encryption architecture, threat model, and client-side cryptographic pipeline.",
};

const sections = [
    {
        id: "01",
        title: "Abstract",
        icon: Layers,
        accent: "emerald",
        content: `Privault is a zero-knowledge password manager engineered around the principle of absolute cryptographic isolation. This document defines the security architecture, threat model, and implementation specifications that ensure user data remains mathematically inaccessible to any party other than the data owner — including Privault's own infrastructure operators.`,
    },
    {
        id: "02",
        title: "Threat Model",
        icon: Shield,
        accent: "rose",
        content: `Privault's threat model assumes a fully compromised server. Even in the event of a complete database breach, an attacker obtains only AES-256-GCM ciphertexts, PBKDF2-derived salt values, and per-item initialization vectors (IVs). Without the user's master password — which never leaves the client — these artifacts are computationally infeasible to decrypt. The system is designed to withstand insider threats, supply-chain attacks on the backend, and state-level adversaries targeting the server infrastructure.`,
    },
    {
        id: "03",
        title: "Key Derivation",
        icon: Key,
        accent: "amber",
        content: `The user's master password is processed through PBKDF2-HMAC-SHA256 with 100,000 iterations and a cryptographically random 128-bit salt unique to each user. This produces a 256-bit derived key used exclusively for AES-256-GCM encryption. The high iteration count ensures that brute-force and dictionary attacks against the derived key require an infeasible amount of computational resources, even with modern GPU clusters.`,
    },
    {
        id: "04",
        title: "Encryption Pipeline",
        icon: Lock,
        accent: "cyan",
        content: `All encryption and decryption operations execute exclusively within the user's browser using the Web Crypto API. Each vault item is encrypted with a unique 96-bit Initialization Vector (IV) generated via crypto.getRandomValues(). The AES-256-GCM authenticated encryption mode provides both confidentiality and integrity verification — any tampering with ciphertext is detected and rejected during decryption. The server receives, stores, and returns only opaque ciphertext blobs.`,
    },
    {
        id: "05",
        title: "Client-Server Segregation",
        icon: Server,
        accent: "violet",
        content: `The Privault server is architecturally a "blind vault." It performs no cryptographic operations on user data — its sole responsibility is authenticated CRUD operations on encrypted payloads. Row-Level Security (RLS) policies in the PostgreSQL layer enforce per-user data isolation. The server cannot distinguish between a vault containing one item and one containing thousands; it sees only uniformly structured ciphertext envelopes.`,
    },
    {
        id: "06",
        title: "Entropy & Password Generation",
        icon: Fingerprint,
        accent: "blue",
        content: `Privault's built-in password generator utilizes the browser's cryptographically secure pseudo-random number generator (CSPRNG) via the Web Crypto API. Generated passwords satisfy configurable entropy requirements including length, character class composition (uppercase, lowercase, digits, symbols), and minimum entropy bits. This ensures generated credentials are resistant to both online and offline dictionary attacks.`,
    },
];

export default function WhitepaperPage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-transparent font-sans text-foreground selection:bg-brand-subtle">
            <ImmersiveBackground />
            <LandingNav />

            <main className="relative z-10 pt-28 pb-24 px-6 md:px-12 max-w-5xl mx-auto md:pt-32">
                {/* Header */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="mono text-[10px] tracking-[0.3em] text-fg-muted uppercase">SEC_DOC::WHITEPAPER</span>
                        <span className="w-8 h-[1px] bg-[var(--pipeline-neon-2)]"></span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground mb-6 uppercase">
                        Whitepaper
                    </h1>
                    <p className="mono text-sm text-fg-muted max-w-2xl uppercase tracking-widest leading-relaxed">
                        A comprehensive technical specification of Privault&apos;s zero-knowledge encryption architecture, 
                        threat model, and cryptographic design principles.
                    </p>
                    <div className="flex items-center gap-4 mt-6 mono text-[10px] text-fg-muted uppercase tracking-widest">
                        <span>Version 2.4.0</span>
                        <span className="w-1 h-1 bg-border rounded-full"></span>
                        <span>April 2026</span>
                        <span className="w-1 h-1 bg-border rounded-full"></span>
                        <span className="text-success flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                            ACTIVE
                        </span>
                    </div>
                </div>

                {/* Table of Contents */}
                <div className="border border-border/50 bg-bg-secondary/50 p-6 md:p-8 mb-16">
                    <h2 className="mono text-xs font-bold text-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <span className="w-4 h-[2px] bg-[var(--pipeline-neon-1)]"></span>
                        Table of Contents
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sections.map((s) => (
                            <a
                                key={s.id}
                                href={`#section-${s.id}`}
                                className="group flex items-center gap-3 mono text-xs sm:text-sm text-fg-secondary hover:text-foreground transition-colors uppercase tracking-wider py-1"
                            >
                                <span className="text-fg-muted group-hover:text-[var(--pipeline-neon-2)] transition-colors font-bold">{s.id}</span>
                                <span className="w-3 h-[1px] bg-border group-hover:bg-[var(--pipeline-neon-2)] group-hover:w-6 transition-all"></span>
                                {s.title}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-0">
                    {sections.map((s) => (
                        <section
                            key={s.id}
                            id={`section-${s.id}`}
                            className="group relative border-t border-border/40 py-12 md:py-16"
                        >
                            {/* Section indicator */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 border border-border/50 flex items-center justify-center bg-bg-secondary group-hover:border-[var(--pipeline-neon-2)]/50 transition-colors">
                                    <s.icon className="w-4 h-4 text-fg-muted group-hover:text-[var(--pipeline-neon-2)] transition-colors" strokeWidth={1.5} />
                                </div>
                                <span className="mono text-[10px] tracking-[0.3em] text-fg-muted uppercase font-bold">
                                    SEC_{s.id}
                                </span>
                                <span className="flex-1 h-[1px] bg-border/30"></span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 tracking-tight uppercase">
                                {s.title}
                            </h2>
                            <p className="mono text-sm text-fg-secondary leading-[2] tracking-wider max-w-3xl">
                                {s.content}
                            </p>
                        </section>
                    ))}
                </div>

                {/* Conclusion / Closing */}
                <div className="border-t border-border/40 pt-12 mt-4">
                    <div className="border border-border/50 bg-bg-secondary/50 p-6 md:p-8">
                        <h2 className="mono text-xs font-bold text-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span className="w-4 h-[2px] bg-[var(--pipeline-neon-3)]"></span>
                            Conclusion
                        </h2>
                        <p className="mono text-sm text-fg-secondary leading-[2] tracking-wider">
                            Privault&apos;s architecture is built on the principle that security through design is superior to security through policy. 
                            By ensuring that unencrypted user data never exists outside the client&apos;s volatile memory, we eliminate entire categories 
                            of attack vectors. The server is mathematically blind — it cannot be compelled, coerced, or compromised into revealing 
                            what it does not possess.
                        </p>
                    </div>
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
                    <span className="text-success">DOC: WHITEPAPER</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1"><Database className="w-3 h-3" /> VAULT_SYNC: ACTIVE</span>
                    <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> PROTOCOL: v2.4.0</span>
                </div>
            </div>
        </div>
    );
}
