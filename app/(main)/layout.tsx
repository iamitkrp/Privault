import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SessionMonitor } from "@/components/auth/session-monitor";
import { LoginOTPGate } from "@/components/auth/login-otp-gate";
import { ImmersiveBackground } from "@/components/landing/immersive-background";
import { LandingNav } from "@/components/landing/LandingNav";


export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute>
            <LoginOTPGate>
            <div className="relative flex min-h-screen flex-col overflow-hidden bg-transparent text-foreground">
                <ImmersiveBackground />

                {/* Landing-style navbar (links + user menu) */}
                <LandingNav />

                <SessionMonitor />



                {/* ── Body ── */}
                <div className="flex-1 pt-20 pb-8 w-full">
                    {children}
                </div>
            </div>
            </LoginOTPGate>
        </ProtectedRoute>
    );
}
