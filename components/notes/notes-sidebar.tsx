"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

export function NotesSidebar({
    sections,
    activeSection,
    onSelectSection,
    onAddSection,
}: {
    sections: string[];
    activeSection: string;
    onSelectSection: (section: string) => void;
    onAddSection: (name: string) => void;
    onBack?: () => void;
}) {
    const [isAdding, setIsAdding] = useState(false);
    const [newSectionName, setNewSectionName] = useState("");

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        onAddSection(newSectionName);
        setNewSectionName("");
        setIsAdding(false);
    };

    return (
        <section className="w-64 bg-[#111318] border-r border-[#1d2025] flex flex-col h-full relative z-20 shrink-0">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-[#1d2025] shrink-0 bg-[#0c0e12]">
                <span className="font-label text-xs font-bold tracking-widest text-[#aaabb0] uppercase">// SECTIONS</span>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                
                {/* All Sections Item */}
                <div 
                    onClick={() => onSelectSection("All")}
                    className={`px-6 py-4 cursor-pointer transition-colors group ${activeSection === "All" ? 'bg-[#1d2025] border-l-2 border-[#48e4ff]' : 'border-b border-[#1d2025] hover:bg-[#1d2025]'}`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className={`font-headline font-medium text-sm ${activeSection === "All" ? 'text-[#48e4ff]' : 'text-[#f6f6fc]/70 group-hover:text-[#f6f6fc]'}`}>All Sections</span>
                    </div>
                    {activeSection === "All" && (
                        <div className="w-full h-1 bg-[#46484d]/30 mt-2">
                            <div className="w-full h-full bg-[#48e4ff]/50"></div>
                        </div>
                    )}
                </div>

                {/* Derived Sections */}
                {sections.map(section => (
                    <div 
                        key={section}
                        onClick={() => onSelectSection(section)}
                        className={`px-6 py-4 cursor-pointer transition-colors group ${activeSection === section ? 'bg-[#1d2025] border-l-2 border-[#48e4ff]' : 'border-b border-[#1d2025] hover:bg-[#1d2025]'}`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className={`font-headline font-medium text-sm ${activeSection === section ? 'text-[#48e4ff]' : 'text-[#f6f6fc]/70 group-hover:text-[#f6f6fc]'}`}>{section}</span>
                        </div>
                        {activeSection === section && (
                            <div className="w-full h-1 bg-[#46484d]/30 mt-2">
                                <div className="w-3/4 h-full bg-[#48e4ff]/50"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Section Action Area */}
            <div className="p-4 bg-[#111318] border-t border-[#1d2025] shrink-0">
                {isAdding ? (
                    <form onSubmit={handleAdd} className="flex flex-col gap-2">
                        <input
                            type="text"
                            value={newSectionName}
                            onChange={(e) => setNewSectionName(e.target.value)}
                            placeholder="Section Name..."
                            className="bg-[#0c0e12] border border-[#1d2025] text-[#f6f6fc] text-[10px] font-mono p-2 outline-none focus:border-[#48e4ff] transition-colors uppercase tracking-widest"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button 
                                type="submit" 
                                className="flex-1 bg-[#48e4ff]/20 text-[#48e4ff] font-label font-bold text-[10px] uppercase py-2 border border-[#48e4ff]/30 hover:bg-[#48e4ff]/30 transition-colors tracking-widest cursor-pointer"
                            >
                                CREATE
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setIsAdding(false)}
                                className="flex-1 bg-transparent text-[#aaabb0] font-label font-bold text-[10px] uppercase py-2 border border-[#46484d] hover:text-[#f6f6fc] hover:border-[#aaabb0] transition-colors tracking-widest cursor-pointer"
                            >
                                CANCEL
                            </button>
                        </div>
                    </form>
                ) : (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#46484d] text-[#aaabb0] hover:text-[#48e4ff] hover:border-[#48e4ff]/50 transition-all text-[10px] font-label uppercase tracking-widest cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" /> 
                        Add Section
                    </button>
                )}
            </div>
        </section>
    );
}
