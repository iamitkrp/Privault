"use client";

import { Construction, Rocket } from "lucide-react";

type ComingSoonPanelProps = {
    toolName: string;
    toolIcon?: React.ReactNode;
};

export function ComingSoonPanel({ toolName, toolIcon }: ComingSoonPanelProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
            {/* Icon cluster */}
            <div className="relative mb-8">
                <div className="w-20 h-20 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--fg-muted)]">
                    <span className="scale-150">{toolIcon ?? <Construction className="w-8 h-8" />}</span>
                </div>
                {/* Pulsing ring */}
                <div className="absolute inset-0 rounded-full border border-[var(--border-secondary)] animate-ping opacity-20" />
            </div>

            {/* Tool name badge */}
            <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-[10px] tracking-widest uppercase text-[var(--fg-muted)] bg-[var(--bg-elevated)] border border-[var(--border-primary)] px-2 py-1 rounded-sm">
                    ON THE ROADMAP
                </span>
            </div>

            <h2 className="text-2xl font-bold text-[var(--fg-primary)] mb-2 tracking-tight">
                {toolName}
            </h2>
            <p className="text-[var(--fg-secondary)] text-sm max-w-sm leading-relaxed">
                This module is currently in development. It will be available in a future update of Privault.
            </p>

            {/* Decorative grid lines */}
            <div className="mt-10 flex items-center gap-3 text-[var(--fg-muted)]">
                <div className="h-px w-16 bg-[var(--border-primary)]" />
                <Rocket className="w-4 h-4" />
                <div className="h-px w-16 bg-[var(--border-primary)]" />
            </div>
            <p className="mt-3 font-mono text-[11px] text-[var(--fg-muted)] tracking-widest">
                PRIVAULT PERSONAL HQ
            </p>
        </div>
    );
}
