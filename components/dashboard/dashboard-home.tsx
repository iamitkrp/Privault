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
    ChevronRight,
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
        description: "Encrypted fortress for credentials and sensitive data.",
        icon: <ShieldCheck className="w-5 h-5" />,
        accentColor: "#ff4500",
        tools: [
            { id: "passwords", label: "Password Manager", icon: <LockKeyhole className="w-3 h-3" />, live: true },
            { id: "notessec", label: "Secure Notes", icon: <FileText className="w-3 h-3" />, live: false },
            { id: "documents", label: "Document Vault", icon: <FolderOpen className="w-3 h-3" />, live: false },
            { id: "totp", label: "2FA / TOTP", icon: <KeyRound className="w-3 h-3" />, live: false },
            { id: "subscriptions", label: "Subscription Tracker", icon: <CreditCard className="w-3 h-3" />, live: false },
        ],
    },
    {
        id: "knowledge",
        label: "Notes & Knowledge",
        description: "Capture ideas, prompts, and knowledge privately.",
        icon: <StickyNote className="w-5 h-5" />,
        accentColor: "#6366f1",
        tools: [
            { id: "notes-kb", label: "Notes", icon: <StickyNote className="w-3 h-3" />, live: false },
            { id: "idea-inbox", label: "Idea Inbox", icon: <Lightbulb className="w-3 h-3" />, live: false },
            { id: "prompts", label: "Prompt Library", icon: <BrainCircuit className="w-3 h-3" />, live: false },
        ],
    },
    {
        id: "productivity",
        label: "Tasks & Productivity",
        description: "Stay focused and build momentum every day.",
        icon: <CheckSquare className="w-5 h-5" />,
        accentColor: "#10b981",
        tools: [
            { id: "todos", label: "To-Do List", icon: <CheckSquare className="w-3 h-3" />, live: false },
            { id: "habits", label: "Habit Tracker", icon: <Flame className="w-3 h-3" />, live: false },
            { id: "pomodoro", label: "Pomodoro Timer", icon: <Timer className="w-3 h-3" />, live: false },
        ],
    },
    {
        id: "life",
        label: "Goals & Life Planning",
        description: "Plan finances, goals, and life milestones.",
        icon: <CalendarDays className="w-5 h-5" />,
        accentColor: "#f59e0b",
        tools: [
            { id: "calendar", label: "Calendar", icon: <CalendarDays className="w-3 h-3" />, live: false },
            { id: "budget", label: "Budget Tracker", icon: <Wallet className="w-3 h-3" />, live: false },
        ],
    },
    {
        id: "media",
        label: "Media & Entertainment",
        description: "Track what you watch, read, and learn.",
        icon: <Clapperboard className="w-5 h-5" />,
        accentColor: "#8b5cf6",
        tools: [
            { id: "watchlist", label: "Watchlist", icon: <Clapperboard className="w-3 h-3" />, live: false },
            { id: "books", label: "Book Tracker", icon: <BookOpen className="w-3 h-3" />, live: false },
        ],
    },
    {
        id: "shopping",
        label: "Shopping & Wishlist",
        description: "Save what you want, track what you'll buy.",
        icon: <ShoppingCart className="w-5 h-5" />,
        accentColor: "#ec4899",
        tools: [
            { id: "wishlist", label: "Wishlist", icon: <ShoppingCart className="w-3 h-3" />, live: false },
        ],
    },
    {
        id: "web",
        label: "Web & Bookmarks",
        description: "Your private internet — links that matter.",
        icon: <Bookmark className="w-5 h-5" />,
        accentColor: "#06b6d4",
        tools: [
            { id: "bookmarks", label: "Bookmarks", icon: <Bookmark className="w-3 h-3" />, live: false },
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
            className="relative group bg-[#050505] border border-[#1a1a1a] hover:border-[#333] overflow-hidden flex flex-col transition-all duration-300"
        >
            {/* Top accent line */}
            <div className="h-[1px] w-full" style={{ background: category.accentColor, opacity: 0.4 }} />
            <div
                className="h-[1px] w-0 group-hover:w-full transition-all duration-500 -mt-[1px]"
                style={{ background: category.accentColor }}
            />

            {/* Corner accent */}
            <div
                className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l transition-colors"
                style={{ borderColor: category.accentColor }}
            />

            {/* Card Header */}
            <div className="px-5 pt-5 pb-4">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                        className="p-2 border"
                        style={{ borderColor: `${category.accentColor}30`, color: category.accentColor }}
                    >
                        {category.icon}
                    </div>
                    {liveCount > 0 && (
                        <span className="mono text-[8px] flex items-center gap-1 uppercase tracking-widest border px-1.5 py-0.5"
                            style={{ borderColor: `${category.accentColor}40`, color: category.accentColor }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: category.accentColor }} />
                            LIVE
                        </span>
                    )}
                </div>
                <h3 className="mono font-bold text-white text-xs uppercase tracking-widest mb-2">{category.label}</h3>
                <p className="mono text-gray-600 text-[10px] uppercase tracking-wide leading-relaxed">{category.description}</p>
            </div>

            {/* Tool list */}
            <div className="px-5 pb-5 flex-1 border-t border-[#111] pt-4 space-y-1">
                {category.tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => onToolClick(tool.id, tool.label)}
                        disabled={!tool.live}
                        className="w-full flex items-center gap-2 px-2 py-2 mono text-[10px] uppercase tracking-widest transition-all text-left group/tool"
                        style={tool.live ? { color: category.accentColor } : { color: "#444" }}
                    >
                        <span>{tool.icon}</span>
                        <span className="flex-1">{tool.label}</span>
                        {tool.live ? (
                            <ChevronRight className="w-3 h-3 opacity-0 group-hover/tool:opacity-100 transition-all" />
                        ) : (
                            <span className="text-[8px] border border-[#222] px-1 py-0.5 text-[#333]">SOON</span>
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
            <div className="mb-10">
                <div className="mono text-[10px] text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="text-[#ff4500]">&gt;&gt;</span>
                    {userName ?? "PERSONAL_HQ // DASHBOARD"}
                </div>
                <h1 className="text-4xl font-bold tracking-tighter text-white mb-5">
                    Personal HQ
                </h1>

                {/* Stats strip */}
                <div className="flex items-center gap-6 mono text-[10px] uppercase tracking-widest text-gray-600 border-b border-[#111] pb-5">
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff4500] animate-pulse" />
                        {liveTools} live
                    </span>
                    <span>{totalTools - liveTools} in development</span>
                    <span>{CATEGORIES.length} categories</span>
                </div>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[1px] bg-[#111] border border-[#111]">
                {CATEGORIES.map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        onToolClick={onToolNavigate}
                    />
                ))}
            </div>

            {/* Footer terminal bar */}
            <div className="mt-6 border border-[#111] bg-[#050505] px-4 py-2.5 flex items-center justify-between mono text-[9px] uppercase tracking-widest text-gray-600">
                <div className="flex items-center gap-4">
                    <span className="text-white bg-[#1a1a1a] px-2 py-0.5">PRIVAULT v2.0</span>
                    <span>&gt;&gt;&gt;</span>
                    <span className="text-[#ff4500]">ZERO_KNOWLEDGE</span>
                </div>
                <span>AES-256-GCM // PBKDF2</span>
            </div>
        </div>
    );
}
