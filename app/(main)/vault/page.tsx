"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { passphraseManager } from "@/lib/crypto/passphrase";
import { CredentialList } from "@/components/vault/credential-list";
import { VaultUnlock } from "@/components/vault/vault-unlock";
import { VaultHealth } from "@/components/vault/vault-health";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon-panel";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { DashboardSidebar, Tool } from "@/components/dashboard/dashboard-sidebar";
import { VaultCredential } from "@/types";
import { LayoutDashboard, ChevronLeft, Menu } from "lucide-react";

type ActiveTool = { id: string; label: string } | null;

const LOCAL_TOOLS = new Set([
    'passwords', 'notessec', 'documents', 'totp', 'subscriptions',
    'notes-kb', 'idea-inbox', 'prompts',
    'todos', 'habits', 'pomodoro',
    'calendar', 'budget',
    'watchlist', 'books',
    'wishlist',
    'bookmarks'
]);

export default function VaultPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isUnlocked, setIsUnlocked] = useState(passphraseManager.isUnlocked());
    const [credentials, setCredentials] = useState<VaultCredential[]>([]);
    const [activeTool, setActiveTool] = useState<ActiveTool>(null); // null = home
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = passphraseManager.subscribe((locked) => {
            setIsUnlocked(!locked);
        });
        return unsubscribe;
    }, []);

    function handleHomeNavigate(toolId: string, toolLabel: string) {
        setActiveTool({ id: toolId, label: toolLabel });
    }

    function goHome() {
        setActiveTool(null);
    }

    function handleSidebarToolSelect(tool: Tool) {
        if (LOCAL_TOOLS.has(tool.id)) {
            setActiveTool({ id: tool.id, label: tool.label });
        }
        
        if (tool.live && tool.href && tool.href !== '/vault') {
            router.push(tool.href);
        }
        setMobileOpen(false);
    }

    // Tools that require the vault to be unlocked (encrypted data)
    const VAULT_REQUIRED_TOOLS = new Set(['passwords', 'notessec', 'documents', 'totp']);

    function renderContent() {
        if (!activeTool) {
            return (
                <DashboardHome
                    userName={user?.email}
                    onToolNavigate={handleHomeNavigate}
                />
            );
        }

        // If this tool requires vault unlock and vault is locked, show VaultUnlock inline
        if (VAULT_REQUIRED_TOOLS.has(activeTool.id) && !isUnlocked) {
            return (
                <div className="flex items-center justify-center py-20">
                    <VaultUnlock onUnlock={() => setIsUnlocked(true)} />
                </div>
            );
        }

        if (activeTool.id === "passwords") {
            return (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
                    <div className="xl:col-span-3">
                        <CredentialList onCredentialsLoad={setCredentials} />
                    </div>
                    <div className="sticky top-6">
                        <VaultHealth credentials={credentials} />
                    </div>
                </div>
            );
        }

        return <ComingSoonPanel toolName={activeTool.label} />;
    }

    const isHome = !activeTool;

    return (
        <div className="flex pt-20 pb-8 min-h-screen">
            <DashboardSidebar
                activeTool={activeTool?.id ?? null}
                onToolSelect={handleSidebarToolSelect}
                onHomeClick={() => {
                    goHome();
                    setMobileOpen(false);
                }}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />
            
            <main className="flex-1 overflow-y-auto relative">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="md:hidden absolute top-4 left-4 p-2 z-10 text-gray-400 hover:text-white bg-black/50 backdrop-blur-md rounded-md border border-[#333]"
                    aria-label="Open navigation menu"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div
                    className={`max-w-6xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-400 ${!isHome ? 'mt-10 md:mt-0' : 'mt-10 md:mt-0'}`}
                    key={activeTool?.id ?? "home"}
                >
                    {/* Breadcrumb — only shown inside a tool */}
                    {!isHome && (
                        <button
                            onClick={goHome}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-5 transition-colors group mono uppercase tracking-widest"
                        >
                            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                            <LayoutDashboard className="w-3 h-3" />
                            Dashboard
                        </button>
                    )}

                    {/* Tool-view heading */}
                    {!isHome && (
                        <div className="mb-6">
                            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">
                                {user?.email}
                            </p>
                            <h1 className="text-2xl font-bold tracking-tight text-white capitalize">
                                {activeTool?.label}
                            </h1>
                        </div>
                    )}

                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
