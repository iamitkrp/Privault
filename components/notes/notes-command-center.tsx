"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { NotesService } from "@/services/notes.service";
import { VaultNote } from "@/types";
import { NotesList } from "./notes-grid"; // Repurposed into NotesList
import { NoteEditor } from "./note-editor";
import { OTPGate } from "@/components/auth/otp-gate";
import { Lock, FolderOpen, Settings, Archive, Terminal, Lock as LockIcon } from "lucide-react";
import { NotesSidebar } from "./notes-sidebar";

export function NotesCommandCenter({
    onBack,
}: {
    onBack: () => void;
}) {
    const { user, supabaseClient } = useAuth();
    const [notes, setNotes] = useState<VaultNote[]>([]);
    
    // States
    const [activeSection, setActiveSection] = useState<string>("All");
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [unlockedNotes, setUnlockedNotes] = useState<string[]>([]);

    const [addedSections, setAddedSections] = useState<string[]>([]);

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
        new Set([
            ...notes.map(n => n.tags && n.tags.length > 0 ? n.tags[0] : "Untitled"),
            ...addedSections,
            ...(activeSection !== "All" ? [activeSection] : [])
        ])
    ).filter(tag => tag !== "All" && tag !== "All Notes" && tag !== undefined) as string[];

    // Filtered Notes
    const filteredNotes = activeSection === "All" 
        ? notes 
        : notes.filter(n => (n.tags && n.tags.length > 0 ? n.tags[0] : "Untitled") === activeSection);

    const activeNote = notes.find(n => n.id === activeNoteId) || {
        id: '',
        decrypted: { title: '', content: '' },
        color: 'default',
        updated_at: new Date().toISOString(),
        tags: activeSection !== 'All' ? [activeSection] : ["Untitled"]
    } as VaultNote;
    const isNoteLocked = activeNote?.is_locked && !unlockedNotes.includes(activeNote.id);

    const handleSaveNote = async (data: { title: string, content: string, color: string, is_locked?: boolean, id?: string }) => {
        if (!user) return;
        
        let tagsToSave = activeSection !== 'All' ? [activeSection] : [];
        const finalTitle = data.title.trim() ? data.title : "Untitled Note";

        if (data.id && data.id !== 'new') {
            const result = await notesService.updateNote(
                data.id, 
                { title: finalTitle, content: data.content }, 
                { color: data.color, tags: tagsToSave, is_locked: data.is_locked }
            );
            if (result.success) {
                setNotes(prev => prev.map(n => n.id === result.data!.id ? result.data! : n));
            }
        } else {
            const result = await notesService.addNote(
                user.id, 
                { title: finalTitle, content: data.content }, 
                { color: data.color, tags: tagsToSave, is_locked: data.is_locked }
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
            const sectionName = name.trim();
            setAddedSections(prev => {
                if (!prev.includes(sectionName)) return [...prev, sectionName];
                return prev;
            });
            // Because our sections are derived from note tags, creating a section requires creating an empty note with that tag
            setActiveSection(sectionName);
            setActiveNoteId(null);
        }
    };

    const handleRenameSection = async (oldName: string, newName: string) => {
        if (!newName || !newName.trim() || oldName === newName.trim()) return;
        const finalName = newName.trim();

        if (addedSections.includes(oldName)) {
            setAddedSections(prev => prev.map(s => s === oldName ? finalName : s));
        }

        if (activeSection === oldName) {
            setActiveSection(finalName);
        }

        const notesToUpdate = notes.filter(n => (n.tags && n.tags.length > 0 ? n.tags[0] : "Untitled") === oldName);
        
        setNotes(prev => prev.map(n => {
            if ((n.tags && n.tags.length > 0 ? n.tags[0] : "Untitled") === oldName) {
                return { ...n, tags: [finalName, ...(n.tags?.slice(1) || [])] };
            }
            return n;
        }));

        for (const note of notesToUpdate) {
            await notesService.updateNote(
                note.id,
                { title: note.decrypted?.title || 'Untitled Note', content: note.decrypted?.content || '' },
                { color: note.color, tags: [finalName, ...(note.tags?.slice(1) || [])], is_locked: note.is_locked }
            );
        }
    };

    const handleAddNote = () => {
        setActiveNoteId(null);
    };

    return (
        <div className="fixed inset-0 z-[100] flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
            <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background/90" />
            </div>

            {/* Pane 1: Global Navigation Sidebar */}
            <aside className="relative z-10 flex flex-col h-full py-8 bg-background/50 backdrop-blur-md border-r border-border w-64 shrink-0">
                <div className="px-6 mb-8">
                    <div className="text-sm font-bold tracking-widest uppercase text-foreground mb-1">Session Active</div>
                    <div className="text-xs mono text-fg-muted uppercase tracking-wider">{user?.email?.split('@')[0] || "USER_01"}</div>
                </div>
                
                <nav className="flex-1 px-4 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-foreground/5 text-foreground border-l-2 border-foreground text-xs uppercase tracking-widest transition-all glass">
                        <FolderOpen className="w-4 h-4" />
                        Notebooks
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-fg-secondary hover:bg-foreground/5 hover:text-foreground text-xs uppercase tracking-widest transition-colors rounded-sm">
                        <Settings className="w-4 h-4" />
                        Settings
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-fg-secondary hover:bg-foreground/5 hover:text-foreground text-xs uppercase tracking-widest transition-colors rounded-sm">
                        <Archive className="w-4 h-4" />
                        Archive
                    </button>
                </nav>

                <div className="px-4 mb-6">
                    <button onClick={onBack} className="w-full bg-foreground text-background py-3 font-bold text-xs tracking-widest hover:opacity-90 transition-opacity uppercase">
                        Back to Vault
                    </button>
                </div>

                <div className="px-4 pt-4 border-t border-border space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-fg-muted hover:bg-foreground/5 hover:text-foreground text-[10px] uppercase tracking-wider transition-all rounded-sm">
                        <Terminal className="w-4 h-4" />
                        Activity Log
                    </button>
                    <button onClick={onBack} className="w-full flex items-center gap-3 px-4 py-2 text-fg-muted hover:bg-foreground/5 hover:text-foreground text-[10px] uppercase tracking-wider transition-all rounded-sm">
                        <LockIcon className="w-4 h-4" />
                        Lock Vault
                    </button>
                </div>
            </aside>

            {/* Pane 2: Hierarchy & Navigation Pane */}
            <NotesSidebar 
                 sections={uniqueSections}
                 activeSection={activeSection}
                 onSelectSection={(s) => { setActiveSection(s); setActiveNoteId(null); }}
                 onAddSection={handleAddSection}
                 onRenameSection={handleRenameSection}
            />

            {/* Pane 3: Pages Pane */}
            <NotesList 
                 notes={filteredNotes} 
                 activeNoteId={activeNoteId}
                 unlockedNotes={unlockedNotes}
                 onSelectNote={(note: VaultNote) => setActiveNoteId(note.id)}
                 onAddNote={handleAddNote}
                 onDeleteNote={handleDeleteNote}
            />

            {/* Pane 4: Editor Canvas Area */}
            {isNoteLocked ? (
                <div className="flex-1 w-full bg-background h-full flex flex-col items-center justify-center p-8 relative isolate z-10 glass">
                    <div className="max-w-md w-full glass border border-border p-8 flex flex-col items-center text-center gap-6 z-10 relative">
                        {/* Glowing corner accent */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-foreground/[0.02] blur-xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-foreground/[0.05] transition-colors"></div>
                        
                        <div className="p-4 bg-bg-secondary border border-border">
                            <Lock className="w-8 h-8 text-foreground" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold tracking-tight text-foreground uppercase mb-2">Note Locked</h3>
                            <p className="text-sm text-fg-secondary">
                                This note is locked. Verify your identity to encrypt and view the contents.
                            </p>
                        </div>
                        <div className="w-full text-left">
                            <OTPGate 
                                purpose="vault_access"
                                actionLabel="Send Unlock Code"
                                description=""
                                onVerified={() => {
                                    if (activeNote) {
                                        setUnlockedNotes(prev => [...prev, activeNote.id]);
                                    }
                                }}
                                onCancel={() => setActiveNoteId(null)}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <NoteEditor
                     note={activeNote}
                     onSave={handleSaveNote}
                />
            )}
        </div>
    );
}
