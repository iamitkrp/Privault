import Link from "next/link";
import { Shield, ArrowLeft, Database, GitBranch } from "lucide-react";
import { Metadata } from "next";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { ImmersiveBackground } from "@/components/landing/immersive-background";

export const metadata: Metadata = {
    title: "Privacy Policy — Privault",
    description: "Privault's privacy policy. Learn how we protect your data with zero-knowledge encryption.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-transparent font-sans text-foreground">
            <ImmersiveBackground />

            {/* Navigation bar */}
            <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md border-b border-foreground/10 bg-background/40">
                <AnimatedLogo />
                <Link 
                    href="/" 
                    className="px-6 py-2 border border-foreground/20 text-foreground hover:bg-foreground/10 transition-colors uppercase tracking-widest mono text-xs flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
            </nav>

            {/* Main content */}
            <main className="relative z-10 pt-28 pb-24 px-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-12">
                    <Shield className="w-8 h-8 text-success" />
                    <h1 className="text-3xl font-bold text-foreground mono tracking-widest uppercase">Privacy Policy</h1>
                </div>
                <div className="space-y-12 text-fg-secondary leading-relaxed mono uppercase tracking-wider">
                    <p className="text-xs text-fg-muted tracking-widest">Last updated: March 8, 2026</p>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4 tracking-widest">1. Zero-Knowledge Architecture</h2>
                        <p>Privault uses a zero-knowledge encryption architecture. This means your master password and decrypted credentials <strong className="text-foreground">never leave your device</strong>. All encryption and decryption happens entirely in your browser using AES-256-GCM. Our servers only store encrypted ciphertext that is computationally impossible to decrypt without your master password.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4 tracking-widest">2. Data We Collect</h2>
                        <p>We collect the minimum data necessary to provide the service:</p>
                        <ul className="list-disc ml-6 space-y-2 mt-4 text-success/80">
                            <li><span className="text-fg-secondary">Email address (for authentication and account recovery)</span></li>
                            <li><span className="text-fg-secondary">Encrypted vault data (unreadable without your master password)</span></li>
                            <li><span className="text-fg-secondary">Account metadata (creation date, last login timestamp)</span></li>
                            <li><span className="text-fg-secondary">Security event logs (login attempts, vault access patterns)</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4 tracking-widest">3. Data We Cannot Access</h2>
                        <p>Due to our zero-knowledge design, we <strong className="text-foreground">cannot</strong> access:</p>
                        <ul className="list-disc ml-6 space-y-2 mt-4 text-success/80">
                            <li><span className="text-fg-secondary">Your master password</span></li>
                            <li><span className="text-fg-secondary">Your decrypted passwords, notes, or credentials</span></li>
                            <li><span className="text-fg-secondary">Your derived encryption keys</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4 tracking-widest">4. Data Storage</h2>
                        <p>Your encrypted data is stored securely on Supabase infrastructure with row-level security policies ensuring each user can only access their own data. All data at rest is encrypted by the hosting provider in addition to our client-side encryption.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4 tracking-widest">5. Data Deletion</h2>
                        <p>You can delete your account and all associated data at any time from the Settings page. Account deletion is permanent and irreversible — all encrypted data is removed from our servers.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4 tracking-widest">6. Contact</h2>
                        <p>For privacy-related inquiries, please open an issue on our project repository or contact us via email.</p>
                    </section>
                </div>
            </main>

            {/* Terminal bottom bar */}
            <div className="fixed bottom-0 inset-x-0 h-8 border-t border-border-secondary bg-background/80 backdrop-blur-md z-50 flex items-center justify-between px-4 mono text-[10px] uppercase text-fg-muted hidden sm:flex">
                <div className="flex items-center gap-4">
                    <span className="text-foreground bg-bg-secondary px-2 py-0.5">SECURE_ENV: READY</span>
                    <span>&gt;&gt;&gt;&gt;&gt;</span>
                    <span className="text-success">LEGAL: VERIFIED</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1"><Database className="w-3 h-3" /> VAULT_SYNC: ACTIVE</span>
                    <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> PROTOCOL: v2.4.0</span>
                </div>
            </div>
        </div>
    );
}
