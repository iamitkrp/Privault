"use client";

import { Lightbulb, Bell, Tag, Edit3, Archive, Trash2, LayoutDashboard } from "lucide-react";

interface SidebarItem {
    id: string;
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
}

const NAV_ITEMS: SidebarItem[] = [
    { id: "notes", icon: <Lightbulb className="w-5 h-5" />, label: "Notes", isActive: true },
    { id: "reminders", icon: <Bell className="w-5 h-5" />, label: "Reminders" },
    { id: "l1", icon: <Tag className="w-5 h-5" />, label: "Personal" },
    { id: "l2", icon: <Tag className="w-5 h-5" />, label: "Work" },
    { id: "edit_labels", icon: <Edit3 className="w-5 h-5" />, label: "Edit labels" },
    { id: "archive", icon: <Archive className="w-5 h-5" />, label: "Archive" },
    { id: "trash", icon: <Trash2 className="w-5 h-5" />, label: "Trash" },
];

export function NotesSidebar({ onBack }: { onBack?: () => void }) {
    return (
        <div className="w-[280px] shrink-0 h-full py-4 flex flex-col hidden md:flex border-r border-border/20 bg-background">
            <button 
                onClick={onBack}
                className="flex items-center gap-4 px-6 py-3 mx-2 mb-6 text-fg-muted hover:bg-foreground/5 hover:text-foreground rounded-lg transition-colors mono text-xs uppercase tracking-widest"
            >
                <LayoutDashboard className="w-4 h-4" />
                Back to Dashboard
            </button>

            {NAV_ITEMS.map((item) => (
                <button
                    key={item.id}
                    className={`flex items-center gap-6 px-6 py-3 transition-colors ${
                        item.isActive 
                            ? "bg-foreground/10 text-foreground rounded-r-full font-semibold" 
                            : "text-fg-secondary hover:bg-foreground/5 hover:text-foreground rounded-r-full font-medium"
                    }`}
                    style={{
                        marginRight: '12px',
                        marginTop: item.id === "archive" ? 'auto' : (item.id === "edit_labels" || item.id === "l1") ? '8px' : '0'
                    }}
                >
                    <div className={item.isActive ? "text-foreground" : "text-fg-muted"}>
                        {item.icon}
                    </div>
                    <span className="text-sm tracking-wide">{item.label}</span>
                </button>
            ))}
        </div>
    );
}
