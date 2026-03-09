import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function VerifyEmailPage() {
    return (
        <div className="glass rounded-xl p-8 shadow-glass animate-in fade-in zoom-in-95 duration-500 text-center">
            <div className="w-16 h-16 bg-brand/20 text-brand rounded-full flex items-center justify-center mx-auto mb-6">
                <MailCheck className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-4">
                Check Your Email
            </h1>

            <p className="text-secondary mb-6 leading-relaxed">
                We&apos;ve sent a magic link to your email address. Please click the link to verify your account and securely access your vault.
            </p>

            <div className="bg-brand/5 border border-brand/20 rounded-lg p-4 text-xs text-brand/80 mb-8 text-left">
                <strong>Security tip:</strong> Never share your verification links with anyone. Privault staff will never ask for your master password or verification codes.
            </div>

            <Link
                href="/login"
                className="text-brand hover:text-brand-hover font-medium transition-colors inline-block"
            >
                Return to Login
            </Link>
        </div>
    );
}
