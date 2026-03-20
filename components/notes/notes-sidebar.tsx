"use client";

import { Plus, LayoutDashboard, FolderArchive } from "lucide-react";

export function NotesSidebar({
    sections,
    activeSection,
    onSelectSection,
    onAddSection,
    onBack
}: {
    sections: string[];
    activeSection: string;
    onSelectSection: (s: string) => void;
    onAddSection: () => void;
    onBack?: () => void;
}) {
    // Premium pastel gradients for the notebook tabs
    const tabColors = [
        "bg-gradient-to-b from-red-400 to-red-600",
        "bg-gradient-to-b from-blue-400 to-blue-600",
        "bg-gradient-to-b from-emerald-400 to-emerald-600",
        "bg-gradient-to-b from-amber-400 to-amber-600",
        "bg-gradient-to-b from-purple-400 to-purple-600",
        "bg-gradient-to-b from-orange-400 to-orange-600"
    ];
    
    return (
        <div className="w-[260px] shrink-0 h-full flex flex-col border-r border-border/20 bg-foreground/[0.02] relative shadow-[inset_-1px_0_0_rgba(0,0,0,0.05)] dark:shadow-none">
             {/* Prominent Header */}
             <div className="h-16 flex items-center justify-between px-6 border-b border-border/10 shrink-0 bg-transparent">
                 <div className="flex items-center gap-2">
                     <FolderArchive className="w-4 h-4 text-brand" />
                     <span className="font-bold text-foreground tracking-tight text-sm uppercase">Notebooks</span>
                 </div>
                 <button 
                     onClick={onAddSection} 
                     className="p-1.5 bg-background border border-border/50 shadow-sm rounded-md hover:bg-foreground/5 transition-all text-fg-secondary hover:text-foreground group"
                     title="New Notebook Section"
                 >
                     <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                 </button>
             </div>

             <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 no-scrollbar">
                 <div 
                     className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${
                         activeSection === 'All' 
                             ? 'bg-background shadow-md border border-border/40 font-bold text-foreground origin-left scale-100' 
                             : 'hover:bg-foreground/5 text-fg-secondary border border-transparent hover:border-border/20 scale-[0.98]'
                     }`}
                     onClick={() => onSelectSection('All')}
                 >
                      All Sections
                 </div>

                 <div className="my-4 border-b border-border/10 mx-2" />

                 {sections.map((s, i) => (
                      <div 
                           key={s} 
                           className={`relative flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group overflow-hidden ${
                               activeSection === s 
                                   ? 'bg-background shadow-md border border-border/40 font-bold text-foreground origin-left scale-100' 
                                   : 'hover:bg-foreground/5 text-fg-secondary border border-transparent hover:border-border/20 scale-[0.98]'
                           }`}
                           onClick={() => onSelectSection(s)}
                      >
                           {/* The OneNote signature colored left border tab, upgraded to a shiny gradient pill */}
                           <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-[60%] w-1.5 ${tabColors[i % tabColors.length]} rounded-r-md opacity-100 shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
                           <span className="truncate pl-1">{s}</span>
                      </div>
                 ))}
             </div>

             {/* Footer Returns */}
             <div className="p-4 border-t border-border/10 shrink-0 bg-transparent">
                 {onBack && (
                     <button 
                         onClick={onBack} 
                         className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-background border border-border/50 shadow-sm hover:shadow hover:border-foreground/20 rounded-xl text-fg-secondary hover:text-foreground transition-all uppercase tracking-widest text-[10px] font-bold"
                     >
                         <LayoutDashboard className="w-3.5 h-3.5" />
                         Vault Dashboard
                     </button>
                 )}
             </div>
        </div>
    );
}
