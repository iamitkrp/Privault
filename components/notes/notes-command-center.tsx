"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { NotesService } from "@/services/notes.service";
import { VaultNote } from "@/types";
import { RefreshCw } from "lucide-react";
import { NotesGrid } from "./notes-grid";
import { NoteEditor } from "./note-editor";
import { NotesSidebar } from "./notes-sidebar";
import { NoteCreator } from "./note-creator";
import { AnimatePresence } from "framer-motion";

export function NotesCommandCenter({
    onBack,
}: {
    onBack: () => void;
}) {
    const { user, supabaseClient } = useAuth();
    const [notes, setNotes] = useState<VaultNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingNote, setEditingNote] = useState<VaultNote | null>(null);

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

    const handleSaveNote = async (data: { title: string, content: string, color: string, id?: string }) => {
        if (!user) return;
        
        if (data.id) {
            const result = await notesService.updateNote(
                data.id, 
                { title: data.title, content: data.content }, 
                { color: data.color }
            );
            if (result.success) {
                setNotes(prev => prev.map(n => n.id === result.data!.id ? result.data! : n));
            }
        } else {
            const result = await notesService.addNote(
                user.id, 
                { title: data.title, content: data.content }, 
                { color: data.color }
            );
            if (result.success) {
                setNotes(prev => [result.data!, ...prev]);
            }
        }
        setEditingNote(null);
    };

    const handleDeleteNote = async (id: string) => {
        if (!confirm("Are you sure you want to securely delete this note?")) return;
        const result = await notesService.deleteNote(id);
        if (result.success) {
            setNotes(prev => prev.filter(n => n.id !== id));
        }
    };

    return (
        <div className="w-full flex h-[calc(100vh-80px)] bg-background text-foreground overflow-hidden">
            {/* Left Sidebar */}
            <NotesSidebar onBack={onBack} />

            {/* Grid & Creator Area */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 w-full">
                <div className="max-w-[800px] mx-auto w-full flex flex-col items-center">
                    
                    {/* Inline Creator */}
                    <div className="w-full max-w-[600px] mb-12">
                        <NoteCreator onSave={handleSaveNote} />
                    </div>
                    
                    {/* Notes Grid Display */}
                    <div className="w-full">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <RefreshCw className="w-6 h-6 animate-spin text-fg-muted" />
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
            </div>

            <AnimatePresence>
                {editingNote && (
                    <NoteEditor
                        note={editingNote}
                        onSave={handleSaveNote}
                        onClose={() => setEditingNote(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

