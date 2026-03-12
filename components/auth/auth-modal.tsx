"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/auth-context";
import { SecurityService } from "@/services/security.service";
import { VALIDATION } from "@/constants";
import { Activity, ChevronRight, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
    const { authService, supabaseClient } = useAuth();
    const router = useRouter();

    const [mode, setMode] = useState<"login" | "signup">(initialMode);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);

    // Reset state when modal opens/closes or mode changes
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setError(null);
            setSignupSuccess(false);
        }
    }, [isOpen, initialMode]);

    // Handle initial mode change from props
    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    const handleLoginSubmit = async (e: React.FormEvent) => {
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
        } else {
            setIsLoading(false);
            onClose(); // Close modal on successful login
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-md border border-[#222] bg-black p-8 shadow-2xl overflow-hidden"
                    >
                        {/* Corner accent */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#ff4500]" />
                        
                        {/* Close button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {signupSuccess ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 border border-[#333] flex items-center justify-center mx-auto mb-6 text-2xl text-white">
                                    ✓
                                </div>
                                <div className="mono text-[10px] text-[#ff4500] tracking-widest uppercase mb-3">VAULT_INITIALIZED</div>
                                <h1 className="text-2xl font-bold text-white tracking-tighter mb-3">Vault Created</h1>
                                <p className="mono text-xs text-gray-500 uppercase tracking-widest leading-relaxed">
                                    Cryptographic provisioning complete. Redirecting to verification...
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="mb-8 pr-8">
                                    <div className="mono text-[10px] text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-5">
                                        <Activity className="w-3 h-3 text-[#ff4500]" />
                                        {mode === "login" ? "SECURE_AUTH // VAULT_ACCESS" : "INITIALIZE_VAULT // ZERO_KNOWLEDGE"}
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-white mb-2">
                                        {mode === "login" ? "Welcome back" : "Create Your Vault"}
                                    </h1>
                                    <p className="mono text-xs text-gray-500 uppercase tracking-widest">
                                        {mode === "login" ? "Enter credentials to access your vault" : "Zero-knowledge encrypted storage"}
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
                                            className="w-full bg-[#050505] border border-[#333] px-4 py-3 text-white text-sm mono focus:outline-none focus:border-[#ff4500] transition-colors disabled:opacity-50 placeholder-gray-700"
                                            placeholder="you@example.com"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="password" className="mono text-[10px] uppercase tracking-widest text-gray-500">
                                                Master Password
                                            </label>
                                            {mode === "login" ? (
                                                <button
                                                    type="button" 
                                                    onClick={() => router.push("/forgot-password")} 
                                                    className="mono text-[10px] text-gray-600 hover:text-white transition-colors uppercase tracking-widest" 
                                                    tabIndex={-1}
                                                >
                                                    Forgot?
                                                </button>
                                            ) : (
                                                <span className="mono text-[10px] text-gray-600 uppercase tracking-widest">Min {VALIDATION.password.minLength} chars</span>
                                            )}
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isLoading}
                                            className="w-full bg-[#050505] border border-[#333] px-4 py-3 text-white mono tracking-widest focus:outline-none focus:border-[#ff4500] transition-colors disabled:opacity-50 placeholder-gray-700"
                                            placeholder="••••••••••••"
                                        />
                                    </div>

                                    {mode === "signup" && (
                                        <>
                                            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
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
                                                    className="w-full bg-[#050505] border border-[#333] px-4 py-3 text-white mono tracking-widest focus:outline-none focus:border-[#ff4500] transition-colors disabled:opacity-50 placeholder-gray-700"
                                                    placeholder="••••••••••••"
                                                />
                                            </div>
                                            
                                            {/* Warning block */}
                                            <div className="border border-[#333] bg-[#0a0a0a] p-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300 delay-100">
                                                <AlertTriangle className="w-4 h-4 text-[#ff4500] shrink-0 mt-0.5" />
                                                <p className="mono text-[10px] text-gray-500 uppercase tracking-wide leading-relaxed">
                                                    <span className="text-white">Critical:</span> If you forget your master password, your data cannot be recovered. Zero-knowledge encrypted.
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading || !email || !password || (mode === "signup" && !confirmPassword)}
                                        className="w-full bg-white text-black mono font-bold text-xs uppercase tracking-widest px-4 py-3.5 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-4"
                                    >
                                        {isLoading ? (
                                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                {mode === "login" ? "Unlock Vault" : "Initialize Vault"} 
                                                <ChevronRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-8 pt-6 border-t border-[#1a1a1a] mono text-[10px] text-gray-600 uppercase tracking-widest text-center">
                                    {mode === "login" ? (
                                        <>
                                            No vault?{" "}
                                            <button 
                                                type="button" 
                                                onClick={() => setMode("signup")}
                                                className="text-white hover:text-[#ff4500] transition-colors"
                                            >
                                                Create one →
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            Already have a vault?{" "}
                                            <button 
                                                type="button" 
                                                onClick={() => setMode("login")}
                                                className="text-white hover:text-[#ff4500] transition-colors"
                                            >
                                                Sign in →
                                            </button>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
