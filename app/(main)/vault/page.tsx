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
import { AnimatePresence, motion } from "framer-motion";

type ActiveTool = { id: string; label: string } | null;

export default function VaultPage() {
    const { user } = useAuth();
    const [isUnlocked, setIsUnlocked] = useState(passphraseManager.isUnlocked());
    const [credentials, setCredentials] = useState<VaultCredential[]>([]);
    const [activeTool, setActiveTool] = useState<ActiveTool>(null);

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

    const VAULT_REQUIRED_TOOLS = new Set(['passwords', 'notes']);

    const isModalOpen = activeTool && VAULT_REQUIRED_TOOLS.has(activeTool.id) && !isUnlocked;
    // We consider it "Home" if we are either truly on Home, OR if we are showing the unlock modal over Home.
    const isHomeView = !activeTool || isModalOpen;

    return (
        <div className="pt-20 min-h-screen relative">
            {/* The Main View Layer */}
            <div
                className="w-full animate-in fade-in slide-in-from-bottom-4 duration-400"
                key={isHomeView ? "home" : activeTool?.id}
            >
                {!isHomeView && (
                    <button
                        onClick={goHome}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-5 transition-colors group mono uppercase tracking-widest"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        <LayoutDashboard className="w-3 h-3" />
                        Dashboard
                    </button>
                )}

                {!isHomeView && (
                    <div className="mb-6">
                        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">
                            {user?.email}
                        </p>
                        <h1 className="text-2xl font-bold tracking-tight text-white capitalize">
                            {activeTool?.label}
                        </h1>
                    </div>
                )}

                {/* Render underlying dashboard or specific tool */}
                {isHomeView ? (
                    <DashboardHome
                        userName={user?.email}
                        onToolNavigate={handleHomeNavigate}
                    />
                ) : activeTool?.id === "passwords" ? (
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
                        <div className="xl:col-span-3">
                            <CredentialList onCredentialsLoad={setCredentials} />
                        </div>
                        <div className="sticky top-6">
                            <VaultHealth credentials={credentials} />
                        </div>
                    </div>
                ) : (
                    <ComingSoonPanel toolName={activeTool!.label} />
                )}
            </div>

            {/* Modal Layer */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/80 backdrop-blur-md"
                    >
                        <VaultUnlock 
                            onUnlock={() => setIsUnlocked(true)} 
                            onClose={goHome}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
