"use client";

import { useAuth } from "@/components/auth/auth-context";
import { OTPGate } from "@/components/auth/otp-gate";
import { Shield, Activity, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { ImmersiveBackground } from "@/components/landing/immersive-background";

/**
 * LoginOTPGate — A full-screen OTP verification gate shown after login.
 * Blocks access to all app content until the user verifies their identity
 * with a 6-digit OTP sent to their email.
 *
 * This is in-memory only — refreshing the page or logging out resets it.
 */
export function LoginOTPGate({ children }: { children: React.ReactNode }) {
    const { user, profile, otpVerified, verifyLoginOtp, signOut } = useAuth();

    // If no user or OTP already verified, render children normally
    if (!user || otpVerified) {
        return <>{children}</>;
    }

    // Check if user has OTP on login enabled in their security settings
    // Default to false for existing users who don't have the setting yet (opt-in)
    const requireOtpOnLogin = profile?.security_settings?.require_otp_on_login ?? false;

    // If OTP on login is disabled, skip the gate
    if (!requireOtpOnLogin) {
        return <>{children}</>;
    }

    // Show the OTP gate
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-transparent">
            <ImmersiveBackground />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="border border-border bg-bg-secondary p-8 sm:p-10 relative overflow-hidden">
                    {/* Background accent */}
                    <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

                    <div className="relative z-10 flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border-secondary pb-6">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-success" />
                                <span className="mono text-sm uppercase tracking-[0.2em] text-foreground">
                                    Identity Verification
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-widest text-success px-3 py-1.5 bg-success/10 border border-success/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                Required
                            </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-3">
                            <h3 className="mono text-sm tracking-widest text-fg-muted uppercase flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Two-Factor Authentication
                            </h3>
                            <p className="mono text-xs leading-relaxed text-fg-secondary uppercase tracking-widest max-w-[400px]">
                                A verification code has been requested for your account.
                                Confirm your identity to proceed to the encrypted vault.
                            </p>
                        </div>

                        {/* OTP Gate */}
                        <OTPGate
                            purpose="login"
                            actionLabel="Send Verification Code"
                            description="A 6-digit code will be sent to your email. This is required on every login to protect your vault."
                            onVerified={verifyLoginOtp}
                        />

                        {/* Sign out option */}
                        <div className="pt-4 border-t border-border-secondary">
                            <button
                                onClick={signOut}
                                className="w-full py-2.5 mono text-[10px] uppercase tracking-widest text-fg-muted hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                            >
                                Sign out instead
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-4 text-fg-secondary mono text-[9px] uppercase tracking-widest px-2 mt-4">
                    <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-success" />
                        <span>SESSION: AUTHENTICATED</span>
                    </div>
                    <span>OTP: PENDING</span>
                </div>
            </motion.div>
        </div>
    );
}
