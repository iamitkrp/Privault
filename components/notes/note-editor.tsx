"use client";

import { useState, useRef, useEffect } from "react";
import { VaultNote } from "@/types";
import { motion } from "framer-motion";
import { X, Check, Palette } from "lucide-react";

// The premium elegant colors for white/glass mode
const COLORS = [
    { id: 'default', value: 'default', css: 'transparent', label: 'Default' },
    { id: 'red', value: '#fee2e2', css: '#fee2e2', label: 'Red' },
    { id: 'blue', value: '#dbeafe', css: '#dbeafe', label: 'Blue' },
    { id: 'green', value: '#d1fae5', css: '#d1fae5', label: 'Green' },
    { id: 'yellow', value: '#fef3c7', css: '#fef3c7', label: 'Yellow' }
];

export function NoteEditor({
    note,
    onSave,
    onClose
}: {
    note?: VaultNote;
    onSave: (data: { title: string, content: string, color: string, id?: string }) => void;
    onClose: () => void;
}) {
    const [title, setTitle] = useState(note?.decrypted?.title || "");
    const [content, setContent] = useState(note?.decrypted?.content || "");
    const [color, setColor] = useState(note?.color || "default");
    const contentRef = useRef<HTMLTextAreaElement>(null);
    
    const handleSave = () => {
        if (!title.trim() && !content.trim()) return;
        onSave({ title, content, color, id: note?.id });
    };

    // Auto-resize textarea seamlessly
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.style.height = 'auto';
            contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
        }
    }, [content]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/60 backdrop-blur-md"
        >
            <div className="absolute inset-0 cursor-pointer" onClick={onClose} />
            
            <motion.div
                initial={{ scale: 0.98, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.98, opacity: 0, y: 15 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-2xl bg-bg-secondary/90 backdrop-blur-3xl border border-border/50 shadow-2xl z-10 flex flex-col max-h-[85vh] overflow-hidden"
            >
                {/* Subtle environmental color tint */}
                {color !== 'default' && (
                    <div 
                        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply dark:mix-blend-screen transition-colors duration-500" 
                        style={{ backgroundColor: color }}
                    />
                )}

                {/* Header Row */}
                <div className="px-8 flex items-start justify-between relative z-10 pt-8 pb-4">
                    <input 
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Untitled Note"
                        className="w-full bg-transparent text-3xl sm:text-4xl font-bold text-foreground placeholder-fg-muted/30 focus:outline-none tracking-tight font-sans border-none ring-0 outline-none"
                    />
                    <button 
                        onClick={onClose} 
                        className="ml-4 p-2 text-fg-muted hover:text-foreground hover:bg-foreground/5 transition-all rounded-full shrink-0 mt-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="px-8 py-2 flex-1 overflow-y-auto relative z-10">
                    <textarea
                        ref={contentRef}
                        autoFocus
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start typing your secure note here..."
                        className="w-full min-h-[40vh] bg-transparent text-lg text-fg-secondary placeholder-fg-muted/40 focus:outline-none focus:ring-0 border-none resize-none leading-relaxed font-sans"
                    />
                </div>

                {/* Premium Footer with mono tracking typography */}
                <div className="px-8 py-5 border-t border-border/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-4 relative z-10 bg-background/50 backdrop-blur-md">
                    
                    {/* Minimal Color Swatches */}
                    <div className="flex items-center gap-4">
                        <Palette className="w-3.5 h-3.5 text-fg-muted opacity-60" />
                        <div className="flex gap-2.5">
                            {COLORS.map(c => (
                                <button
                                    key={c.id}
                                    title={c.label}
                                    onClick={() => setColor(c.value)}
                                    className={`w-4 h-4 rounded-full transition-all duration-300 relative ${color === c.value ? 'scale-125 shadow-sm' : 'hover:scale-110 opacity-60 hover:opacity-100'}`}
                                    style={{ 
                                        backgroundColor: c.id === 'default' ? 'transparent' : c.css,
                                        border: c.id === 'default' 
                                            ? '1px dashed var(--color-fg-muted)' 
                                            : `1px solid ${color === c.value ? 'rgba(0,0,0,0.1)' : 'transparent'}`
                                    }}
                                >
                                    {color === c.value && (
                                        <div className="absolute inset-0 rounded-full border border-foreground/10" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={!title.trim() && !content.trim()}
                        className="group flex items-center justify-center gap-2 bg-foreground hover:opacity-90 disabled:opacity-30 disabled:hover:opacity-30 transition-all duration-300 px-7 py-3 shadow-[0_4px_15px_rgba(0,0,0,0.05)]"
                    >
                        <span className="mono text-[10px] font-bold text-background uppercase tracking-widest flex items-center gap-2">
                            <Check className="w-3.5 h-3.5" />
                            {note ? 'Save Changes' : 'Secure Save'}
                        </span>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
