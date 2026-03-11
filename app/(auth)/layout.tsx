import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute requireGuest>
            <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
                {/* Grid background matching landing page */}
                <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
                <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/60 to-black pointer-events-none" />

                <div className="w-full max-w-md relative z-10">
                    {children}
                </div>
            </div>
        </ProtectedRoute>
    );
}
