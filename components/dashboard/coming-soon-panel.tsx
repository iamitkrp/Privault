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
                <div className="w-20 h-20 border border-[#333] flex items-center justify-center text-gray-600">
                    <span>{toolIcon ?? <Construction className="w-8 h-8" />}</span>
                </div>
                <div className="absolute inset-0 border border-[#ff4500]/20 animate-ping opacity-30" />
            </div>

            {/* Badge */}
            <div className="mono text-[10px] tracking-widest uppercase text-[#ff4500] mb-4">
                ON_ROADMAP // COMING_SOON
            </div>

            <h2 className="text-3xl font-bold text-white mb-3 tracking-tighter">{toolName}</h2>
            <p className="mono text-xs text-gray-500 uppercase tracking-widest max-w-sm leading-relaxed">
                This module is currently in development and will be available in a future update.
            </p>

            {/* Decorative */}
            <div className="mt-10 flex items-center gap-3 text-gray-700">
                <div className="h-px w-16 bg-[#222]" />
                <Rocket className="w-4 h-4" />
                <div className="h-px w-16 bg-[#222]" />
            </div>
            <p className="mt-3 mono text-[10px] text-gray-600 tracking-widest uppercase">
                PRIVAULT PERSONAL HQ
            </p>
        </div>
    );
}
