"use client";

import { VaultNote } from "@/types";
import { Plus, Trash2, Search, Lock, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useState } from "react";

export function NotesList({
    notes,
    activeNoteId,
    unlockedNotes = [],
    onSelectNote,
    onAddNote,
    onDeleteNote
}: {
    notes: VaultNote[];
    activeNoteId: string | null;
    unlockedNotes?: string[];
    onSelectNote: (n: VaultNote) => void;
    onAddNote: () => void;
    onDeleteNote: (id: string) => void;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (isCollapsed) {
        return (
            <section className="w-12 bg-background/30 backdrop-blur-sm border-r border-border flex flex-col items-center shrink-0 relative z-10 glass py-4 transition-all">
                <button onClick={() => setIsCollapsed(false)} className="p-2 mb-4 hover:bg-foreground/5 rounded text-fg-muted hover:text-foreground">
                    <ChevronRight className="w-4 h-4" />
                </button>
                <div className="flex flex-col gap-4 items-center w-full overflow-y-auto no-scrollbar">
                    {notes.map(note => (
                        <button key={note.id} onClick={() => { setIsCollapsed(false); onSelectNote(note); }} className={`w-8 h-8 flex items-center justify-center hover:bg-foreground/5 rounded transition-colors group relative ${activeNoteId === note.id ? 'text-foreground bg-foreground/5 border border-foreground/10' : 'text-fg-secondary hover:text-foreground'}`} title={note.decrypted?.title || "Untitled"}>
                            {note.is_locked ? <Lock className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </button>
                    ))}
                    <button onClick={() => { setIsCollapsed(false); onAddNote(); }} className="w-8 h-8 mt-4 flex items-center justify-center border border-dashed border-border rounded text-fg-muted hover:text-foreground hover:bg-foreground/5 transition-colors">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </section>
        );
    }

    return (
        <main className="w-96 bg-background/30 backdrop-blur-xl border-x border-border/50 flex flex-col relative z-30 transition-all shrink-0">
            {/* Header */}
            <div className="p-6 pb-2">
                <div className="flex flex-row items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        {/* Collapse button for mobile/responsive can go here, using it to collapse the pane */}
                        <button onClick={() => setIsCollapsed(true)} className="p-1 hover:bg-foreground/10 text-fg-secondary hover:text-foreground rounded transition-colors -ml-2">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Notes</h1>
                    </div>
                    <button onClick={onAddNote} className="bg-foreground/10 text-brand px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-foreground/15 transition-all outline outline-1 outline-border/50">
                        <Plus className="w-4 h-4" /> Create New
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 mb-4">
                    <button className="text-sm font-bold text-foreground border-b-2 border-brand pb-2">All</button>
                    <button className="text-sm font-medium text-fg-secondary pb-2 hover:text-foreground transition-colors">Reminder</button>
                </div>
            </div>

            {/* Notes List Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {notes.length === 0 && (
                     <div className="flex flex-col items-center justify-center p-8 text-center opacity-60 mt-10">
                         <div className="w-12 h-12 flex items-center justify-center mb-4 text-fg-secondary">
                             <Search className="w-6 h-6" />
                         </div>
                         <h3 className="text-[10px] font-bold tracking-widest text-fg-secondary uppercase mb-1">No Pages Found</h3>
                     </div>
                )}
                
                {notes.map(note => {
                    const isSelected = activeNoteId === note.id;
                    const isLocked = note.is_locked && !unlockedNotes.includes(note.id);
                    
                    const dateObj = new Date(note.updated_at);
                    const formattedDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

                    return (
                        <div 
                            key={note.id}
                            className={`group p-4 rounded-2xl transition-all cursor-pointer relative ${
                                isSelected 
                                    ? 'bg-foreground/5 shadow-sm border border-border/60 ring-1 ring-brand/10' 
                                    : 'hover:bg-foreground/[0.03] border border-transparent'
                            }`}
                            onClick={() => onSelectNote(note)}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[70%]">
                                    {(note.tags && note.tags.length > 0 ? note.tags : ['Untitled']).map((tag) => (
                                        <span key={tag} className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase whitespace-nowrap border border-border/50 shadow-sm ${isSelected ? 'bg-brand/10 text-brand' : 'bg-foreground/10 text-foreground'}`}>
                                            {tag}
                                        </span>
                                    ))}
                                    {isLocked && (
                                        <span className="px-2 py-0.5 bg-red-900/20 text-red-500 border border-red-500/20 text-[10px] font-bold rounded-full uppercase whitespace-nowrap flex items-center gap-1 shadow-sm">
                                            <Lock className="w-2.5 h-2.5" /> Secure
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-medium text-fg-muted whitespace-nowrap shrink-0">{formattedDate}</span>
                            </div>

                            <div className="flex justify-between items-start">
                                <h3 className={`text-sm font-bold mb-1 truncate flex-1 pr-4 ${isSelected ? 'text-foreground' : 'text-fg-secondary group-hover:text-foreground transition-colors'}`}>
                                    {isLocked ? "Encryption Active" : (note.decrypted?.title || "Untitled")}
                                </h3>
                                
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 text-fg-muted hover:bg-background transition-all shrink-0 bg-background/50 border border-border shadow-sm rounded-full -mt-1 -mr-1"
                                    title="Delete Note"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-xs text-fg-muted leading-relaxed line-clamp-2">
                                {isLocked ? "Decrypt to view contents." : ((note.decrypted?.content || "").replace(/<[^>]*>?/gm, '') || "No content...")}
                            </p>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
