import { ReactNode } from "react";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { UserMenu } from "@/components/ui/user-menu";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SessionMonitor } from "@/components/auth/session-monitor";
import { LoginOTPGate } from "@/components/auth/login-otp-gate";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ImmersiveBackground } from "@/components/landing/immersive-background";


export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute>
            <LoginOTPGate>
            <div className="relative flex min-h-screen flex-col overflow-hidden bg-transparent text-foreground">
                <ImmersiveBackground />

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
                <div className="flex-1 pb-8 w-full">
                    {children}
                </div>
            </div>
            </LoginOTPGate>
        </ProtectedRoute>
    );
}
