import { ReactNode } from "react";

import { AnimatedLogo } from "@/components/ui/animated-logo";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SessionMonitor } from "@/components/auth/session-monitor";

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-black text-white flex flex-col">

                {/* ── Top Header — Minimalist Logo ── */}
                <header className="fixed top-0 z-50 h-20 w-full flex items-center px-6 md:px-12 pointer-events-none">
                     <div className="pointer-events-auto">
                        <AnimatedLogo />
                     </div>
                </header>

                <SessionMonitor />

                {/* ── Body ── */}
                <div className="flex-1 relative z-10">
                    {children}
                </div>
            </div>
        </ProtectedRoute>
    );
}
