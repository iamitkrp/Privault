"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ERROR_MESSAGES } from "@/constants";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=recovery`,
        });

        setIsLoading(false);

        if (error) {
            setError(ERROR_MESSAGES.auth.resetFailed);
        } else {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <div className="glass rounded-xl p-8 shadow-glass animate-in fade-in zoom-in-95 duration-500 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-foreground mb-4">
                    Check Your Email
                </h1>
                <p className="text-secondary mb-8">
                    If an account exists for that email, we&apos;ve sent a secure password reset link.
                </p>
                <Link
                    href="/login"
                    className="text-brand hover:text-brand-hover font-medium transition-colors"
                >
                    Return to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl p-8 shadow-glass animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                    Reset Password
                </h1>
                <p className="text-secondary text-sm px-4">
                    Enter your email address and we&apos;ll send you a link to reset your master password
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 rounded-md bg-error/10 border border-error/20 text-error text-sm text-center">
                        {error}
                    </div>
                )}

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

                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-xs text-warning">
                    <strong>Warning:</strong> Resetting your master password does not recover your old encrypted data. Your old data remains encrypted with your old password.
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full bg-brand text-brand-foreground font-semibold rounded-lg px-4 py-2.5 hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-brand-foreground/30 border-t-brand-foreground rounded-full animate-spin" />
                    ) : (
                        "Send Reset Link"
                    )}
                </button>
            </form>

            <div className="mt-8 text-center text-sm">
                <Link href="/login" className="text-secondary hover:text-foreground font-medium transition-colors">
                    &larr; Back to login
                </Link>
            </div>
        </div>
    );
}
