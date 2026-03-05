import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                {/* Placeholder for Vault Header / Navbar */}
                <header className="border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between pointer-events-none">
                        <div className="font-bold tracking-widest text-brand pointer-events-auto">PRIVAULT</div>
                        {/* We will add UserProfileDropdown and Logout here in the future */}
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 py-8">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
