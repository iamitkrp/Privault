"use client";

import { Plus, ChevronLeft, ChevronRight, Folder, Edit2 } from "lucide-react";
import { useState } from "react";

export function NotesSidebar({
    sections,
    activeSection,
    onSelectSection,
    onAddSection,
    onRenameSection,
    onBack,
}: {
    sections: string[];
    activeSection: string;
    onSelectSection: (section: string) => void;
    onAddSection: (name: string) => void;
    onRenameSection?: (oldName: string, newName: string) => void;
    onBack?: () => void;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newSectionName, setNewSectionName] = useState("");
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        onAddSection(newSectionName);
        setNewSectionName("");
        setIsAdding(false);
    };

    const handleFinishEdit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (editingSection && onRenameSection) {
            onRenameSection(editingSection, editingName);
        }
        setEditingSection(null);
    };

    if (isCollapsed) {
        return (
            <section className="w-12 bg-background/50 backdrop-blur-md border-r border-border flex flex-col items-center h-full relative z-20 shrink-0 py-4 transition-all">
                <button onClick={() => setIsCollapsed(false)} className="p-2 mb-4 hover:bg-foreground/5 rounded text-fg-muted hover:text-foreground border border-transparent hover:border-border transition-all">
                    <ChevronRight className="w-4 h-4" />
                </button>
                <div className="flex flex-col gap-4 items-center w-full">
                    <button onClick={() => { setIsCollapsed(false); }} className="w-8 h-8 flex items-center justify-center hover:bg-foreground/5 rounded text-fg-secondary hover:text-foreground transition-colors" title="Expand Sections">
                        <Folder className="w-4 h-4" />
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="w-64 bg-background/50 backdrop-blur-md border-r border-border flex flex-col h-full relative z-20 shrink-0 transition-all">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0 bg-background/80">
                <span className="text-[10px] font-bold tracking-widest text-fg-muted uppercase">Sections</span>
                <button onClick={() => setIsCollapsed(true)} className="p-1 hover:bg-foreground/5 rounded text-fg-muted hover:text-foreground transition-colors -mr-2">
                    <ChevronLeft className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                
                {/* All Sections Item */}
                <div 
                    onClick={() => onSelectSection("All")}
                    className={`px-6 py-4 cursor-pointer transition-all group ${activeSection === "All" ? 'bg-foreground/5 border-l-2 border-foreground' : 'border-b border-border/50 hover:bg-foreground/5'}`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className={`font-medium text-xs tracking-widest uppercase ${activeSection === "All" ? 'text-foreground' : 'text-fg-secondary group-hover:text-foreground'}`}>All Sections</span>
                    </div>
                </div>

                {/* Derived Sections */}
                {sections.map(section => (
                    <div 
                        key={section}
                        onClick={() => { if (editingSection !== section) onSelectSection(section) }}
                        className={`px-6 py-4 cursor-pointer transition-all group ${activeSection === section ? 'bg-foreground/5 border-l-2 border-foreground' : 'border-b border-border/50 hover:bg-foreground/5'}`}
                    >
                        {editingSection === section ? (
                            <form onSubmit={handleFinishEdit} className="w-full">
                                <input 
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onBlur={() => handleFinishEdit()}
                                    autoFocus
                                    className="bg-transparent border-b border-foreground text-foreground text-xs font-bold w-full uppercase outline-none tracking-widest"
                                />
                            </form>
                        ) : (
                            <div className="flex justify-between items-center mb-1">
                                <span className={`font-medium text-xs tracking-widest uppercase ${activeSection === section ? 'text-foreground' : 'text-fg-secondary group-hover:text-foreground'}`}>{section}</span>
                                {onRenameSection && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setEditingSection(section); setEditingName(section); }} 
                                        className="opacity-0 group-hover:opacity-100 text-fg-muted hover:text-foreground transition-all"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Section Action Area */}
            <div className="p-4 bg-background border-t border-border shrink-0">
                {isAdding ? (
                    <form onSubmit={handleAdd} className="flex flex-col gap-2">
                        <input
                            type="text"
                            value={newSectionName}
                            onChange={(e) => setNewSectionName(e.target.value)}
                            placeholder="Section Name..."
                            className="bg-background border border-border text-foreground text-xs p-2 outline-none focus:border-foreground transition-colors placeholder:text-fg-muted"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button 
                                type="submit" 
                                className="flex-1 bg-foreground text-background font-bold text-[10px] uppercase py-2 hover:opacity-90 transition-opacity tracking-widest cursor-pointer"
                            >
                                Add
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setIsAdding(false)}
                                className="flex-1 bg-transparent text-fg-secondary font-bold text-[10px] uppercase py-2 border border-border hover:text-foreground hover:bg-foreground/5 transition-colors tracking-widest cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border text-fg-secondary hover:text-foreground hover:bg-foreground/5 transition-all text-xs uppercase tracking-widest cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" /> 
                        Add Section
                    </button>
                )}
            </div>
        </section>
    );
}
