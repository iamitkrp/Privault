"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { VALIDATION } from "@/constants";
import { Activity, ChevronRight, AlertTriangle } from "lucide-react";

export default function SignupPage() {
    const { authService } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        return () => { setPassword(""); setConfirmPassword(""); };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < VALIDATION.password.minLength) {
            setError(`Password must be at least ${VALIDATION.password.minLength} characters.`);
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        const result = await authService.signUp(email, password);
        setIsLoading(false);

        if (!result.success) {
            setError(result.error.message);
        } else {
            setPassword("");
            setConfirmPassword("");
            setSuccess(true);
            setTimeout(() => router.push("/verify-email"), 2000);
        }
    };

    if (success) {
        return (
            <div className="border border-[#222] bg-black/80 backdrop-blur-md p-8 animate-in fade-in zoom-in-95 duration-500 text-center">
                <div className="w-16 h-16 border border-[#333] flex items-center justify-center mx-auto mb-6 text-2xl">
                    ✓
                </div>
                <div className="mono text-[10px] text-[#ff4500] tracking-widest uppercase mb-3">VAULT_INITIALIZED</div>
                <h1 className="text-2xl font-bold text-white tracking-tighter mb-3">Vault Created</h1>
                <p className="mono text-xs text-gray-500 uppercase tracking-widest">
                    Cryptographic provisioning complete. Redirecting...
                </p>
            </div>
        );
    }

    return (
        <div className="border border-[#222] bg-black/80 backdrop-blur-md p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#ff4500]" />

            <div className="mb-8">
                <div className="mono text-[10px] text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-5">
                    <Activity className="w-3 h-3 text-[#ff4500]" />
                    INITIALIZE_VAULT // ZERO_KNOWLEDGE
                </div>
                <h1 className="text-2xl font-bold tracking-tighter text-white mb-1">Create Your Vault</h1>
                <p className="mono text-xs text-gray-500 uppercase tracking-widest">
                    Zero-knowledge encrypted storage
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
                        <span className="mono text-[10px] text-gray-600 uppercase tracking-widest">Min {VALIDATION.password.minLength} chars</span>
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

                <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="mono text-[10px] uppercase tracking-widest text-gray-500">
                        Confirm Master Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-black border border-[#333] px-4 py-3 text-white mono tracking-widest focus:outline-none focus:border-[#ff4500] transition-colors disabled:opacity-50"
                        placeholder="••••••••••••"
                    />
                </div>

                {/* Warning block */}
                <div className="border border-[#333] bg-[#0a0a0a] p-4 flex gap-3">
                    <AlertTriangle className="w-4 h-4 text-[#ff4500] shrink-0 mt-0.5" />
                    <p className="mono text-[10px] text-gray-500 uppercase tracking-wide leading-relaxed">
                        <span className="text-white">Critical:</span> If you forget your master password, your data cannot be recovered. We use zero-knowledge encryption — we never store or transmit your password.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !email || !password || !confirmPassword}
                    className="w-full bg-white text-black mono font-bold text-xs uppercase tracking-widest px-4 py-3.5 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2"
                >
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                        <>Initialize Vault <ChevronRight className="w-4 h-4" /></>
                    )}
                </button>
            </form>

            <div className="mt-7 pt-6 border-t border-[#1a1a1a] mono text-[10px] text-gray-600 uppercase tracking-widest text-center">
                Already have a vault?{" "}
                <Link href="/login" className="text-white hover:text-gray-300 transition-colors">
                    Sign in →
                </Link>
            </div>
        </div>
    );
}
