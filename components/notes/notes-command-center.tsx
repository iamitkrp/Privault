"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { NotesService } from "@/services/notes.service";
import { VaultNote } from "@/types";
import { LayoutDashboard, ChevronLeft, Plus, RefreshCw, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotesGrid } from "./notes-grid";
import { NoteEditor } from "./note-editor";

export function NotesCommandCenter({
    onBack,
}: {
    onBack: () => void;
}) {
    const { user, supabaseClient } = useAuth();
    const [notes, setNotes] = useState<VaultNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingNote, setEditingNote] = useState<VaultNote | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const notesService = new NotesService(supabaseClient);

    const loadNotes = async () => {
        if (!user) return;
        setLoading(true);
        const result = await notesService.getNotes();
        if (result.success) {
            setNotes(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleSaveNote = async (noteParam: { title: string, content: string, color: string, id?: string }) => {
        if (!user) return;
        
        if (noteParam.id) {
            const result = await notesService.updateNote(
                noteParam.id, 
                { title: noteParam.title, content: noteParam.content }, 
                { color: noteParam.color }
            );
            if (result.success) {
                setNotes(prev => prev.map(n => n.id === result.data!.id ? result.data! : n));
            }
        } else {
            const result = await notesService.addNote(
                user.id, 
                { title: noteParam.title, content: noteParam.content }, 
                { color: noteParam.color }
            );
            if (result.success) {
                setNotes(prev => [result.data!, ...prev]);
            }
        }
        setEditingNote(null);
        setIsCreating(false);
    };

    const handleDeleteNote = async (id: string) => {
        if (!confirm("Are you sure you want to securely delete this note?")) return;
        const result = await notesService.deleteNote(id);
        if (result.success) {
            setNotes(prev => prev.filter(n => n.id !== id));
        }
    };

    return (
        <div className="relative w-full min-h-[calc(100vh-80px)] text-foreground overflow-hidden">
            <div className="relative z-10 flex flex-col w-full h-full">
                
                {/* ─── HERO HEADER ─── */}
                <div className="px-6 md:px-12 pt-4 pb-0">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                            <button
                                onClick={onBack}
                                className="flex items-center gap-1.5 text-xs text-fg-muted hover:text-foreground mb-5 transition-colors group mono uppercase tracking-widest"
                            >
                                <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                                <LayoutDashboard className="w-3 h-3" />
                                Dashboard
                            </button>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-[0.95] uppercase">
                                Secure
                            </h1>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tighter text-fg-muted leading-[0.95] uppercase">
                                [Notes.]
                            </h2>
                        </motion.div>
                        
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
                             <div className="flex items-center gap-4">
                                  <div className="mono text-[10px] text-fg-muted tracking-widest uppercase flex items-center gap-2 border border-border-secondary px-3 py-1.5 bg-background/50 h-9 hidden sm:flex">
                                      <Activity className="w-3 h-3 text-success" />
                                      <span>[[ E2EE_ACTIVE ]]</span>
                                  </div>
                                  <button onClick={loadNotes} className="mono text-[10px] text-fg-muted tracking-widest uppercase flex items-center justify-center gap-2 border border-border hover:bg-fg-primary/5 transition-colors px-4 h-9 bg-background/50">
                                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                                      <span className="hidden sm:inline">Sync</span>
                                  </button>
                                  <button onClick={() => setIsCreating(true)} className="mono text-[10px] text-background bg-foreground tracking-widest uppercase flex items-center gap-2 hover:opacity-90 transition-colors px-4 h-9 font-bold">
                                      <Plus className="w-3.5 h-3.5" />
                                      New Note
                                  </button>
                             </div>
                        </motion.div>
                    </div>
                </div>

                <div className="border-t border-border" />

                <div className="flex-1 w-full flex flex-col min-h-0">
                     <div className="flex-1 px-6 md:px-12 py-8 overflow-y-auto min-h-0">
                         {loading ? (
                             <div className="flex justify-center py-20">
                                  <div className="flex items-center gap-3 mono text-xs text-fg-muted uppercase tracking-widest">
                                       <div className="w-2 h-2 bg-fg-muted animate-pulse" />
                                       Decrypting Notes...
                                  </div>
                             </div>
                         ) : (
                             <NotesGrid 
                                 notes={notes} 
                                 onEdit={(note: VaultNote) => setEditingNote(note)}
                                 onDelete={handleDeleteNote}
                             />
                         )}
                     </div>
                </div>

                <AnimatePresence>
                    {(isCreating || editingNote) && (
                        <NoteEditor
                             note={editingNote || undefined}
                             onSave={handleSaveNote}
                             onClose={() => {
                                 setIsCreating(false);
                                 setEditingNote(null);
                             }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
