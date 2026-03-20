"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { UserProfile } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { AuthService } from "@/services/auth.service";

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    profileError: string | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    authService: AuthService;
    supabaseClient: ReturnType<typeof createClient>;
    /** Whether the user has completed post-login OTP verification (in-memory only) */
    otpVerified: boolean;
    /** Mark post-login OTP as verified */
    verifyLoginOtp: () => void;
    /** Store a quick hash of the login password for vault≠login enforcement (in-memory only) */
    storeLoginPasswordHash: (password: string) => void;
    /** SHA-256 hex hash of the login password (in-memory only, for comparison) */
    loginPasswordHash: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Derive a quick SHA-256 hex hash of a string.
 * Used client-side only for comparing login vs vault passwords.
 */
async function quickHash(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [otpVerified, setOtpVerified] = useState(false);
    const [loginPasswordHash, setLoginPasswordHash] = useState<string | null>(null);

    const [supabaseClient] = useState(() => createClient());
    const [authService] = useState(() => new AuthService(supabaseClient));

    // Guard so we never call setIsLoading(false) twice for the same event
    const loadingResolved = useRef(false);
    // Track if profile has already been loaded to skip duplicate events
    const profileLoaded = useRef(false);

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

                // Skip redundant SIGNED_IN if INITIAL_SESSION already loaded the profile
                if (event === "SIGNED_IN" && profileLoaded.current) {
                    console.log("[Auth] Skipping redundant SIGNED_IN — profile already loaded.");
                    resolveLoading();
                    return;
                }

                if (session?.user) {
                    setUser(session.user);
                    // Load profile asynchronously — always resolve loading first
                    // so the UI is never blocked by a slow profile fetch
                    resolveLoading();

                    // Retry-capable profile fetch with per-attempt timeouts.
                    // This handles stale Supabase sessions and transient network issues.
                    const MAX_RETRIES = 3;
                    const PER_ATTEMPT_TIMEOUT_MS = 8_000;
                    const RETRY_DELAY_MS = 2_000;

                    const fetchProfileOnce = async (): Promise<void> => {
                        const ensureResult = await authService.ensureProfileExists(session.user);
                        if (!ensureResult.success) {
                            throw new Error("Profile init failed: " + ensureResult.error?.message);
                        }

                        const profileResult = await authService.getProfile(session.user.id);
                        if (profileResult.success && mounted) {
                            setProfile(profileResult.data);
                            setProfileError(null);
                        } else if (!profileResult.success) {
                            throw new Error("Profile load failed: " + profileResult.error?.message);
                        }
                    };

                    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                        if (!mounted) break;

                        console.log(`[Auth] Profile sync attempt ${attempt}/${MAX_RETRIES}...`);

                        // On retries, refresh the Supabase session to get a fresh token
                        if (attempt > 1) {
                            try {
                                await supabaseClient.auth.refreshSession();
                                console.log("[Auth] Session refreshed for retry.");
                            } catch { /* non-blocking */ }
                        }

                        const timeout = new Promise<never>((_, reject) =>
                            setTimeout(() => reject(new Error(`Attempt ${attempt} timed out`)), PER_ATTEMPT_TIMEOUT_MS)
                        );

                        try {
                            await Promise.race([fetchProfileOnce(), timeout]);
                            console.log("[Auth] Profile loaded successfully.");
                            profileLoaded.current = true;
                            break; // Success — exit retry loop
                        } catch (err: any) {
                            console.warn(`[Auth] Attempt ${attempt} failed:`, err?.message);
                            if (attempt === MAX_RETRIES) {
                                // Final attempt failed — surface the error
                                console.error("[Auth] All profile sync attempts exhausted.");
                                if (mounted) setProfileError("Profile sync failed after multiple retries. Please refresh.");
                            } else {
                                // Wait before retrying
                                await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
                            }
                        }
                    }
                } else {
                    setUser(null);
                    setProfile(null);
                    setProfileError(null);
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
        profileLoaded.current = false;
        await authService.signOut();
        setUser(null);
        setProfile(null);
        setOtpVerified(false);
        setLoginPasswordHash(null);
        setIsLoading(false);
        loadingResolved.current = true;
    };

    const verifyLoginOtp = () => setOtpVerified(true);

    const storeLoginPasswordHash = async (password: string) => {
        const hash = await quickHash(password);
        setLoginPasswordHash(hash);
    };

    return (
        <AuthContext.Provider value={{
            user, profile, profileError, isLoading, signOut, authService, supabaseClient,
            otpVerified, verifyLoginOtp,
            storeLoginPasswordHash, loginPasswordHash,
        }}>
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

