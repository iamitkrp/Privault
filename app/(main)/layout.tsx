import { ReactNode } from "react";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { UserMenu } from "@/components/ui/user-menu";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SessionMonitor } from "@/components/auth/session-monitor";
import { LoginOTPGate } from "@/components/auth/login-otp-gate";
import { ThemeSwitcher } from "@/components/theme-switcher";


export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute>
            <LoginOTPGate>
            <div className="min-h-screen bg-transparent text-foreground flex flex-col relative overflow-hidden">
                
                {/* Grid background matching landing page */}
                <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
                <div className="fixed inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none z-0" />

                {/* ── Top Header — Logo + User Menu ── */}
                <header className="fixed top-0 z-50 w-full pointer-events-none">
                     <div className="h-20 flex items-center justify-between px-6 md:px-12 bg-background/80 backdrop-blur-sm border-b border-border/50">
                         <div className="pointer-events-auto">
                            <AnimatedLogo />
                         </div>
                         <div className="pointer-events-auto flex items-center gap-4">
                            <ThemeSwitcher />
                            <UserMenu />
                         </div>
                     </div>
                </header>

                <SessionMonitor />



                {/* ── Body ── */}
                <div className="flex-1 relative z-10 pb-8">
                    {children}
                </div>
            </div>
            </LoginOTPGate>
        </ProtectedRoute>
    );
}
