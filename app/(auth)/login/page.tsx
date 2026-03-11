"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-context";
import { SecurityService } from "@/services/security.service";
import { Activity, ChevronRight } from "lucide-react";

export default function LoginPage() {
    const { authService, supabaseClient } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        return () => { setPassword(""); };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const result = await authService.signIn(email, password);

        if (result.success) {
            setPassword("");
        }

        try {
            const supabase = supabaseClient;
            const security = new SecurityService(supabase);
            if (result.success) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    await security.trackLoginAttempt(session.user.id, true, email);
                }
            } else {
                await security.logEvent(email, 'login_failure', 'warning', { email, reason: result.error.message });
            }
        } catch { /* non-blocking */ }

        if (!result.success) {
            setError(result.error.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="border border-[#222] bg-black/80 backdrop-blur-md p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Corner accent */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#ff4500]" />

            {/* Header */}
            <div className="mb-8">
                <div className="mono text-[10px] text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-5">
                    <Activity className="w-3 h-3 text-[#ff4500]" />
                    SECURE_AUTH // VAULT_ACCESS
                </div>
                <h1 className="text-2xl font-bold tracking-tighter text-white mb-1">Welcome back</h1>
                <p className="mono text-xs text-gray-500 uppercase tracking-widest">
                    Enter credentials to access your vault
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="border border-red-900/60 bg-red-950/30 text-red-400 mono text-xs p-3 uppercase tracking-wide">
                        <span className="text-red-500 mr-1">!</span> {error}
                    </div>
                )}

                <div className="space-y-1.5">
                    <label htmlFor="email" className="mono text-[10px] uppercase tracking-widest text-gray-500">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-black border border-[#333] px-4 py-3 text-white text-sm mono focus:outline-none focus:border-[#ff4500] transition-colors disabled:opacity-50 placeholder-gray-700"
                        placeholder="you@example.com"
                    />
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="mono text-[10px] uppercase tracking-widest text-gray-500">
                            Master Password
                        </label>
                        <Link href="/forgot-password" className="mono text-[10px] text-gray-600 hover:text-white transition-colors uppercase tracking-widest" tabIndex={-1}>
                            Forgot?
                        </Link>
                    </div>
                    <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-black border border-[#333] px-4 py-3 text-white mono tracking-widest focus:outline-none focus:border-[#ff4500] transition-colors disabled:opacity-50"
                        placeholder="••••••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full bg-white text-black mono font-bold text-xs uppercase tracking-widest px-4 py-3.5 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2"
                >
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                        <>Unlock Vault <ChevronRight className="w-4 h-4" /></>
                    )}
                </button>
            </form>

            <div className="mt-7 pt-6 border-t border-[#1a1a1a] mono text-[10px] text-gray-600 uppercase tracking-widest text-center">
                No vault?{" "}
                <Link href="/signup" className="text-white hover:text-gray-300 transition-colors">
                    Create one →
                </Link>
            </div>
        </div>
    );
}
