import { ReactNode } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SessionMonitor } from "@/components/auth/session-monitor";

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-black text-white flex flex-col">
                {/* Grid background matching landing page */}
                <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none z-0" />
                <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/40 to-black pointer-events-none z-0" />

                {/* ── Top Header — Terminal Nav ── */}
                <header className="border-b border-[#222] bg-black/90 backdrop-blur-md sticky top-0 z-50 h-14 shrink-0">
                    <div className="h-full px-6 flex items-center justify-between">
                        <Link
                            href="/vault"
                            className="mono text-sm tracking-widest text-white/80 hover:text-white transition-colors uppercase flex items-center gap-2"
                        >
                            <span className="text-[#ff4500]">[</span>
                            PRIVAULT
                            <span className="text-[#ff4500]">]</span>
                        </Link>
                        <div className="flex items-center mono text-xs">
                            <Link
                                href="/settings"
                                className="px-3 py-1.5 text-gray-500 hover:text-white border border-transparent hover:border-[#333] transition-all uppercase tracking-widest"
                            >
                                Settings
                            </Link>
                        </div>
                    </div>
                </header>

                <SessionMonitor />

                {/* ── Body ── */}
                <div className="flex flex-1 overflow-hidden relative z-10">
                    {children}
                </div>
            </div>
        </ProtectedRoute>
    );
}
