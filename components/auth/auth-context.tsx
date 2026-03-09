"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize supabase client and service once, passing the exact same client reference
    // to prevent navigator.locks deadlocks inside @supabase/supabase-js during hydration
    const [supabaseClient] = useState(() => createClient());
    const [authService] = useState(() => new AuthService(supabaseClient));

    useEffect(() => {
        let mounted = true;
        const supabase = supabaseClient;

        // We rely entirely on onAuthStateChange, which fires an INITIAL_SESSION 
        // event synchronously or immediately after setup. Mixing manual getSession() 
        // with onAuthStateChange() creates duplicate state, 
        // concurrent race conditions, and GoTrue lock contentions.

        // Next.js HMR Circuit Breaker: If the Supabase client gets deadlocked 
        // on a navigator.lock (common in React 18 Strict Mode during fast refresh),
        // we forcefully unblock the UI after 5 seconds so the user isn't permanently stuck.
        const lockBreakerTimer = setTimeout(() => {
            if (mounted) {
                console.warn("[Auth] Supabase lock timeout! Forcing UI to unlock. If you are stuck in Dev mode, clear site data.");
                setIsLoading(false);
            }
        }, 5000);

        let isChecking = false;

        async function initializeSession() {
            if (isChecking) return;
            isChecking = true;
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user && mounted) {
                    setUser(session.user);
                    await authService.ensureProfileExists(session.user);
                    const profileResult = await authService.getProfile(session.user.id);
                    if (profileResult.success) {
                        setProfile(profileResult.data);
                    }
                }
            } catch (error) {
                console.error("[Auth] getSession failed:", error);
            } finally {
                if (mounted) setIsLoading(false);
                clearTimeout(lockBreakerTimer);
            }
        }

        // 1. Manually check session to guarantee resolution during HMR reinstantiations
        // 2. We don't await this directly so we can set up the listener immediately
        initializeSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log("[Auth] onAuthStateChange event:", event);
                if (!mounted) return;

                // Clear the deadlock circuit breaker
                clearTimeout(lockBreakerTimer);

                // Ignore INITIAL_SESSION if initializeSession is already handling it
                if (event === 'INITIAL_SESSION' && isChecking) return;

                if (session?.user) {
                    try {
                        setUser(session.user);
                        await authService.ensureProfileExists(session.user);
                        const profileResult = await authService.getProfile(session.user.id);
                        if (profileResult.success) {
                            setProfile(profileResult.data);
                        } else {
                            console.error("[Auth] onAuthStateChange Failed to load profile:", profileResult.error);
                        }
                    } catch (err) {
                        console.error("[Auth] onAuthStateChange Error:", err);
                    }
                } else {
                    console.log("[Auth] onAuthStateChange No session user, clearing state.");
                    setUser(null);
                    setProfile(null);
                }

                setIsLoading(false);
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [authService]);

    const signOut = async () => {
        setIsLoading(true);
        await authService.signOut();
        setUser(null);
        setProfile(null);
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, profile, isLoading, signOut, authService }}>
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
