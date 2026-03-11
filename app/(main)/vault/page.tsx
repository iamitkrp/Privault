"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { passphraseManager } from "@/lib/crypto/passphrase";
import { CredentialList } from "@/components/vault/credential-list";
import { VaultUnlock } from "@/components/vault/vault-unlock";
import { VaultHealth } from "@/components/vault/vault-health";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon-panel";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { VaultCredential } from "@/types";
import { LayoutDashboard, ChevronLeft } from "lucide-react";

type ActiveTool = { id: string; label: string } | null;

export default function VaultPage() {
    const { user } = useAuth();
    const [isUnlocked, setIsUnlocked] = useState(passphraseManager.isUnlocked());
    const [credentials, setCredentials] = useState<VaultCredential[]>([]);
    const [activeTool, setActiveTool] = useState<ActiveTool>(null); // null = home

    useEffect(() => {
        const unsubscribe = passphraseManager.subscribe((locked) => {
            setIsUnlocked(!locked);
        });
        return unsubscribe;
    }, []);

    if (!isUnlocked) {
        return <VaultUnlock onUnlock={() => setIsUnlocked(true)} />;
    }

    function handleHomeNavigate(toolId: string, toolLabel: string) {
        setActiveTool({ id: toolId, label: toolLabel });
    }

    function goHome() {
        setActiveTool(null);
    }

    function renderContent() {
        if (!activeTool) {
            return (
                <DashboardHome
                    userName={user?.email}
                    onToolNavigate={handleHomeNavigate}
                />
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
        <main className="flex-1 overflow-y-auto">
            <div
                className="max-w-6xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-400"
                key={activeTool?.id ?? "home"}
            >
                {/* Breadcrumb — only shown inside a tool */}
                {!isHome && (
                    <button
                        onClick={goHome}
                        className="flex items-center gap-1.5 text-xs text-[var(--fg-muted)] hover:text-[var(--fg-secondary)] mb-5 transition-colors group"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        <LayoutDashboard className="w-3 h-3" />
                        Dashboard
                    </button>
                )}

                {/* Tool-view heading */}
                {!isHome && (
                    <div className="mb-6">
                        <p className="text-xs font-mono text-[var(--fg-muted)] uppercase tracking-widest mb-1">
                            {user?.email}
                        </p>
                        <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-primary)]">
                            {activeTool?.label}
                        </h1>
                    </div>
                )}

                {renderContent()}
            </div>
        </main>
    );
}
