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
        new Set(notes.map(n => n.tags && n.tags.length > 0 ? n.tags[0] : "Personal Notes"))
    ).filter(tag => tag !== "All" && tag !== "All Notes" && tag !== undefined) as string[];

    // Filtered Notes
    const filteredNotes = activeSection === "All" 
        ? notes 
        : notes.filter(n => (n.tags && n.tags.length > 0 ? n.tags[0] : "Personal Notes") === activeSection);

    const activeNote = notes.find(n => n.id === activeNoteId) || null;
    const isNoteLocked = activeNote?.is_locked && !unlockedNotes.includes(activeNote.id);

    const handleSaveNote = async (data: { title: string, content: string, color: string, is_locked?: boolean, id?: string }) => {
        if (!user) return;
        
        let tagsToSave = activeSection !== 'All' ? [activeSection] : [];
        if (data.id) {
            const result = await notesService.updateNote(
                data.id, 
                { title: data.title, content: data.content }, 
                { color: data.color, tags: tagsToSave, is_locked: data.is_locked }
            );
            if (result.success) {
                setNotes(prev => prev.map(n => n.id === result.data!.id ? result.data! : n));
            }
        } else {
            const result = await notesService.addNote(
                user.id, 
                { title: data.title, content: data.content }, 
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
        <div className="fixed inset-0 z-[100] flex h-screen w-full bg-[#0c0e12] text-[#f6f6fc] overflow-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
                .font-headline { font-family: 'Space Grotesk', sans-serif !important; }
                .font-body { font-family: 'Inter', sans-serif !important; }
                .font-mono { font-family: 'JetBrains Mono', monospace !important; }
                .font-label { font-family: 'Space Grotesk', sans-serif !important; }
                .grid-bg {
                    background-image: linear-gradient(to right, #46484d 1px, transparent 1px),
                                      linear-gradient(to bottom, #46484d 1px, transparent 1px);
                    background-size: 40px 40px;
                    opacity: 0.05;
                }
            `}</style>
            
            <div className="absolute inset-0 grid-bg pointer-events-none z-0"></div>

            {/* Pane 1: Global Navigation Sidebar */}
            <aside className="relative z-10 flex flex-col h-full py-8 bg-[#111318] border-r border-[#1d2025] w-64 shrink-0">
                <div className="px-6 mb-8">
                    <div className="text-lg font-bold text-[#a3e635] font-headline tracking-tighter uppercase">[[ SESSION_ACTIVE ]]</div>
                    <div className="text-xs font-mono opacity-50 mt-1 uppercase tracking-wider">// {user?.email?.split('@')[0] || "USER_01"}</div>
                </div>
                
                <nav className="flex-1 px-4 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#1d2025] text-[#a3e635] border-l-4 border-[#a3e635] font-label text-sm uppercase tracking-wider transition-all translate-x-1">
                        <FolderOpen className="w-4 h-4" />
                        Notebooks
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-[#f6f6fc] opacity-50 hover:bg-[#1d2025] hover:opacity-100 font-label text-sm uppercase tracking-wider transition-colors">
                        <Settings className="w-4 h-4" />
                        Settings
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-[#f6f6fc] opacity-50 hover:bg-[#1d2025] hover:opacity-100 font-label text-sm uppercase tracking-wider transition-colors">
                        <Archive className="w-4 h-4" />
                        Archive
                    </button>
                </nav>

                <div className="px-4 mb-6 relative group">
                    <button onClick={onBack} className="w-full bg-[#b8fd4b] py-3 font-label font-bold text-[#3d5e00] text-xs tracking-widest hover:opacity-90 transition-opacity uppercase">
                        GO_HOME &gt;
                    </button>
                </div>

                <div className="px-4 pt-4 border-t border-[#1d2025] space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-[#f6f6fc] opacity-50 hover:bg-[#1d2025] hover:opacity-100 font-label text-[10px] uppercase tracking-tighter transition-all">
                        <Terminal className="w-4 h-4" />
                        Security_Log
                    </button>
                    <button onClick={onBack} className="w-full flex items-center gap-3 px-4 py-2 text-[#f6f6fc] opacity-50 hover:bg-[#1d2025] hover:opacity-100 font-label text-[10px] uppercase tracking-tighter transition-all">
                        <LockIcon className="w-4 h-4" />
                        Lock_Vault
                    </button>
                </div>
            </aside>

            {/* Pane 2: Hierarchy & Navigation Pane */}
            <NotesSidebar 
                 sections={uniqueSections}
                 activeSection={activeSection}
                 onSelectSection={(s) => { setActiveSection(s); setActiveNoteId(null); }}
                 onAddSection={handleAddSection}
                 onBack={undefined}
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
                <div className="flex-1 w-full bg-[#0c0e12] h-full flex flex-col items-center justify-center p-8 relative isolate z-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,253,75,0.05)_0,transparent_50%)] pointer-events-none" />
                    <div className="max-w-md w-full bg-[#111318] border border-[#1d2025] p-8 rounded-none flex flex-col items-center text-center gap-6 z-10 shadow-2xl">
                        <div className="p-4 bg-[#1d2025] rounded-none border border-[#46484d] shadow-[0_0_15px_rgba(184,253,75,0.2)]">
                            <Lock className="w-8 h-8 text-[#b8fd4b] animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-headline tracking-tight text-[#f6f6fc] uppercase mb-2">Secure Payload Locked</h3>
                            <p className="text-sm font-body text-[#aaabb0]">
                                This sequence is locked using advanced cryptographic authentication. Verify your identity to decrypt.
                            </p>
                        </div>
                        <div className="w-full text-left font-body">
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
                     note={activeNoteId === 'new' ? ({ id: '', decrypted: { title: '', content: '' }, color: 'default', updated_at: new Date().toISOString(), tags: activeSection !== 'All' ? [activeSection] : [] } as VaultNote) : activeNote}
                     onSave={handleSaveNote}
                />
            )}
        </div>
    );
}
