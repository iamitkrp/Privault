import { ReactNode } from "react";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { UserMenu } from "@/components/ui/user-menu";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SessionMonitor } from "@/components/auth/session-monitor";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Database, GitBranch } from "lucide-react";

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-transparent text-foreground flex flex-col relative overflow-hidden">
                
                {/* Grid background matching landing page */}
                <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0 mix-blend-overlay" />
                <div className="fixed inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none z-0" />

                {/* ── Top Header — Logo + User Menu ── */}
                <header className="fixed top-0 z-50 w-full pointer-events-none">
                     <div className="h-20 flex items-center justify-between px-6 md:px-12 bg-background/40 backdrop-blur-xl border-b border-border/50 shadow-sm">
                         <div className="pointer-events-auto">
                            <AnimatedLogo />
                         </div>
                         <div className="pointer-events-auto flex items-center gap-4">
                            <ThemeSwitcher />
                            <UserMenu />
                         </div>
                     </div>
                     {/* Gradient fade — eliminates the hard blur edge */}
                     <div className="h-10 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />
                </header>

                <SessionMonitor />

                {/* Terminal bottom bar */}
                <div className="fixed bottom-0 inset-x-0 h-8 border-t border-border/50 bg-background/60 backdrop-blur-md z-50 flex items-center justify-between px-4 mono text-[10px] uppercase text-fg-secondary hidden sm:flex shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-4">
                        <span className="text-foreground bg-border-secondary px-2 py-0.5">SECURE_ENV: READY</span>
                        <span>&gt;&gt;&gt;&gt;&gt;</span>
                        <span className="text-success">VAULT: ACTIVE</span>
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
