import { ImmersiveBackground } from "@/components/landing/immersive-background";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hexagon, Mail, Github, MessageSquare, Shield, AlertTriangle, Bug, FileText, Database, GitBranch, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Protocol — Privault",
    description: "Secure communication channels for reaching the Privault team. Report vulnerabilities, request support, or contribute to the project.",
};

const channels = [
    {
        id: "01",
        title: "Security Vulnerabilities",
        icon: Shield,
        accent: "var(--pipeline-neon-1)",
        priority: "CRITICAL",
        description: "Report security vulnerabilities through our responsible disclosure program. All reports are treated with the highest priority and confidentiality.",
        action: "Report Vulnerability",
        href: "mailto:security@privault.dev",
        protocol: "ENCRYPTED EMAIL",
    },
    {
        id: "02",
        title: "Bug Reports",
        icon: Bug,
        accent: "var(--pipeline-neon-2)",
        priority: "HIGH",
        description: "Found a bug? Open an issue on our GitHub repository with detailed reproduction steps, expected behavior, and environment information.",
        action: "Open Issue on GitHub",
        href: "https://github.com/iamitkrp/Privault/issues",
        protocol: "GITHUB ISSUES",
    },
    {
        id: "03",
        title: "Feature Requests",
        icon: MessageSquare,
        accent: "var(--pipeline-neon-3)",
        priority: "STANDARD",
        description: "Have an idea to improve Privault? We welcome feature requests and community contributions via GitHub Discussions.",
        action: "Start Discussion",
        href: "https://github.com/iamitkrp/Privault/discussions",
        protocol: "GITHUB DISCUSSIONS",
    },
    {
        id: "04",
        title: "General Inquiries",
        icon: Mail,
        accent: "var(--fg-muted)",
        priority: "STANDARD",
        description: "For partnership inquiries, press requests, or general questions about Privault's architecture and mission.",
        action: "Send Email",
        href: "mailto:hello@privault.dev",
        protocol: "EMAIL",
    },
];

const guidelines = [
    {
        icon: Shield,
        title: "Responsible Disclosure",
        content: "If you discover a security vulnerability, please report it privately before public disclosure. We commit to acknowledging reports within 24 hours and providing a fix timeline within 72 hours.",
    },
    {
        icon: FileText,
        title: "Issue Quality",
        content: "When reporting bugs, include your browser/OS version, steps to reproduce, expected vs. actual behavior, and any relevant console output. High-quality reports receive faster resolution.",
    },
    {
        icon: Github,
        title: "Contributing",
        content: "We welcome pull requests. Please read our contribution guidelines, ensure tests pass, and maintain the existing code style. All contributions require a signed CLA.",
    },
];

export default function ContactPage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-transparent font-sans text-foreground selection:bg-brand-subtle">
            <ImmersiveBackground />
            <LandingNav />

            <main className="relative z-10 pt-28 pb-24 px-6 md:px-12 max-w-5xl mx-auto md:pt-32">
                {/* Header */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="mono text-[10px] tracking-[0.3em] text-fg-muted uppercase">SYS::CONTACT_PROTOCOL</span>
                        <span className="w-8 h-[1px] bg-[var(--pipeline-neon-3)]"></span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground mb-6 uppercase">
                        Contact Protocol
                    </h1>
                    <p className="mono text-sm text-fg-muted max-w-2xl uppercase tracking-widest leading-relaxed">
                        Secure communication channels for vulnerability reports, bug submissions, 
                        feature requests, and general inquiries.
                    </p>
                    <div className="flex items-center gap-4 mt-6 mono text-[10px] text-fg-muted uppercase tracking-widest">
                        <span className="text-[var(--pipeline-neon-2)] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--pipeline-neon-2)] animate-pulse"></span>
                            Channels Active
                        </span>
                        <span className="w-1 h-1 bg-border rounded-full"></span>
                        <span>Response SLA: 24-72h</span>
                    </div>
                </div>

                {/* Communication Channels */}
                <div className="mb-16">
                    <h2 className="mono text-xs font-bold text-foreground uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                        <span className="w-4 h-[2px] bg-[var(--pipeline-neon-1)]"></span>
                        Communication Channels
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-border/50 p-[1px]">
                        {channels.map((ch) => (
                            <div
                                key={ch.id}
                                className="group relative bg-bg-secondary p-6 md:p-8 hover:bg-bg-tertiary transition-all overflow-hidden flex flex-col"
                            >
                                {/* Hover glow */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                    style={{
                                        background: `radial-gradient(circle at 50% 120%, ${ch.accent}15 0%, transparent 70%)`
                                    }}
                                />

                                {/* Header */}
                                <div className="relative z-10 flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 border border-border/50 flex items-center justify-center bg-background group-hover:border-foreground/20 transition-colors">
                                            <ch.icon className="w-4 h-4 text-fg-muted group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                                        </div>
                                        <span className="mono text-[10px] tracking-[0.2em] text-fg-muted uppercase font-bold">
                                            CH_{ch.id}
                                        </span>
                                    </div>
                                    <span
                                        className="mono text-[9px] tracking-[0.15em] uppercase font-bold px-2 py-0.5"
                                        style={{ color: ch.accent, backgroundColor: `color-mix(in srgb, ${ch.accent} 12%, transparent)` }}
                                    >
                                        {ch.priority}
                                    </span>
                                </div>

                                <h3 className="relative z-10 mono text-base font-bold text-foreground mb-3 tracking-wider uppercase">
                                    {ch.title}
                                </h3>
                                <p className="relative z-10 mono text-xs text-fg-secondary leading-[1.8] tracking-wider mb-6 flex-1">
                                    {ch.description}
                                </p>

                                {/* Protocol + Action */}
                                <div className="relative z-10 flex items-center justify-between pt-4 border-t border-border/30">
                                    <span className="mono text-[9px] text-fg-muted uppercase tracking-[0.15em]">{ch.protocol}</span>
                                    <a
                                        href={ch.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mono text-[10px] uppercase tracking-[0.1em] font-bold flex items-center gap-1.5 hover:text-foreground transition-colors"
                                        style={{ color: ch.accent }}
                                    >
                                        {ch.action}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>

                                {/* Left accent */}
                                <div
                                    className="absolute top-0 bottom-0 left-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{ backgroundColor: ch.accent }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Guidelines */}
                <div>
                    <h2 className="mono text-xs font-bold text-foreground uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                        <span className="w-4 h-[2px] bg-[var(--pipeline-neon-2)]"></span>
                        Communication Guidelines
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-border/50 p-[1px]">
                        {guidelines.map((g, i) => (
                            <div key={i} className="bg-bg-secondary p-6 group hover:bg-bg-tertiary transition-colors">
                                <div className="w-8 h-8 border border-border/50 flex items-center justify-center bg-background mb-5 group-hover:border-foreground/20 transition-colors">
                                    <g.icon className="w-4 h-4 text-fg-muted" strokeWidth={1.5} />
                                </div>
                                <h3 className="mono text-sm font-bold text-foreground mb-3 tracking-wider uppercase">
                                    {g.title}
                                </h3>
                                <p className="mono text-[10px] text-fg-secondary leading-[1.8] tracking-wider">
                                    {g.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Emergency Notice */}
                <div className="border border-[var(--pipeline-neon-1)]/30 bg-[var(--pipeline-neon-1)]/[0.03] p-6 md:p-8 mt-16">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="w-5 h-5 text-[var(--pipeline-neon-1)] shrink-0 mt-0.5" strokeWidth={1.5} />
                        <div>
                            <h3 className="mono text-xs font-bold text-foreground uppercase tracking-[0.2em] mb-3">
                                Critical Security Issues
                            </h3>
                            <p className="mono text-xs text-fg-secondary leading-[1.8] tracking-wider">
                                If you discover a vulnerability that could compromise user data, 
                                do not disclose it publicly. Contact us immediately via our security email. 
                                We follow a responsible disclosure policy and will credit researchers in our security advisories.
                            </p>
                        </div>
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
                    <span className="text-success">COMMS: ACTIVE</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1"><Database className="w-3 h-3" /> VAULT_SYNC: ACTIVE</span>
                    <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> PROTOCOL: v2.4.0</span>
                </div>
            </div>
        </div>
    );
}
