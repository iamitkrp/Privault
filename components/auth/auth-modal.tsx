"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/auth-context";
import { SecurityService } from "@/services/security.service";
import { VALIDATION } from "@/constants";
import { Activity, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: "login" | "signup";
    onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, initialMode = "login", onSuccess }: AuthModalProps) {
    const { user, authService, supabaseClient, storeLoginPasswordHash } = useAuth();
    const router = useRouter();

    const [mode, setMode] = useState<"login" | "signup">(initialMode);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);

    // Track whether login API call succeeded, so we can wait for auth state
    const loginSucceededRef = useRef(false);

    // Reset state when modal opens/closes or mode changes
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setError(null);
            setSignupSuccess(false);
            loginSucceededRef.current = false;
        }
    }, [isOpen, initialMode]);

    // Handle initial mode change from props
    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    // Wait for the auth context's `user` to be set after a successful login,
    // THEN navigate. This avoids the race where router.push fires before
    // onAuthStateChange has updated the user state in context.
    useEffect(() => {
        if (loginSucceededRef.current && user) {
            loginSucceededRef.current = false;
            onClose();
            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/vault");
            }
        }
    }, [user, onClose, onSuccess, router]);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const result = await authService.signIn(email, password);

        if (!result.success) {
            // Fire-and-forget: log failure event without blocking the UI
            try {
                const security = new SecurityService(supabaseClient);
                security.logEvent(email, 'login_failure', 'warning', { email, reason: result.error.message }).catch(() => {});
            } catch { /* non-blocking */ }

            setError(result.error.message);
            setIsLoading(false);
        } else {
            // Store the login password hash in-memory for vault≠login enforcement
            storeLoginPasswordHash(password);
            setPassword("");

            // Fire-and-forget: track the successful login without blocking the UI
            try {
                const security = new SecurityService(supabaseClient);
                supabaseClient.auth.getSession().then(({ data: { session } }) => {
                    if (session?.user) {
                        security.trackLoginAttempt(session.user.id, true, email).catch(() => {});
                    }
                }).catch(() => {});
            } catch { /* non-blocking */ }

            // Mark login as successful — the useEffect above will handle
            // navigation once `user` is set by the auth context.
            loginSucceededRef.current = true;

            // Keep the loading overlay visible while we wait for onAuthStateChange
            // to fire and the useEffect to navigate. Don't call onClose here.
        }
    };

    const handleSignupSubmit = async (e: React.FormEvent) => {
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
            setSignupSuccess(true);
            setTimeout(() => {
                onClose();
                router.push("/verify-email");
            }, 2000);
        }
    };

    const handleSubmit = mode === "login" ? handleLoginSubmit : handleSignupSubmit;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans selection:bg-success/30">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-md"
                    >
                        {/* Grid background matching landing page */}
                        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
                    </motion.div>

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-[400px] bg-bg-secondary border border-border shadow-2xl overflow-hidden p-8 sm:p-10"
                    >
                        {/* Subtle top highlight */}
                        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

                        {/* Close button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-fg-muted hover:text-foreground border border-border-secondary hover:border-border bg-transparent hover:bg-foreground/5 transition-colors z-20"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {signupSuccess ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 border border-border-secondary flex items-center justify-center mx-auto mb-6 text-2xl text-foreground">
                                    ✓
                                </div>
                                <div className="mono text-[10px] text-success tracking-widest uppercase mb-3">VAULT_INITIALIZED</div>
                                <h1 className="text-2xl font-bold text-foreground tracking-tighter mb-3">Vault Created</h1>
                                <p className="mono text-[10px] text-fg-muted uppercase tracking-widest leading-relaxed">
                                    Cryptographic provisioning complete. Redirecting to verification...
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Animated Logo + Brand Text */}
                                <div className="flex items-center gap-3 mb-8 group">
                                    <div className="relative w-10 h-10 flex items-center justify-center">
                                        <svg
                                            width="32"
                                            height="32"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-foreground/20 transition-colors duration-500"
                                        >
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                        </svg>

                                        {/* The glowing animated tracer line */}
                                        <motion.svg
                                            width="32"
                                            height="32"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-success drop-shadow-[0_0_12px_var(--color-success)] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                        >
                                            <motion.path
                                                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                                                initial={{ pathLength: 0, pathOffset: 0 }}
                                                animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 1, 2] }}
                                                transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                                            />
                                        </motion.svg>
                                    </div>
                                    <span className="mono text-base font-bold tracking-[0.2em] text-foreground">
                                        PRIVAULT.
                                    </span>
                                </div>

                                {/* Header */}
                                <div className="mb-8 pr-8">
                                    <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                                        {mode === "login" ? "Welcome back." : "Create Vault."}
                                    </h1>
                                    <p className="text-sm text-fg-muted">
                                        {mode === "login" ? "Enter your credentials to continue." : "Zero-knowledge encrypted storage."}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                                                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                className="w-full border border-red-900/40 bg-red-950/20 text-red-400 text-xs px-4 py-3 flex items-start gap-2 overflow-hidden"
                                            >
                                                <span className="font-bold shrink-0 text-red-500">!</span>
                                                <span className="leading-relaxed">{error}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="space-y-1.5">
                                        <label htmlFor="email" className="mono text-[9px] uppercase tracking-widest text-fg-muted">
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={isLoading}
                                            className="w-full bg-bg-tertiary border border-border px-4 py-3 text-foreground text-sm focus:outline-none focus:border-success/60 focus:bg-background transition-all disabled:opacity-50 placeholder-fg-secondary"
                                            placeholder="you@example.com"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="password" className="mono text-[9px] uppercase tracking-widest text-fg-muted">
                                                Master Password
                                            </label>
                                            {mode === "login" ? (
                                                <button
                                                    type="button" 
                                                    onClick={() => router.push("/forgot-password")} 
                                                    className="mono text-[9px] uppercase tracking-widest text-fg-muted hover:text-foreground transition-colors" 
                                                    tabIndex={-1}
                                                >
                                                    Forgot Password?
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-fg-muted">Min {VALIDATION.password.minLength} chars</span>
                                            )}
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isLoading}
                                            className="w-full bg-bg-tertiary border border-border px-4 py-3 text-foreground tracking-[0.2em] font-mono focus:outline-none focus:border-success/60 focus:bg-background transition-all disabled:opacity-50 placeholder-fg-secondary"
                                            placeholder="••••••••••••"
                                        />
                                    </div>

                                    {mode === "signup" && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-1.5 overflow-hidden"
                                        >
                                            <label htmlFor="confirmPassword" className="mono text-[9px] uppercase tracking-widest text-fg-muted">
                                                Confirm Password
                                            </label>
                                            <input
                                                id="confirmPassword"
                                                type="password"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                disabled={isLoading}
                                                className="w-full bg-bg-tertiary border border-border px-4 py-3 text-foreground tracking-[0.2em] font-mono focus:outline-none focus:border-success/60 focus:bg-background transition-all disabled:opacity-50 placeholder-fg-secondary"
                                                placeholder="••••••••••••"
                                            />
                                        </motion.div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading || !email || !password || (mode === "signup" && !confirmPassword)}
                                        className="w-full bg-foreground text-background font-bold py-4 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:bg-foreground/20 disabled:text-fg-secondary disabled:pointer-events-none flex items-center justify-center gap-2 mt-4 mono text-xs uppercase tracking-[0.2em]"
                                    >
                                        {isLoading ? (
                                            <div className="relative w-5 h-5 flex items-center justify-center">
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="text-black/20"
                                                >
                                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                </svg>
                                                <motion.svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="text-background drop-shadow-[0_0_6px_rgba(var(--color-background),0.6)] absolute inset-0"
                                                >
                                                    <motion.path
                                                        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                                                        initial={{ pathLength: 0, pathOffset: 0 }}
                                                        animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 1, 2] }}
                                                        transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                                                    />
                                                </motion.svg>
                                            </div>
                                        ) : (
                                            mode === "login" ? "Sign In" : "Create Account"
                                        )}
                                    </button>
                                </form>

                                <div className="mt-8 pt-6 border-t border-border-secondary flex items-center justify-between mono uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5 text-fg-muted text-[9px]">
                                        <Activity className="w-3 h-3 text-success" />
                                        <span>P2P-AES256 Encrypted</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setMode(mode === "login" ? "signup" : "login");
                                            setError(null);
                                        }}
                                        className="text-foreground hover:text-success bg-foreground/5 hover:bg-foreground/10 px-5 py-2.5 border border-border transition-all text-xs font-bold"
                                    >
                                        {mode === "login" ? "SIGN UP →" : "SIGN IN →"}
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {isLoading && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                                        >
                                            <div className="relative w-14 h-14 flex items-center justify-center mb-4">
                                                <svg
                                                    width="32"
                                                    height="32"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="text-white/10"
                                                >
                                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                </svg>
                                                <motion.svg
                                                    width="32"
                                                    height="32"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="text-success drop-shadow-[0_0_16px_var(--color-success)] absolute inset-0"
                                                >
                                                    <motion.path
                                                        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                                                        initial={{ pathLength: 0, pathOffset: 0 }}
                                                        animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 1, 2] }}
                                                        transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                                                    />
                                                </motion.svg>
                                            </div>
                                            <span className="mono text-[9px] uppercase tracking-widest text-fg-muted">
                                                {mode === "login" ? "AUTHENTICATING..." : "PROVISIONING VAULT..."}
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </motion.div>

                    {/* Terminal bottom bar */}
                    <div className="fixed bottom-0 inset-x-0 h-8 border-t border-border bg-background/80 backdrop-blur-md z-50 flex items-center justify-between px-4 mono text-[10px] uppercase text-fg-secondary hidden sm:flex pointer-events-none">
                        <div className="flex items-center gap-4">
                            <span className="text-foreground bg-border-secondary px-2 py-0.5">SECURE_ENV: READY</span>
                            <span>&gt;&gt;&gt;&gt;&gt;</span>
                            <span className="text-success">0 / 100%</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> VAULT_SYNC: STANDBY</span>
                            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> PROTOCOL: v2.4.0</span>
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
