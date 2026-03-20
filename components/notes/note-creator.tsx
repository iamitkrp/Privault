"use client";

import { Image as ImageIcon, CheckSquare } from "lucide-react";

export function NoteCreator({
    onClick,
}: {
    onClick: () => void;
}) {
    return (
        <div className="w-full relative z-10 group">
            <div
                className="w-full bg-bg-secondary border shadow-sm transition-all rounded-lg overflow-hidden border-border/30 hover:border-border/50 hover:shadow-md cursor-text"
                onClick={onClick}
            >
                <div className="relative z-10 p-1">
                    <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-fg-secondary font-medium tracking-wide">Take a note...</span>
                        <div className="flex items-center gap-4 text-fg-muted">
                            <button className="hover:text-foreground transition-colors p-1 rounded-full hover:bg-foreground/5 shrink-0">
                                <CheckSquare className="w-5 h-5" />
                            </button>
                            <button className="hover:text-foreground transition-colors p-1 rounded-full hover:bg-foreground/5 shrink-0">
                                <ImageIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
