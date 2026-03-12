import { ReactNode } from "react";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SessionMonitor } from "@/components/auth/session-monitor";
import { Database, GitBranch } from "lucide-react";

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
                
                {/* Grid background matching landing page */}
                <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
                <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none z-0" />

                {/* ── Top Header — Minimalist Logo ── */}
                <header className="fixed top-0 z-50 h-20 w-full flex items-center px-6 md:px-12 pointer-events-none">
                     <div className="pointer-events-auto">
                        <AnimatedLogo />
                     </div>
                </header>

                <SessionMonitor />

                {/* Terminal bottom bar */}
                <div className="fixed bottom-0 inset-x-0 h-8 border-t border-[#333] bg-black/80 backdrop-blur-md z-50 flex items-center justify-between px-4 mono text-[10px] uppercase text-gray-500 hidden sm:flex">
                    <div className="flex items-center gap-4">
                        <span className="text-white bg-[#333] px-2 py-0.5">SECURE_ENV: READY</span>
                        <span>&gt;&gt;&gt;&gt;&gt;</span>
                        <span className="text-[#ff4500]">VAULT: ACTIVE</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1"><Database className="w-3 h-3" /> VAULT_SYNC: ACTIVE</span>
                        <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> PROTOCOL: v2.4.0</span>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 relative z-10 pb-8">
                    {children}
                </div>
            </div>
        </ProtectedRoute>
    );
}
