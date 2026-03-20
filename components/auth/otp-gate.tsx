"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { OTPService } from "@/services/otp.service";
import { ShieldCheck, Loader2, AlertTriangle, Send, X, Mail } from "lucide-react";

type OTPPurpose = "login" | "vault_access" | "vault_password_change" | "email_update" | "profile_delete";

interface OTPGateProps {
    purpose: OTPPurpose;
    /** Label shown on the "Send OTP" button, e.g. "Verify to Export" */
    actionLabel: string;
    /** Called when OTP is verified successfully */
    onVerified: () => void;
    /** Called when the user cancels the OTP flow */
    onCancel?: () => void;
    /** Optional custom description */
    description?: string;
}

/**
 * A reusable OTP Gate component.
 * Sends a 6-digit OTP to the user's email via Resend,
 * then verifies the code against the database.
 */
export function OTPGate({ purpose, actionLabel, onVerified, onCancel, description }: OTPGateProps) {
    const { user, supabaseClient } = useAuth();
    const [step, setStep] = useState<"idle" | "sent" | "verifying">("idle");
    const [otpCode, setOtpCode] = useState("");
    const [error, setError] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [cooldown, setCooldown] = useState(false);

    const otpService = new OTPService(supabaseClient);

    const handleSendOTP = useCallback(async () => {
        if (!user || isSending || cooldown) return;

        setIsSending(true);
        setError("");

        try {
            // 1. Create the OTP in the database (returns plaintext code)
            const result = await otpService.createOTP(user.id, purpose);

            if (!result.success) {
                setError(result.error?.message || "Failed to create verification code.");
                setIsSending(false);
                return;
            }

            // 2. Send the code via email using the API route
            const { data: { session } } = await supabaseClient.auth.getSession();
            const emailRes = await fetch("/api/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ code: result.data.code, purpose }),
            });

            if (!emailRes.ok) {
                setError("Failed to send verification email. Please try again.");
                setIsSending(false);
                return;
            }

            setStep("sent");

            // Cooldown to prevent spam
            setCooldown(true);
            setTimeout(() => setCooldown(false), 60_000);
        } catch (e) {
            setError("Failed to send verification code.");
            console.error(e);
        } finally {
            setIsSending(false);
        }
    }, [user, isSending, cooldown, purpose]);

    const handleVerifyOTP = useCallback(async () => {
        if (!user || otpCode.length !== 6) return;

        setStep("verifying");
        setError("");

        try {
            const result = await otpService.verifyOTP(user.id, otpCode, purpose);

            if (!result.success || !result.data?.verified) {
                setError("Invalid or expired verification code.");
                setStep("sent");
                return;
            }

            onVerified();
        } catch (e) {
            setError("Verification failed. Please try again.");
            setStep("sent");
            console.error(e);
        }
    }, [user, otpCode, purpose, onVerified]);

    const handleCancel = () => {
        setStep("idle");
        setOtpCode("");
        setError("");
        onCancel?.();
    };

    return (
        <div className="space-y-4">
            {/* Description */}
            <div className="flex items-start gap-3 p-3 bg-foreground/5 border border-border/30 text-fg-secondary text-sm">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" />
                <span>{description || "A 6-digit verification code will be sent to your email to confirm this action."}</span>
            </div>

            {step === "idle" && (
                <button
                    onClick={handleSendOTP}
                    disabled={isSending || cooldown}
                    className="w-full py-3 font-bold bg-foreground text-background hover:opacity-90 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mono uppercase tracking-widest text-[10px]"
                >
                    {isSending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending Code...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            {actionLabel}
                        </>
                    )}
                </button>
            )}

            {step !== "idle" && (
                <div className="space-y-3 p-4 border border-border/40 bg-bg-secondary">
                    {/* Email sent confirmation */}
                    <div className="flex items-center gap-2 p-2.5 bg-success/10 border border-success/20 text-success text-sm">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="mono text-xs">
                            Verification code sent to <strong>{user?.email}</strong>
                        </span>
                    </div>

                    <div className="space-y-1.5">
                        <label className="mono text-[10px] text-fg-muted uppercase tracking-widest block font-bold">
                            Enter 6-Digit Verification Code
                        </label>
                        <input
                            type="text"
                            value={otpCode}
                            onChange={e => {
                                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                setOtpCode(val);
                            }}
                            className="w-full bg-background/40 border border-border/40 px-3 py-2.5 text-foreground focus:border-success font-mono text-lg tracking-[0.5em] text-center outline-none transition-colors"
                            placeholder="● ● ● ● ● ●"
                            maxLength={6}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-2.5 bg-error/10 border border-error/20 text-error text-sm">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="flex-1 px-4 py-2.5 bg-foreground/5 border border-border/40 text-foreground hover:bg-foreground/10 transition-colors mono uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                        >
                            <X className="w-3.5 h-3.5" />
                            Cancel
                        </button>
                        <button
                            onClick={handleVerifyOTP}
                            disabled={otpCode.length !== 6 || step === "verifying"}
                            className="flex-1 py-2.5 font-bold bg-foreground text-background hover:opacity-90 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mono uppercase tracking-widest text-[10px]"
                        >
                            {step === "verifying" ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-4 h-4" />
                                    Verify
                                </>
                            )}
                        </button>
                    </div>

                    {/* Resend option */}
                    <div className="text-center">
                        <button
                            onClick={handleSendOTP}
                            disabled={isSending || cooldown}
                            className="mono text-[10px] text-fg-muted uppercase tracking-widest hover:text-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none"
                        >
                            {cooldown ? "Wait 60s to resend" : "Resend Code"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
