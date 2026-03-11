"use client";

import {
    ShieldCheck,
    FileText,
    FolderOpen,
    KeyRound,
    CreditCard,
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
    ArrowRight,
    Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tool = {
    id: string;
    label: string;
    icon: React.ReactNode;
    live: boolean;
};

type Category = {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    accentColor: string;
    tools: Tool[];
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
    {
        id: "security",
        label: "Security & Vault",
        description: "Your encrypted fortress for credentials and sensitive data.",
        icon: <ShieldCheck className="w-6 h-6" />,
        accentColor: "#ff4500",
        tools: [
            { id: "passwords", label: "Password Manager", icon: <LockKeyhole className="w-3.5 h-3.5" />, live: true },
            { id: "notessec", label: "Secure Notes", icon: <FileText className="w-3.5 h-3.5" />, live: false },
            { id: "documents", label: "Document Vault", icon: <FolderOpen className="w-3.5 h-3.5" />, live: false },
            { id: "totp", label: "2FA / TOTP", icon: <KeyRound className="w-3.5 h-3.5" />, live: false },
            { id: "subscriptions", label: "Subscription Tracker", icon: <CreditCard className="w-3.5 h-3.5" />, live: false },
        ],
    },
    {
        id: "knowledge",
        label: "Notes & Knowledge",
        description: "Capture ideas, prompts, and knowledge in your private space.",
        icon: <StickyNote className="w-6 h-6" />,
        accentColor: "#6366f1",
        tools: [
            { id: "notes-kb", label: "Notes", icon: <StickyNote className="w-3.5 h-3.5" />, live: false },
            { id: "idea-inbox", label: "Idea Inbox", icon: <Lightbulb className="w-3.5 h-3.5" />, live: false },
            { id: "prompts", label: "Prompt Library", icon: <BrainCircuit className="w-3.5 h-3.5" />, live: false },
        ],
    },
    {
        id: "productivity",
        label: "Tasks & Productivity",
        description: "Stay focused and build momentum every single day.",
        icon: <CheckSquare className="w-6 h-6" />,
        accentColor: "#10b981",
        tools: [
            { id: "todos", label: "To-Do List", icon: <CheckSquare className="w-3.5 h-3.5" />, live: false },
            { id: "habits", label: "Habit Tracker", icon: <Flame className="w-3.5 h-3.5" />, live: false },
            { id: "pomodoro", label: "Pomodoro Timer", icon: <Timer className="w-3.5 h-3.5" />, live: false },
        ],
    },
    {
        id: "life",
        label: "Goals & Life Planning",
        description: "Plan your finances, goals, and important life milestones.",
        icon: <CalendarDays className="w-6 h-6" />,
        accentColor: "#f59e0b",
        tools: [
            { id: "calendar", label: "Calendar", icon: <CalendarDays className="w-3.5 h-3.5" />, live: false },
            { id: "budget", label: "Budget Tracker", icon: <Wallet className="w-3.5 h-3.5" />, live: false },
        ],
    },
    {
        id: "media",
        label: "Media & Entertainment",
        description: "Track what you watch, read, and learn.",
        icon: <Clapperboard className="w-6 h-6" />,
        accentColor: "#8b5cf6",
        tools: [
            { id: "watchlist", label: "Watchlist", icon: <Clapperboard className="w-3.5 h-3.5" />, live: false },
            { id: "books", label: "Book Tracker", icon: <BookOpen className="w-3.5 h-3.5" />, live: false },
        ],
    },
    {
        id: "shopping",
        label: "Shopping & Wishlist",
        description: "Save what you want, track what you'll buy.",
        icon: <ShoppingCart className="w-6 h-6" />,
        accentColor: "#ec4899",
        tools: [
            { id: "wishlist", label: "Wishlist", icon: <ShoppingCart className="w-3.5 h-3.5" />, live: false },
        ],
    },
    {
        id: "web",
        label: "Web & Bookmarks",
        description: "Your private internet — links and articles that matter.",
        icon: <Bookmark className="w-6 h-6" />,
        accentColor: "#06b6d4",
        tools: [
            { id: "bookmarks", label: "Bookmarks", icon: <Bookmark className="w-3.5 h-3.5" />, live: false },
        ],
    },
];

// ─── Category Card ─────────────────────────────────────────────────────────────

function CategoryCard({
    category,
    onToolClick,
}: {
    category: Category;
    onToolClick: (toolId: string, toolLabel: string) => void;
}) {
    const liveCount = category.tools.filter((t) => t.live).length;

    return (
        <div
            className="relative group rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--bg-elevated)] overflow-hidden hover:border-[var(--border-secondary)] transition-all duration-300 hover:shadow-lg flex flex-col"
            style={{ "--accent": category.accentColor } as React.CSSProperties}
        >
            {/* Top accent bar */}
            <div
                className="h-[2px] w-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: category.accentColor }}
            />

            {/* Card Header */}
            <div className="px-5 pt-5 pb-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                        className="p-2.5 rounded-[var(--radius-lg)]"
                        style={{ background: `${category.accentColor}18`, color: category.accentColor }}
                    >
                        {category.icon}
                    </div>
                    {liveCount > 0 && (
                        <span
                            className="flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-1 rounded-sm"
                            style={{ background: `${category.accentColor}18`, color: category.accentColor }}
                        >
                            <span
                                className="w-1.5 h-1.5 rounded-full animate-pulse"
                                style={{ background: category.accentColor }}
                            />
                            LIVE
                        </span>
                    )}
                </div>
                <h3 className="font-semibold text-[var(--fg-primary)] text-sm mb-1">{category.label}</h3>
                <p className="text-[var(--fg-muted)] text-xs leading-relaxed">{category.description}</p>
            </div>

            {/* Tool list */}
            <div className="px-5 pb-5 flex-1 space-y-1">
                {category.tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => onToolClick(tool.id, tool.label)}
                        disabled={!tool.live}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-xs transition-all duration-150 text-left ${
                            tool.live
                                ? "text-[var(--fg-primary)] hover:text-[var(--fg-primary)] font-medium cursor-pointer"
                                : "text-[var(--fg-muted)] cursor-default"
                        }`}
                        style={
                            tool.live
                                ? { background: `${category.accentColor}14` }
                                : undefined
                        }
                    >
                        <span style={{ color: tool.live ? category.accentColor : "var(--fg-muted)" }}>
                            {tool.icon}
                        </span>
                        <span className="flex-1">{tool.label}</span>
                        {tool.live ? (
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" style={{ color: category.accentColor }} />
                        ) : (
                            <span className="text-[9px] font-mono text-[var(--fg-muted)] border border-[var(--border-primary)] px-1 py-0.5 rounded-sm">SOON</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Dashboard Home ────────────────────────────────────────────────────────────

type DashboardHomeProps = {
    userName?: string;
    onToolNavigate: (toolId: string, toolLabel: string) => void;
};

export function DashboardHome({ userName, onToolNavigate }: DashboardHomeProps) {
    const totalTools = CATEGORIES.reduce((sum, c) => sum + c.tools.length, 0);
    const liveTools = CATEGORIES.reduce((sum, c) => sum + c.tools.filter((t) => t.live).length, 0);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="mb-8">
                <p className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-widest mb-1">
                    {userName ? `Welcome back, ${userName}` : "Personal Dashboard"}
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-primary)] mb-4">
                    Your Personal HQ
                </h1>

                {/* Stats strip */}
                <div className="flex items-center gap-6 text-xs text-[var(--fg-secondary)]">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
                        {liveTools} tools live
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--fg-muted)]" />
                        {totalTools - liveTools} coming soon
                    </span>
                    <span className="flex items-center gap-1.5 opacity-50">
                        {CATEGORIES.length} categories
                    </span>
                </div>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-in">
                {CATEGORIES.map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        onToolClick={onToolNavigate}
                    />
                ))}
            </div>
        </div>
    );
}
