"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { UserProfile } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { AuthService } from "@/services/auth.service";

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    authService: AuthService;
    supabaseClient: ReturnType<typeof createClient>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [supabaseClient] = useState(() => createClient());
    const [authService] = useState(() => new AuthService(supabaseClient));

    // Guard so we never call setIsLoading(false) twice for the same event
    const loadingResolved = useRef(false);

    function resolveLoading() {
        if (!loadingResolved.current) {
            loadingResolved.current = true;
            setIsLoading(false);
        }
    }

    useEffect(() => {
        let mounted = true;

        // Safety net: if onAuthStateChange never fires (e.g. network issue),
        // unblock the UI after 6 seconds.
        const fallbackTimer = setTimeout(() => {
            if (mounted) {
                console.warn("[Auth] Session check timed out. Forcing UI unlock.");
                resolveLoading();
            }
        }, 6000);

        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
            async (event, session) => {
                console.log("[Auth] onAuthStateChange event:", event);
                if (!mounted) return;

                // Cancel the fallback timer — we got a real event
                clearTimeout(fallbackTimer);

                if (session?.user) {
                    setUser(session.user);
                    // Load profile asynchronously — always resolve loading first
                    // so the UI is never blocked by a slow profile fetch
                    resolveLoading();
                    try {
                        await authService.ensureProfileExists(session.user);
                        const profileResult = await authService.getProfile(session.user.id);
                        if (profileResult.success && mounted) {
                            setProfile(profileResult.data);
                        }
                    } catch {
                        // Non-fatal: profile load failure doesn't block the app
                    }
                } else {
                    setUser(null);
                    setProfile(null);
                    resolveLoading();
                }
            }
        );

        return () => {
            mounted = false;
            clearTimeout(fallbackTimer);
            subscription.unsubscribe();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const signOut = async () => {
        setIsLoading(true);
        loadingResolved.current = false;
        await authService.signOut();
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        loadingResolved.current = true;
    };

    return (
        <AuthContext.Provider value={{ user, profile, isLoading, signOut, authService, supabaseClient }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

