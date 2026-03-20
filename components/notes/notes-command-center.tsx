"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { NotesService } from "@/services/notes.service";
import { VaultNote } from "@/types";
import { NotesList } from "./notes-grid"; // Repurposed into NotesList
import { NoteEditor } from "./note-editor";
import { NotesSidebar } from "./notes-sidebar";

export function NotesCommandCenter({
    onBack,
}: {
    onBack: () => void;
}) {
    const { user, supabaseClient } = useAuth();
    const [notes, setNotes] = useState<VaultNote[]>([]);
    
    // 3-Pane Navigation States
    const [activeSection, setActiveSection] = useState<string>("All");
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

    const notesService = new NotesService(supabaseClient);

    const loadNotes = async () => {
        if (!user) return;
        const result = await notesService.getNotes();
        if (result.success) {
            setNotes(result.data);
        }
    };

    useEffect(() => {
        loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Derived Sections
    // Fallback: If no tags exist on a note, map it under "Uncategorized". We filter by tags[0] for MVP section tracking.
    const uniqueSections = Array.from(
        new Set(notes.map(n => n.tags && n.tags.length > 0 ? n.tags[0] : "All Notes"))
    ).filter(tag => tag !== "All" && tag !== "All Notes" && tag !== undefined) as string[];

    // Filtered Notes
    const filteredNotes = activeSection === "All" 
        ? notes 
        : notes.filter(n => (n.tags && n.tags.length > 0 ? n.tags[0] : "All Notes") === activeSection);

    const activeNote = notes.find(n => n.id === activeNoteId) || null;

    const handleSaveNote = async (data: { title: string, content: string, color: string, id?: string }) => {
        if (!user) return;
        
        let tagsToSave = activeSection !== 'All' ? [activeSection] : [];
        if (data.id) {
            const result = await notesService.updateNote(
                data.id, 
                { title: data.title, content: data.content }, 
                { color: data.color, tags: tagsToSave }
            );
            if (result.success) {
                setNotes(prev => prev.map(n => n.id === result.data!.id ? result.data! : n));
            }
        } else {
            const result = await notesService.addNote(
                user.id, 
                { title: data.title, content: data.content }, 
                { color: data.color, tags: tagsToSave }
            );
            if (result.success) {
                setNotes(prev => [result.data!, ...prev]);
                setActiveNoteId(result.data!.id);
            }
        }
    };

    const handleDeleteNote = async (id: string) => {
        if (!confirm("Are you sure you want to securely delete this page?")) return;
        const result = await notesService.deleteNote(id);
        if (result.success) {
            setNotes(prev => prev.filter(n => n.id !== id));
            if (activeNoteId === id) setActiveNoteId(null);
        }
    };

    const handleAddSection = (name: string) => {
        if (name && name.trim().length > 0) {
            // Because our sections are derived from note tags, creating a section requires creating an empty note with that tag
            setActiveSection(name.trim());
            setActiveNoteId(null);
        }
    };

    const handleAddNote = () => {
        setActiveNoteId(null);
        // By setting activeNoteId to a dummy 'new' it mounts the editor empty
        // For our flow right now, triggering an empty state triggers NoteEditor to "create a new page" mode
        setTimeout(() => setActiveNoteId('new'), 10);
    };

    return (
        <div className="w-full flex h-[calc(100vh-80px)] bg-background text-foreground overflow-hidden">
            {/* Left Sidebar (Sections Pane) */}
            <NotesSidebar 
                 sections={uniqueSections}
                 activeSection={activeSection}
                 onSelectSection={(s) => { setActiveSection(s); setActiveNoteId(null); }}
                 onAddSection={handleAddSection}
                 onBack={onBack}
            />

            {/* Middle List (Pages Pane) */}
            <NotesList 
                 notes={filteredNotes} 
                 activeNoteId={activeNoteId}
                 onSelectNote={(note: VaultNote) => setActiveNoteId(note.id)}
                 onAddNote={handleAddNote}
                 onDeleteNote={handleDeleteNote}
            />

            {/* Right Editor Pane */}
            <NoteEditor
                 note={activeNoteId === 'new' ? ({ id: '', decrypted: { title: '', content: '' }, color: 'default', updated_at: new Date().toISOString() } as VaultNote) : activeNote}
                 onSave={handleSaveNote}
            />
        </div>
    );
}

