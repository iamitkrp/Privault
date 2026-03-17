"use client";

import { Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation"; // Added useRouter

export default function VerifyEmailPage() {
    const router = useRouter(); // Initialized useRouter
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-bg-secondary border border-border p-8 text-center"
            >
                {/* Animated Logo */}
                <div className="relative w-16 h-16 mb-8 flex items-center justify-center mx-auto">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/20">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                    <motion.svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary drop-shadow-[0_0_12px_rgba(255,69,0,1)] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <motion.path
                            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                            initial={{ pathLength: 0, pathOffset: 0 }}
                            animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 1, 2] }}
                            transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                        />
                    </motion.svg>
                </div>

                <div className="mono text-[10px] text-primary tracking-widest uppercase mb-6">VAULT_INITIALIZED // AWAITING_VERIFICATION</div>

                <div className="w-16 h-16 border border-border-secondary flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-foreground" />
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-foreground mb-4">
                    Check Your Email
                </h1>

                <p className="text-fg-secondary text-sm mb-6 leading-relaxed">
                    We&apos;ve sent a magic link to your email address. Please click the link to verify your account and securely access your vault.
                </p>

                <div className="bg-success/5 border border-success/20 p-4 text-xs text-success/80 mb-8 text-left mono uppercase tracking-wider leading-relaxed">
                    <strong>Security tip:</strong> Never share your verification links with anyone. Privault staff will never ask for your master password or verification codes.
                </div>

                <button
                    onClick={() => router.push("/login")}
                    className="w-full bg-transparent border border-border text-foreground hover:bg-foreground/5 py-3 transition-colors uppercase tracking-widest mono text-sm flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Return to Login
                </button>
            </motion.div>
        </div>
    );
}
