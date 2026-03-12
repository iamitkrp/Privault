"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/auth-context";
import { ERROR_MESSAGES } from "@/constants";

export default function ForgotPasswordPage() {
    const { supabaseClient } = useAuth();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const supabase = supabaseClient;
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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#050505] border border-[#222] p-8 text-center"
            >
                {/* Animated Logo */}
                <div className="relative w-16 h-16 mb-8 flex items-center justify-center mx-auto">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white/20">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                    <motion.svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff4500] drop-shadow-[0_0_12px_rgba(255,69,0,1)] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <motion.path
                            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                            initial={{ pathLength: 0, pathOffset: 0 }}
                            animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 1, 2] }}
                            transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                        />
                    </motion.svg>
                </div>

                <div className="mono text-[10px] text-[#ff4500] tracking-widest uppercase mb-3">LINK_DISPATCHED // SECURE_CHANNEL</div>
                <h1 className="text-2xl font-bold tracking-tight text-white mb-4">
                    Check Your Email
                </h1>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                    If an account exists for that email, we&apos;ve sent a secure password reset link.
                </p>
                <Link
                    href="/"
                    className="mono text-[10px] text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
                >
                    ← Return to Home
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#050505] border border-[#222] p-8"
        >
            {/* Animated Logo */}
            <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white/20">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
                <motion.svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff4500] drop-shadow-[0_0_12px_rgba(255,69,0,1)] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <motion.path
                        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                        initial={{ pathLength: 0, pathOffset: 0 }}
                        animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 1, 2] }}
                        transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                    />
                </motion.svg>
            </div>

            <div className="mb-8">
                <div className="mono text-[10px] text-[#ff4500] tracking-widest uppercase mb-3">PWD_RECOVERY // SECURE_CHANNEL</div>
                <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
                    Reset Password
                </h1>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Enter your email address and we&apos;ll send you a link to reset your master password.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 text-xs overflow-hidden"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-1.5">
                    <label htmlFor="email" className="mono text-[9px] uppercase tracking-widest text-gray-500">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-[#111] border border-[#222] px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ff4500]/60 focus:bg-[#1a1a1a] transition-all disabled:opacity-50 placeholder-gray-600"
                        placeholder="you@example.com"
                    />
                </div>

                <div className="bg-[#ff8c00]/10 border border-[#ff8c00]/20 p-4 text-xs text-[#ff8c00] mono uppercase tracking-wider leading-relaxed">
                    <strong>Warning:</strong> Resetting your master password does not recover your old encrypted data. Your old data remains encrypted with your old password.
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full bg-white text-black font-semibold px-4 py-3 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center mono text-sm uppercase tracking-widest"
                >
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                        "Send Reset Link"
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <Link href="/" className="mono text-[10px] text-gray-500 hover:text-white uppercase tracking-widest transition-colors">
                    ← Back to Home
                </Link>
            </div>
        </motion.div>
    );
}
