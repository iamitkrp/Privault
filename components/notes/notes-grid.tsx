"use client";

import { VaultNote } from "@/types";
import { Plus, Trash2, Search, Lock } from "lucide-react";

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
    return (
        <section className="w-72 bg-[#0c0e12] border-r border-[#1d2025] flex flex-col shrink-0 relative z-10">
             {/* Pane Header */}
             <div className="h-16 flex items-center px-6 border-b border-[#1d2025] shrink-0">
                 <span className="font-label text-xs font-bold tracking-widest text-[#aaabb0] uppercase">// PAGES</span>
             </div>

             <div className="flex-1 overflow-y-auto no-scrollbar">
                 {notes.length === 0 && (
                     <div className="flex flex-col items-center justify-center p-8 text-center opacity-60 mt-10">
                         <div className="w-12 h-12 flex items-center justify-center mb-4 text-[#46484d]">
                             <Search className="w-6 h-6" />
                         </div>
                         <h3 className="text-[10px] font-label font-bold tracking-widest text-[#aaabb0] uppercase mb-1">NO_PAGES_FOUND</h3>
                     </div>
                 )}
                 {notes.map(note => {
                     const isSelected = activeNoteId === note.id;
                     const isLocked = note.is_locked && !unlockedNotes.includes(note.id);
                     
                     // Format date like Stitch design: 2024.05.12 // 09:42
                     const dateStr = new Date(note.updated_at).toLocaleString('en-US', {
                         year: 'numeric', month: '2-digit', day: '2-digit',
                         hour: '2-digit', minute: '2-digit', hour12: false
                     });
                     // M/D/YYYY, HH:MM
                     const [dPart, tPart] = dateStr.split(', ');
                     const [m, d, y] = (dPart || "01/01/2024").split('/');
                     const finalDate = `${y}.${m}.${d} // ${tPart}`;

                     return (
                         <div 
                             key={note.id}
                             className={`group relative p-6 border-b border-[#1d2025] cursor-pointer transition-colors ${
                                 isSelected 
                                     ? 'bg-[#1d2025] border-r-2 border-[#b8fd4b]' 
                                     : 'hover:bg-[#111318]'
                             }`}
                             onClick={() => onSelectNote(note)}
                         >
                             <div className={`text-[10px] font-mono mb-1 ${isSelected ? 'text-[#b8fd4b]' : 'text-[#aaabb0]'}`}>
                                 {finalDate}
                             </div>
                             
                             <div className="flex items-start justify-between gap-2 mb-2">
                                 <h3 className={`font-headline leading-tight flex items-center gap-1.5 ${isSelected ? 'text-[#f6f6fc] font-semibold' : 'text-[#f6f6fc]/80 font-medium'}`}>
                                     {isLocked && <Lock className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#b8fd4b]' : 'text-[#aaabb0]'}`} />}
                                     {isLocked ? "Secure Block" : (note.decrypted?.title || "[ Empty Phase ]")}
                                 </h3>
                                 
                                 <button 
                                     onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                                     className="p-1 opacity-0 group-hover:opacity-100 hover:text-[#ff7351] text-[#aaabb0] transition-all shrink-0 -mt-1 -mr-1"
                                 >
                                     <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                             </div>
                             
                             <p className={`text-xs line-clamp-2 leading-relaxed font-body ${isSelected ? 'text-[#aaabb0]' : 'text-[#aaabb0]/60'}`}>
                                 {isLocked ? "Encryption algorithm active. Decrypt to view contents." : ((note.decrypted?.content || "").replace(/<[^>]*>?/gm, '') || "No content...")}
                             </p>
                         </div>
                     );
                 })}
             </div>

             {/* Bottom Action Area matching Stitch */}
             <div className="p-4 bg-[#0c0e12] shrink-0 border-t border-[#1d2025]">
                <button 
                    onClick={onAddNote}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-[#111318] border border-[#1d2025] text-[#aaabb0] hover:text-[#b8fd4b] transition-all text-[10px] font-label font-bold uppercase tracking-widest"
                >
                    <Plus className="w-3.5 h-3.5" /> New Page
                </button>
             </div>
        </section>
    );
}
