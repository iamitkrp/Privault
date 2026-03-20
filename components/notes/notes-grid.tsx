"use client";

import { VaultNote } from "@/types";
import { Trash2, FileText } from "lucide-react";
import { motion } from "framer-motion";

export function NotesGrid({
    notes,
    onEdit,
    onDelete,
}: {
    notes: VaultNote[];
    onEdit: (note: VaultNote) => void;
    onDelete: (id: string) => void;
}) {
    if (notes.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-bg-secondary border border-border border-dashed relative overflow-hidden mt-8 max-w-3xl mx-auto"
            >
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-border-secondary" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-border-secondary" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-border-secondary" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-border-secondary" />

                <div className="w-14 h-14 bg-foreground/5 border border-foreground/10 text-foreground flex items-center justify-center mx-auto mb-5">
                    <FileText className="w-5 h-5" />
                </div>
                <h3 className="mono text-xs font-bold tracking-widest text-foreground uppercase mb-2">No Notes Found</h3>
                <p className="mono text-[10px] text-fg-muted tracking-widest uppercase">
                    Your secure workspace is empty. Create a new note.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {notes.map((note, index) => (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    key={note.id}
                    onClick={() => onEdit(note)}
                    className="break-inside-avoid relative group border border-border/40 glass p-6 hover:border-foreground/30 transition-all cursor-pointer overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-xl"
                >
                    {/* Background color tint if not default */}
                    {note.color !== 'default' && (
                        <div className="absolute inset-0 opacity-10" style={{ backgroundColor: note.color }}></div>
                    )}
                    
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                        <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} className="p-1.5 bg-background/80 glass hover:bg-error/20 text-fg-muted hover:text-error transition-colors rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="relative z-10 top-0">
                        <h3 className="text-lg font-bold mb-3 pr-10 text-foreground leading-tight tracking-tight break-words">
                            {note.decrypted.title || "Untitled"}
                        </h3>
                        <div className="text-sm text-fg-secondary whitespace-pre-wrap leading-relaxed break-words font-sans line-clamp-[12]">
                            {note.decrypted.content}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
