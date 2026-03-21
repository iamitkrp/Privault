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
        <section className="w-72 bg-background/30 backdrop-blur-sm border-r border-border flex flex-col shrink-0 relative z-10 glass transition-all">
             {/* Pane Header */}
             <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0">
                 <span className="text-[10px] font-bold tracking-widest text-fg-muted uppercase">Pages</span>
                 <button onClick={() => setIsCollapsed(true)} className="p-1 hover:bg-foreground/5 rounded text-fg-muted hover:text-foreground transition-colors -mr-2">
                    <ChevronLeft className="w-4 h-4" />
                 </button>
             </div>

             <div className="flex-1 overflow-y-auto no-scrollbar">
                 {notes.length === 0 && (
                     <div className="flex flex-col items-center justify-center p-8 text-center opacity-60 mt-10">
                         <div className="w-12 h-12 flex items-center justify-center mb-4 text-fg-muted">
                             <Search className="w-6 h-6" />
                         </div>
                         <h3 className="text-[10px] font-bold tracking-widest text-fg-secondary uppercase mb-1">No Pages Found</h3>
                     </div>
                 )}
                 {notes.map(note => {
                     const isSelected = activeNoteId === note.id;
                     const isLocked = note.is_locked && !unlockedNotes.includes(note.id);
                     
                     // Format date like Stitch design: 2024.05.12 - 09:42
                     const dateStr = new Date(note.updated_at).toLocaleString('en-US', {
                         year: 'numeric', month: '2-digit', day: '2-digit',
                         hour: '2-digit', minute: '2-digit', hour12: false
                     });
                     // M/D/YYYY, HH:MM
                     const [dPart, tPart] = dateStr.split(', ');
                     const [m, d, y] = (dPart || "01/01/2024").split('/');
                     const finalDate = `${y}.${m}.${d} - ${tPart}`;

                     return (
                         <div 
                             key={note.id}
                             className={`group relative p-6 border-b border-border/50 cursor-pointer transition-all ${
                                 isSelected 
                                     ? 'bg-foreground/5 border-r-2 border-foreground' 
                                     : 'hover:bg-foreground/5'
                             }`}
                             onClick={() => onSelectNote(note)}
                         >
                             <div className={`text-[10px] mono mb-2 uppercase tracking-widest ${isSelected ? 'text-foreground' : 'text-fg-muted'}`}>
                                 {finalDate}
                             </div>
                             
                             <div className="flex items-start justify-between gap-2 mb-2">
                                 <h3 className={`leading-tight flex items-center gap-1.5 ${isSelected ? 'text-foreground font-semibold' : 'text-foreground/80 font-medium'}`}>
                                     {isLocked && <Lock className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-foreground' : 'text-fg-secondary'}`} />}
                                     {isLocked ? "Secure Note" : (note.decrypted?.title || "Untitled")}
                                 </h3>
                                 
                                 <button 
                                     onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                                     className="p-1 opacity-0 group-hover:opacity-100 hover:text-rose-400 text-fg-secondary transition-all shrink-0 -mt-1 -mr-1"
                                 >
                                     <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                             </div>
                             
                             <p className={`text-xs line-clamp-2 leading-relaxed ${isSelected ? 'text-fg-secondary' : 'text-fg-muted'}`}>
                                 {isLocked ? "Encryption algorithm active. Decrypt to view contents." : ((note.decrypted?.content || "").replace(/<[^>]*>?/gm, '') || "No content...")}
                             </p>
                         </div>
                     );
                 })}
             </div>

             {/* Bottom Action Area matching Stitch */}
             <div className="p-4 bg-background/50 shrink-0 border-t border-border">
                <button 
                    onClick={onAddNote}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-border text-fg-secondary hover:text-foreground hover:bg-foreground/5 transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer group"
                >
                    <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> New Page
                </button>
             </div>
        </section>
    );
}
