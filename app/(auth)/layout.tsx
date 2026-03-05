import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute requireGuest>
            <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
                {/* Subtle background glow effect using our Tailwind utility classes */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/5 rounded-full blur-3xl -z-10" />

                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </ProtectedRoute>
    );
}
