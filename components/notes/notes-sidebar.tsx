"use client";

import { Plus, ChevronLeft, ChevronRight, Edit2, Search, Upload, FileText, Pin, CheckCircle, Star, Users, Book, Settings, Archive } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function NotesSidebar({
    sections,
    activeSection,
    onSelectSection,
    onAddSection,
    onRenameSection,
    onBack,
    user,
    searchQuery,
    onSearchChange,
}: {
    sections: string[];
    activeSection: string;
    onSelectSection: (section: string) => void;
    onAddSection: (name: string) => void;
    onRenameSection?: (oldName: string, newName: string) => void;
    onBack?: () => void;
    user?: User | null;
    searchQuery?: string;
    onSearchChange?: (q: string) => void;
}) {
    const router = useRouter();
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
            <aside className="w-16 bg-background/80 backdrop-blur-sm border-r border-border/50 flex flex-col z-40 items-center py-6 transition-all shrink-0">
                <button onClick={() => setIsCollapsed(false)} className="p-2 hover:bg-foreground/10 rounded transition-colors mb-6 text-fg-secondary hover:text-foreground">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </aside>
        );
    }

    return (
        <aside className="w-64 bg-background/80 backdrop-blur-sm border-r border-border/50 flex flex-col z-40 shrink-0 transition-all">
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
                    <input 
                        value={searchQuery || ""}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        className="w-full bg-background/40 border-none rounded-xl py-2 pl-10 text-sm focus:ring-1 focus:ring-brand/40 placeholder:text-fg-muted text-foreground outline-none" 
                        placeholder="Search..." 
                        type="text"
                    />
                </div>
                <button 
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.multiple = false;
                        input.accept = ".txt,.md";
                        // Simulate an upload action by just opening standard OS dialog
                        input.click();
                        input.onchange = async (e: any) => {
                            if (e.target.files && e.target.files.length > 0) {
                                alert("Upload feature connecting to secure API is coming soon!");
                            }
                        };
                    }}
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
                        <button 
                            onClick={() => onSelectSection("Pinned")} 
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${activeSection === "Pinned" ? 'bg-foreground/10 shadow-sm text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`}
                        >
                            <Pin className="w-5 h-5" /> Pinned
                        </button>
                        <button 
                            onClick={() => onSelectSection("Task")} 
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${activeSection === "Task" ? 'bg-foreground/10 shadow-sm text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`}
                        >
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
                                
                                {editingSection === section && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => handleFinishEdit()} />
                                        <div className="absolute top-0 left-0 w-full z-50 bg-background border border-border/40 rounded-2xl shadow-lg px-3.5 py-3 transform origin-top">
                                            <form onSubmit={handleFinishEdit} className="flex flex-col gap-3 relative z-50">
                                                <div className="flex items-center gap-2.5">
                                                    <Edit2 className="w-3.5 h-3.5 text-fg-muted/70 shrink-0" />
                                                    <input 
                                                        type="text"
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Escape') setEditingSection(null); }}
                                                        autoFocus
                                                        placeholder="Rename category..."
                                                        className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-fg-muted/50"
                                                    />
                                                </div>
                                                <div className="h-px bg-border/30" />
                                                <div className="flex justify-end gap-1.5">
                                                    <button type="button" onClick={() => setEditingSection(null)} className="px-3 py-1 rounded-full text-[11px] font-semibold text-fg-secondary hover:text-foreground hover:bg-foreground/5 transition-colors">Cancel</button>
                                                    <button type="submit" disabled={!editingName.trim()} className="px-3 py-1 rounded-full text-[11px] font-bold bg-foreground text-background hover:brightness-110 disabled:opacity-40 transition-all">Save</button>
                                                </div>
                                            </form>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}

                        {/* Add Section */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="w-full flex items-center gap-3 px-3 py-2 mt-2 rounded-xl text-sm font-medium text-fg-muted hover:text-foreground hover:bg-foreground/5 transition-all"
                            >
                                <Plus className="w-5 h-5" /> Add Category
                            </button>
                            {isAdding && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => { setIsAdding(false); setNewSectionName(""); }} />
                                    <div className="absolute top-0 left-0 w-full z-50 bg-background border border-border/40 rounded-2xl shadow-lg px-3.5 py-3 transform origin-top">
                                        <form onSubmit={handleAdd} className="flex flex-col gap-3 relative z-50">
                                            <div className="flex items-center gap-2.5">
                                                <Plus className="w-3.5 h-3.5 text-fg-muted/70 shrink-0" />
                                                <input
                                                    type="text"
                                                    value={newSectionName}
                                                    onChange={(e) => setNewSectionName(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Escape') { setIsAdding(false); setNewSectionName(""); } }}
                                                    placeholder="New category..."
                                                    className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-fg-muted/50"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="h-px bg-border/30" />
                                            <div className="flex justify-end gap-1.5">
                                                <button type="button" onClick={() => { setIsAdding(false); setNewSectionName(""); }} className="px-3 py-1 rounded-full text-[11px] font-semibold text-fg-secondary hover:text-foreground hover:bg-foreground/5 transition-colors">Cancel</button>
                                                <button type="submit" disabled={!newSectionName.trim()} className="px-3 py-1 rounded-full text-[11px] font-bold bg-foreground text-background hover:brightness-110 disabled:opacity-40 transition-all">Add</button>
                                            </div>
                                        </form>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <button 
                            onClick={() => onSelectSection("Starred")}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${activeSection === "Starred" ? 'bg-foreground/10 shadow-sm text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`}
                        >
                            <Star className="w-5 h-5" /> Starred
                        </button>
                        <button 
                            onClick={() => onSelectSection("Shared with me")}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${activeSection === "Shared with me" ? 'bg-foreground/10 shadow-sm text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`}
                        >
                            <Users className="w-5 h-5" /> Shared with me
                        </button>
                        <button 
                            onClick={() => onSelectSection("Archive")}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${activeSection === "Archive" ? 'bg-foreground/10 shadow-sm text-foreground' : 'text-fg-secondary hover:text-foreground hover:bg-foreground/5'}`}
                        >
                            <Archive className="w-5 h-5" /> Archive
                        </button>
                        <button 
                            onClick={() => router.push('/settings')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-fg-secondary hover:text-foreground hover:bg-foreground/5 transition-all"
                        >
                            <Settings className="w-5 h-5" /> Settings
                        </button>
                    </div>
                </div>
            </nav>

            {/* User Footer */}
            <div className="px-4 py-3 border-t border-border/50">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-brand/15 border border-brand/25 overflow-hidden flex items-center justify-center text-brand text-xs font-bold shrink-0">
                        {user?.email?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <p className="flex-1 min-w-0 text-sm font-semibold text-foreground truncate">{user?.email?.split('@')[0] || "User"}</p>
                    <ThemeSwitcher className="p-1.5 rounded-lg text-fg-secondary hover:text-foreground hover:bg-foreground/10 transition-colors shrink-0" />
                </div>
            </div>
        </aside>
    );
}
