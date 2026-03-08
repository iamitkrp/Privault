import { ReactNode } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SessionMonitor } from "@/components/auth/session-monitor";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                {/* Placeholder for Vault Header / Navbar */}
                <header className="border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                        <Link href="/vault" className="font-bold tracking-widest text-brand hover:opacity-80 transition-opacity">PRIVAULT</Link>
                        <div className="flex items-center gap-2">
                            <Link href="/settings" className="px-3 py-1.5 text-sm text-secondary hover:text-foreground hover:bg-white/5 rounded-lg transition-all">Settings</Link>
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                <SessionMonitor />

                <main className="max-w-7xl mx-auto px-4 py-8">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
