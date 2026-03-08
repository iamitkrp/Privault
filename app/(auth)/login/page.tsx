"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-context";
import { createClient } from "@/lib/supabase/client";
import { SecurityService } from "@/services/security.service";

export default function LoginPage() {
    const { authService } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const result = await authService.signIn(email, password);

        // Track login attempt for security monitoring
        try {
            const supabase = createClient();
            const security = new SecurityService(supabase);

            if (result.success) {
                // Get userId from the session
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    await security.trackLoginAttempt(session.user.id, true, email);
                }
            } else {
                // For failed login, we use email as a pseudo-identifier
                // The security service handles brute-force detection
                await security.logEvent(
                    email, // pseudo-ID — the RLS won't match but that's fine for failed attempts
                    'login_failure',
                    'warning',
                    { email, reason: result.error.message }
                );
            }
        } catch {
            // Security tracking should never block login
        }

        if (!result.success) {
            setError(result.error.message);
            setIsLoading(false);
        }
        // On success, the AuthContext state updates and ProtectedRoute handles the redirect automatically
    };

    return (
        <div className="glass rounded-xl p-8 shadow-glass animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                    Welcome back
                </h1>
                <p className="text-secondary text-sm">
                    Enter your credentials to unlock your vault
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 rounded-md bg-error/10 border border-error/20 text-error text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-colors disabled:opacity-50"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-sm font-medium text-foreground">
                                Master Password
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-xs text-brand hover:text-brand-hover transition-colors"
                                tabIndex={-1}
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-colors disabled:opacity-50 font-mono tracking-widest"
                            placeholder="••••••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full bg-brand text-brand-foreground font-semibold rounded-lg px-4 py-2.5 hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-brand-foreground/30 border-t-brand-foreground rounded-full animate-spin" />
                    ) : (
                        "Unlock Vault"
                    )}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-secondary">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-brand hover:text-brand-hover font-medium transition-colors">
                    Create vault
                </Link>
            </div>
        </div>
    );
}
