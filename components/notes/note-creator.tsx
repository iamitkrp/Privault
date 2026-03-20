"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, CheckSquare, Palette } from "lucide-react";

// Soft aesthetic color palettes adapted for both dark and light modes natively via CSS variables or standard Tailwind
const COLORS = [
    { id: 'default', value: 'default', css: 'transparent', label: 'Default' },
    { id: 'red', value: 'red', css: 'rgba(239,68,68,0.1)', label: 'Red' },
    { id: 'blue', value: 'blue', css: 'rgba(59,130,246,0.1)', label: 'Blue' },
    { id: 'green', value: 'green', css: 'rgba(16,185,129,0.1)', label: 'Green' },
    { id: 'yellow', value: 'yellow', css: 'rgba(245,158,11,0.1)', label: 'Yellow' }
];

export function NoteCreator({
    onSave,
}: {
    onSave: (data: { title: string, content: string, color: string }) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [color, setColor] = useState("default");
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    // Click outside to collapse
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                handleCollapse();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [title, content, color]);

    const handleCollapse = () => {
        if (title.trim() || content.trim()) {
            onSave({ title, content, color });
            setTitle("");
            setContent("");
            setColor("default");
        }
        setIsExpanded(false);
    };

    // Auto-resize
    useEffect(() => {
        if (isExpanded && contentRef.current) {
            contentRef.current.style.height = 'auto';
            contentRef.current.style.height = Math.max(40, contentRef.current.scrollHeight) + 'px';
        }
    }, [content, isExpanded]);

    const selectedColorObj = COLORS.find(c => c.value === color);

    return (
        <div className="w-full relative z-40">
            <motion.div
                ref={containerRef}
                layout
                className={`w-full bg-bg-secondary border shadow-sm transition-all rounded-lg overflow-hidden ${
                    isExpanded ? "shadow-xl border-border/60" : "border-border/30 hover:border-border/50"
                }`}
            >
                {/* Simulated color background relying on overlay rather than solid color */}
                {color !== 'default' && (
                    <div 
                        className="absolute inset-0 pointer-events-none opacity-50 transition-colors duration-300"
                        style={{ backgroundColor: selectedColorObj?.css }}
                    />
                )}

                <div className="relative z-10 p-1">
                    {!isExpanded ? (
                        // Collapsed State
                        <div 
                            className="flex items-center justify-between px-4 py-3 cursor-text"
                            onClick={() => setIsExpanded(true)}
                        >
                            <span className="text-fg-secondary font-medium tracking-wide">Take a note...</span>
                            <div className="flex items-center gap-4 text-fg-muted">
                                <CheckSquare className="w-5 h-5 hover:text-foreground cursor-pointer transition-colors" />
                                <ImageIcon className="w-5 h-5 hover:text-foreground cursor-pointer transition-colors" />
                            </div>
                        </div>
                    ) : (
                        // Expanded State
                        <div className="flex flex-col">
                            <div className="px-4 pt-4 pb-2">
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-transparent text-lg font-bold text-foreground placeholder-fg-muted outline-none border-none ring-0"
                                />
                            </div>
                            <div className="px-4 pb-3">
                                <textarea
                                    ref={contentRef}
                                    autoFocus
                                    placeholder="Take a note..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full min-h-[60px] bg-transparent text-base text-fg-secondary placeholder-fg-muted outline-none border-none ring-0 resize-none leading-relaxed overflow-hidden"
                                />
                            </div>
                            <div className="flex items-center justify-between px-3 py-2">
                                <div className="flex gap-1 group relative">
                                    <button className="p-2 text-fg-muted hover:text-foreground hover:bg-foreground/5 rounded-full transition-colors">
                                        <Palette className="w-4 h-4" />
                                    </button>
                                    {/* Simple inline color picker */}
                                    <div className="absolute top-10 left-0 bg-bg-secondary border border-border shadow-xl rounded-lg p-2 flex gap-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                        {COLORS.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={(e) => { e.stopPropagation(); setColor(c.value); }}
                                                className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c.value ? 'border-foreground scale-110' : 'border-transparent hover:scale-110'}`}
                                                style={{ backgroundColor: c.id === 'default' ? 'var(--color-bg-secondary)' : c.css }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleCollapse(); }}
                                    className="px-5 py-1.5 text-sm font-semibold text-foreground hover:bg-foreground/5 rounded-md transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
