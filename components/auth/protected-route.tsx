"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./auth-context";

interface ProtectedRouteProps {
    children: React.ReactNode;
    /**
     * If true, this route requires the user to NOT be logged in.
     * e.g., the Login page, Signup page.
     * Redirects to /dashboard if already logged in.
     */
    requireGuest?: boolean;
}

export function ProtectedRoute({ children, requireGuest = false }: ProtectedRouteProps) {
    const { user, profile, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;

        // 1. If route requires guest (e.g., /login) and user IS logged in -> Redirect to Vault
        if (requireGuest && user) {
            router.replace("/vault");
            return;
        }

        // 2. If route requires auth (e.g., /vault) and user IS NOT logged in -> Redirect to Landing
        if (!requireGuest && !user) {
            router.replace("/");
            return;
        }
    }, [user, profile, isLoading, requireGuest, router, pathname]);

    // Show nothing or a full-screen loading skeleton while checking auth state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
                    <p className="text-secondary text-sm">Verifying session...</p>
                </div>
            </div>
        );
    }

    // If we're redirecting, returning null prevents flash of unauthorized content
    if (requireGuest && user) return null;
    if (!requireGuest && !user) return null;

    return <>{children}</>;
}
