import { ReactNode } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SessionMonitor } from "@/components/auth/session-monitor";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background flex flex-col">
                {/* ── Top Header ── */}
                <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50 h-16 shrink-0">
                    <div className="h-full px-4 flex items-center justify-between">
                        <Link href="/vault" className="font-bold tracking-widest text-brand hover:opacity-80 transition-opacity">
                            PRIVAULT
                        </Link>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/settings"
                                className="px-3 py-1.5 text-sm text-secondary hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
                            >
                                Settings
                            </Link>
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                <SessionMonitor />

                {/* ── Body: Sidebar + Content ── */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar is rendered by the vault page (client component) so it can manage state */}
                    {children}
                </div>
            </div>
        </ProtectedRoute>
    );
}

