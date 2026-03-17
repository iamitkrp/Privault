"use client";

import { Construction, Rocket } from "lucide-react";

type ComingSoonPanelProps = {
    toolName: string;
    toolIcon?: React.ReactNode;
};

export function ComingSoonPanel({ toolName, toolIcon }: ComingSoonPanelProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
            {/* Icon */}
            <div className="relative mb-8">
                <div className="w-20 h-20 border border-border-secondary flex items-center justify-center text-fg-muted">
                    <span>{toolIcon ?? <Construction className="w-8 h-8" />}</span>
                </div>

            </div>

            {/* Badge */}
            <div className="mono text-[10px] tracking-widest uppercase text-success mb-4">
                ON_ROADMAP // COMING_SOON
            </div>

            <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tighter">{toolName}</h2>
            <p className="mono text-xs text-fg-muted uppercase tracking-widest max-w-sm leading-relaxed">
                This module is currently in development and will be available in a future update.
            </p>

            {/* Decorative */}
            <div className="mt-10 flex items-center gap-3 text-fg-secondary">
                <div className="h-px w-16 bg-border" />
                <Rocket className="w-4 h-4" />
                <div className="h-px w-16 bg-border" />
            </div>
            <p className="mt-3 mono text-[10px] text-fg-muted tracking-widest uppercase">
                PRIVAULT PERSONAL HQ
            </p>
        </div>
    );
}
