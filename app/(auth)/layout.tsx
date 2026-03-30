import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Database, GitBranch } from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute requireGuest>
            <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
                {/* Grid background matching landing page */}
                <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
                <div className="fixed inset-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />

                {/* Landing-style navbar (links + Sign in) */}
                <LandingNav />

                {/* Terminal bottom bar */}
                <div className="fixed bottom-0 inset-x-0 h-8 border-t border-border-secondary bg-background/80 backdrop-blur-md z-50 flex items-center justify-between px-4 mono text-[10px] uppercase text-fg-muted hidden sm:flex">
                    <div className="flex items-center gap-4">
                        <span className="text-foreground bg-bg-secondary px-2 py-0.5">SECURE_ENV: READY</span>
                        <span>&gt;&gt;&gt;&gt;&gt;</span>
                        <span className="text-success">0 / 100%</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1"><Database className="w-3 h-3" /> VAULT_SYNC: STANDBY</span>
                        <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> PROTOCOL: v2.4.0</span>
                    </div>
                </div>

                <div className="w-full max-w-md relative z-10 pt-20 pb-8">
                    {children}
                </div>
            </div>
        </ProtectedRoute>
    );
}
