"use client";

import { useState } from "react";
import Link from "next/link";

import {
    ShieldCheck,
    FileText,
    FolderOpen,
    KeyRound,
    CreditCard,
    ChevronDown,
    ChevronRight,
    Lock,
    StickyNote,
    Lightbulb,
    BrainCircuit,
    CheckSquare,
    Flame,
    Timer,
    CalendarDays,
    Wallet,
    Clapperboard,
    BookOpen,
    ShoppingCart,
    Bookmark,
    LockKeyhole,
    LayoutDashboard,
    X,
} from "lucide-react";

// ─── Data Model ──────────────────────────────────────────────────────────────

type Tool = {
    id: string;
    label: string;
    icon: React.ReactNode;
    href?: string;   // only set when tool is live
    live: boolean;
};

type Category = {
    id: string;
    label: string;
    icon: React.ReactNode;
    tools: Tool[];
};

const CATEGORIES: Category[] = [
    {
        id: "security",
        label: "Security & Vault",
        icon: <ShieldCheck className="w-4 h-4" />,
        tools: [
            { id: "passwords", label: "Password Manager", icon: <LockKeyhole className="w-4 h-4" />, href: "/vault", live: true },
            { id: "notes", label: "Secure Notes", icon: <FileText className="w-4 h-4" />, live: false },
            { id: "documents", label: "Document Vault", icon: <FolderOpen className="w-4 h-4" />, live: false },
            { id: "totp", label: "2FA / TOTP", icon: <KeyRound className="w-4 h-4" />, live: false },
            { id: "subscriptions", label: "Subscription Tracker", icon: <CreditCard className="w-4 h-4" />, live: false },
        ],
    },
    {
        id: "knowledge",
        label: "Notes & Knowledge",
        icon: <StickyNote className="w-4 h-4" />,
        tools: [
            { id: "notes-kb", label: "Notes", icon: <StickyNote className="w-4 h-4" />, live: false },
            { id: "idea-inbox", label: "Idea Inbox", icon: <Lightbulb className="w-4 h-4" />, live: false },
            { id: "prompts", label: "Prompt Library", icon: <BrainCircuit className="w-4 h-4" />, live: false },
        ],
    },
    {
        id: "productivity",
        label: "Tasks & Productivity",
        icon: <CheckSquare className="w-4 h-4" />,
        tools: [
            { id: "todos", label: "To-Do List", icon: <CheckSquare className="w-4 h-4" />, live: false },
            { id: "habits", label: "Habit Tracker", icon: <Flame className="w-4 h-4" />, live: false },
            { id: "pomodoro", label: "Pomodoro Timer", icon: <Timer className="w-4 h-4" />, live: false },
        ],
    },
    {
        id: "life",
        label: "Goals & Life Planning",
        icon: <CalendarDays className="w-4 h-4" />,
        tools: [
            { id: "calendar", label: "Calendar", icon: <CalendarDays className="w-4 h-4" />, live: false },
            { id: "budget", label: "Budget Tracker", icon: <Wallet className="w-4 h-4" />, live: false },
        ],
    },
    {
        id: "media",
        label: "Media & Entertainment",
        icon: <Clapperboard className="w-4 h-4" />,
        tools: [
            { id: "watchlist", label: "Watchlist", icon: <Clapperboard className="w-4 h-4" />, live: false },
            { id: "books", label: "Book Tracker", icon: <BookOpen className="w-4 h-4" />, live: false },
        ],
    },
    {
        id: "shopping",
        label: "Shopping & Wishlist",
        icon: <ShoppingCart className="w-4 h-4" />,
        tools: [
            { id: "wishlist", label: "Wishlist", icon: <ShoppingCart className="w-4 h-4" />, live: false },
        ],
    },
    {
        id: "web",
        label: "Web & Bookmarks",
        icon: <Bookmark className="w-4 h-4" />,
        tools: [
            { id: "bookmarks", label: "Bookmarks", icon: <Bookmark className="w-4 h-4" />, live: false },
        ],
    },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function CategorySection({
    category,
    defaultOpen,
    activeTool,
    onToolClick,
}: {
    category: Category;
    defaultOpen: boolean;
    activeTool: string | null;
    onToolClick: (tool: Tool) => void;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="mb-1">
            {/* Category header */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-[var(--radius-lg)] text-xs font-semibold uppercase tracking-widest text-[var(--fg-muted)] hover:text-[var(--fg-secondary)] hover:bg-white/5 transition-all duration-150 group"
                aria-expanded={open}
            >
                <span className="flex items-center gap-2">
                    <span className="text-[var(--fg-muted)] group-hover:text-[var(--fg-secondary)] transition-colors">
                        {category.icon}
                    </span>
                    {category.label}
                </span>
                {open ? (
                    <ChevronDown className="w-3 h-3 shrink-0" />
                ) : (
                    <ChevronRight className="w-3 h-3 shrink-0" />
                )}
            </button>

            {/* Tool list */}
            {open && (
                <div className="ml-3 mt-0.5 border-l border-[var(--border-primary)] pl-2 space-y-0.5">
                    {category.tools.map((tool) => {
                        const isActive = activeTool === tool.id;

                        if (tool.live && tool.href) {
                            return (
                                <Link
                                    key={tool.id}
                                    href={tool.href}
                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-lg)] text-sm transition-all duration-150 ${
                                        isActive
                                            ? "bg-[var(--brand-primary-subtle)] text-[var(--fg-primary)] font-medium"
                                            : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-white/5"
                                    }`}
                                >
                                    <span className={isActive ? "text-[var(--color-success)]" : ""}>{tool.icon}</span>
                                    {tool.label}
                                </Link>
                            );
                        }

                        return (
                            <button
                                key={tool.id}
                                onClick={() => onToolClick(tool)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-lg)] text-sm text-[var(--fg-muted)] hover:bg-white/5 hover:text-[var(--fg-secondary)] transition-all duration-150 group/tool"
                            >
                                <span>{tool.icon}</span>
                                <span className="flex-1 text-left">{tool.label}</span>
                                <span className="flex items-center gap-1 text-[10px] font-mono text-[var(--fg-muted)] bg-[var(--bg-elevated)] border border-[var(--border-primary)] px-1.5 py-0.5 rounded-sm group-hover/tool:border-[var(--border-secondary)] transition-colors">
                                    <Lock className="w-2.5 h-2.5" />
                                    SOON
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

type DashboardSidebarProps = {
    activeTool: string | null;
    onToolSelect: (tool: Tool) => void;
    onHomeClick: () => void;
    mobileOpen: boolean;
    onMobileClose: () => void;
};

export function DashboardSidebar({
    activeTool,
    onToolSelect,
    onHomeClick,
    mobileOpen,
    onMobileClose,
}: DashboardSidebarProps) {
    const sidebarContent = (
        <nav className="flex flex-col h-full py-4 overflow-y-auto custom-scrollbar">
            {/* Dashboard label — clickable to go home */}
            <button
                onClick={onHomeClick}
                className="px-3 mb-4 flex items-center gap-2 w-full hover:opacity-70 transition-opacity"
            >
                <LayoutDashboard className="w-4 h-4 text-[var(--fg-muted)]" />
                <span className="text-xs font-semibold uppercase tracking-widest text-[var(--fg-muted)]">Dashboard</span>
            </button>

            <div className="flex-1 px-2 space-y-0.5">
                {CATEGORIES.map((cat, i) => (
                    <CategorySection
                        key={cat.id}
                        category={cat}
                        defaultOpen={i === 0} // Security & Vault open by default
                        activeTool={activeTool}
                        onToolClick={onToolSelect}
                    />
                ))}
            </div>

            {/* Footer */}
            <div className="px-4 pt-4 mt-4 border-t border-[var(--border-primary)]">
                <p className="text-[10px] font-mono text-[var(--fg-muted)] leading-relaxed">
                    PRIVAULT v2.0 — PERSONAL HQ
                </p>
            </div>
        </nav>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] h-[calc(100vh-4rem)] sticky top-16 overflow-hidden">
                {sidebarContent}
            </aside>

            {/* Mobile: backdrop + slide-in drawer */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onMobileClose}
                        aria-hidden="true"
                    />
                    {/* Drawer */}
                    <aside className="relative w-72 bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] h-full z-10 animate-in slide-in-from-left-4 duration-200">
                        <button
                            onClick={onMobileClose}
                            className="absolute top-4 right-4 p-1.5 rounded-[var(--radius-lg)] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-white/10 transition-all"
                            aria-label="Close sidebar"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    );
}

export type { Tool };
