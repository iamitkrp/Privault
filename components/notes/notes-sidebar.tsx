"use client";

import { Plus, ChevronLeft, ChevronRight, Edit2, Search, Upload, FileText, Pin, CheckCircle, Star, Users, Book, Settings, Archive } from "lucide-react";
import { useState } from "react";
import { User } from "@supabase/supabase-js";

export function NotesSidebar({
    sections,
    activeSection,
    onSelectSection,
    onAddSection,
    onRenameSection,
    onBack,
    user,
}: {
    sections: string[];
    activeSection: string;
    onSelectSection: (section: string) => void;
    onAddSection: (name: string) => void;
    onRenameSection?: (oldName: string, newName: string) => void;
    onBack?: () => void;
    user?: User | null;
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
            <aside className="w-16 bg-background/20 backdrop-blur-2xl border-r border-border/50 flex flex-col z-40 items-center py-6 transition-all shrink-0">
                <button onClick={() => setIsCollapsed(false)} className="p-2 hover:bg-foreground/10 rounded transition-colors mb-6 text-fg-secondary hover:text-foreground">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </aside>
        );
    }

    return (
        <aside className="w-64 bg-background/20 backdrop-blur-2xl border-r border-border/50 flex flex-col z-40 shrink-0 transition-all">
            {/* Header Section */}
            <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-2">
                    {onBack && (
                        <button onClick={onBack} title="Back to Vault" className="p-1.5 bg-background/50 border border-border/50 hover:bg-foreground/10 text-fg-secondary hover:text-foreground rounded-md transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    )}
                    <span className="text-xl font-black tracking-tighter text-foreground uppercase">Privault</span>
                </div>
                <div className="flex gap-2 text-fg-secondary">
                    <button onClick={() => setIsCollapsed(true)} title="Collapse sidebar" className="p-1 hover:bg-foreground/10 hover:text-foreground rounded transition-colors -mr-2">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Search & Action */}
            <div className="px-4 space-y-4">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-secondary w-4 h-4" />
                    <input className="w-full bg-background/40 border-none rounded-xl py-2 pl-10 text-sm focus:ring-1 focus:ring-brand/40 placeholder:text-fg-muted text-foreground outline-none" placeholder="Search..." type="text"/>
                </div>
                <button 
                    onClick={() => onSelectSection(activeSection)}
                    className="w-full py-2.5 px-4 bg-foreground text-background rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-md active:scale-95 transition-all outline outline-1 outline-border uppercase tracking-widest hover:brightness-110"
                >
                    <Upload className="w-4 h-4" /> Upload
                </button>
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 overflow-y-auto px-4 mt-6 space-y-6 custom-scrollbar">
                {/* Quick Links */}
                <div>
                    <h3 className="text-[11px] font-bold text-fg-muted uppercase tracking-widest px-2 mb-2">Quick Links</h3>
                    <div className="space-y-1">
                        <button 
                            onClick={() => onSelectSection("All")} 
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${activeSection === "All" ? 'bg-foreground/10 shadow-sm text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`}
                        >
                            <FileText className="w-5 h-5" /> All Notes
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-fg-secondary hover:text-foreground hover:bg-foreground/5 transition-all">
                            <Pin className="w-5 h-5" /> Pinned
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-fg-secondary hover:text-foreground hover:bg-foreground/5 transition-all">
                            <CheckCircle className="w-5 h-5" /> Task
                        </button>
                    </div>
                </div>

                {/* Notes Categories / Sections */}
                <div>
                    <h3 className="text-[11px] font-bold text-fg-muted uppercase tracking-widest px-2 mb-2">Notes</h3>
                    <div className="space-y-1">
                        {sections.map(section => (
                            <div key={section} className="relative group/edit">
                                {editingSection === section ? (
                                    <form onSubmit={handleFinishEdit} className="px-3 py-2 rounded-xl bg-background/50 border border-border/50 w-full mb-1">
                                        <input 
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onBlur={() => handleFinishEdit()}
                                            autoFocus
                                            className="bg-transparent text-sm font-medium w-full text-brand outline-none"
                                        />
                                    </form>
                                ) : (
                                    <button 
                                        onClick={() => onSelectSection(section)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${activeSection === section ? 'bg-foreground/10 shadow-sm text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`}
                                    >
                                        <div className="flex items-center gap-3 truncate">
                                            <Book className="w-5 h-5 shrink-0" /> <span className="truncate">{section}</span>
                                        </div>
                                        {onRenameSection && (
                                            <div 
                                                onClick={(e) => { e.stopPropagation(); setEditingSection(section); setEditingName(section); }} 
                                                className="opacity-0 group-hover/edit:opacity-100 text-fg-secondary hover:text-brand transition-all -my-1 p-1 shrink-0 bg-background/50 border border-border/50 rounded"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Add Section */}
                        {isAdding ? (
                            <form onSubmit={handleAdd} className="flex flex-col gap-2 mt-2 px-3 py-2 rounded-xl bg-background border border-border/50">
                                <input
                                    type="text"
                                    value={newSectionName}
                                    onChange={(e) => setNewSectionName(e.target.value)}
                                    placeholder="Section Name..."
                                    className="bg-transparent text-sm font-medium w-full outline-none text-brand"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-foreground text-background text-[10px] font-bold rounded py-1.5 uppercase hover:opacity-90">Add</button>
                                    <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-background text-fg-secondary hover:text-foreground text-[10px] font-bold rounded py-1.5 uppercase border border-border/50">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="w-full flex items-center justify-center gap-3 px-3 py-2.5 mt-4 rounded-xl text-[10px] tracking-widest font-bold uppercase text-brand hover:bg-brand/5 border border-dashed border-border transition-all"
                            >
                                <Plus className="w-4 h-4" /> Add Category
                            </button>
                        )}
                        
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-fg-secondary hover:text-foreground hover:bg-foreground/5 transition-all">
                            <Star className="w-5 h-5" /> Starred
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-fg-secondary hover:text-foreground hover:bg-foreground/5 transition-all">
                            <Users className="w-5 h-5" /> Shared with me
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-fg-secondary hover:text-foreground hover:bg-foreground/5 transition-all">
                            <Archive className="w-5 h-5" /> Archive
                        </button>
                    </div>
                </div>
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-border/50 bg-background/40">
                <div className="flex items-center gap-3 px-2 py-2 hover:bg-foreground/5 rounded-xl cursor-pointer transition-all">
                    <div className="w-10 h-10 rounded-full bg-foreground/10 border border-border/50 overflow-hidden flex items-center justify-center text-foreground font-bold">
                        {user?.email?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{user?.email?.split('@')[0] || "Alex Rivers"}</p>
                        <p className="text-xs text-brand truncate uppercase tracking-widest font-bold mt-0.5">Pro User</p>
                    </div>
                    <Settings className="text-fg-secondary hover:text-foreground transition-colors w-5 h-5" />
                </div>
            </div>
        </aside>
    );
}
