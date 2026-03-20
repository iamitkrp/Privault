"use client";

import { VaultNote } from "@/types";
import { Plus, Trash2, Search } from "lucide-react";

export function NotesList({
    notes,
    activeNoteId,
    onSelectNote,
    onAddNote,
    onDeleteNote
}: {
    notes: VaultNote[];
    activeNoteId: string | null;
    onSelectNote: (n: VaultNote) => void;
    onAddNote: () => void;
    onDeleteNote: (id: string) => void;
}) {
    return (
        <div className="w-[320px] shrink-0 h-full flex flex-col border-r border-border/20 bg-background/50 relative">
             {/* Pane Header */}
             <div className="h-16 flex items-center justify-between px-6 border-b border-border/10 shrink-0 bg-background/80 backdrop-blur-md z-10 w-full">
                 <span className="font-bold text-foreground tracking-tight text-sm uppercase">Pages</span>
                 <button 
                     onClick={onAddNote} 
                     className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all"
                 >
                     <Plus className="w-3.5 h-3.5" />
                     New Page
                 </button>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-0 no-scrollbar">
                 {notes.length === 0 && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center opacity-60">
                         <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mb-4 border border-border/50">
                             <Search className="w-6 h-6 text-fg-muted" />
                         </div>
                         <h3 className="text-sm font-bold text-foreground mb-1">No Pages Found</h3>
                         <p className="text-xs text-fg-secondary">This section is currently completely empty.</p>
                     </div>
                 )}
                 {notes.map(note => {
                     const isSelected = activeNoteId === note.id;
                     return (
                         <div 
                             key={note.id}
                             className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                                 isSelected 
                                     ? 'bg-background shadow-lg border-brand/40 ring-1 ring-brand/20 scale-100' 
                                     : 'bg-background/40 border-border/30 hover:bg-background hover:shadow-md hover:border-foreground/20 scale-[0.98]'
                             }`}
                             onClick={() => onSelectNote(note)}
                         >
                             <div className="flex items-start justify-between gap-2">
                                 <h4 className={`text-sm tracking-wide truncate pr-2 ${isSelected ? 'font-bold text-foreground' : 'font-semibold text-fg-secondary group-hover:text-foreground'}`}>
                                     {note.decrypted.title || "Untitled Page"}
                                 </h4>
                                 
                                 <button 
                                     onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                                     className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-error/10 hover:text-error text-fg-muted rounded-md transition-all shrink-0 -mt-1 -mr-1"
                                 >
                                     <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                             </div>
                             
                             <p className="text-xs text-fg-muted mt-2 truncate font-sans">
                                 {note.decrypted.content || "Empty content..."}
                             </p>
                             
                             <div className="mt-3 text-[10px] font-mono text-fg-muted/60 uppercase tracking-widest">
                                 {new Date(note.updated_at).toLocaleDateString()}
                             </div>
                         </div>
                     );
                 })}
             </div>
        </div>
    );
}
