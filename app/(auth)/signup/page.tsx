"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { VALIDATION } from "@/constants";

export default function SignupPage() {
    const { authService } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Clear passwords from state on unmount
    useEffect(() => {
        return () => {
            setPassword("");
            setConfirmPassword("");
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic client-side validation
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
            // Wait a moment then redirect to email verification notice
            setTimeout(() => {
                router.push("/verify-email");
            }, 2000);
        }
    };

    if (success) {
        return (
            <div className="glass rounded-xl p-8 shadow-glass animate-in fade-in zoom-in-95 duration-500 text-center">
                <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                    ✅
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-4">Vault Created!</h1>
                <p className="text-secondary mb-6">
                    Your secure vault has been cryptographically provisioned. You are being redirected...
                </p>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl p-8 shadow-glass animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                    Create Your Vault
                </h1>
                <p className="text-secondary text-sm">
                    A secure, zero-knowledge password manager
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
                        <label htmlFor="password" className="text-sm font-medium text-foreground flex items-center justify-between">
                            <span>Master Password</span>
                            <span className="text-xs text-secondary font-normal">Min {VALIDATION.password.minLength} chars</span>
                        </label>
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

                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                            Confirm Master Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-colors disabled:opacity-50 font-mono tracking-widest"
                            placeholder="••••••••••••"
                        />
                    </div>
                </div>

                <div className="bg-brand/5 border border-brand/20 rounded-lg p-4 text-xs text-brand/80">
                    <strong>Crucial absolute fact:</strong> If you forget your Master Password, your data cannot be recovered. Privault uses zero-knowledge encryption, meaning we never store or transmit your password.
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !email || !password || !confirmPassword}
                    className="w-full bg-brand text-brand-foreground font-semibold rounded-lg px-4 py-2.5 hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-brand-foreground/30 border-t-brand-foreground rounded-full animate-spin" />
                    ) : (
                        "Create Secure Vault"
                    )}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-secondary">
                Already have a vault?{" "}
                <Link href="/login" className="text-brand hover:text-brand-hover font-medium transition-colors">
                    Sign in here
                </Link>
            </div>
        </div>
    );
}
