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

    // Initialize service once
    const [authService] = useState(() => new AuthService(createClient()));

    useEffect(() => {
        let mounted = true;
        const supabase = createClient();

        async function loadSession() {
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
                console.error("Failed to load session:", error);
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        loadSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (!mounted) return;

                if (session?.user) {
                    setUser(session.user);
                    await authService.ensureProfileExists(session.user);
                    const profileResult = await authService.getProfile(session.user.id);
                    if (profileResult.success) {
                        setProfile(profileResult.data);
                    }
                } else {
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
