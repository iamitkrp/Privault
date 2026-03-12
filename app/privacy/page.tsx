import Link from "next/link";
import { Shield, ArrowLeft, Database, GitBranch } from "lucide-react";
import { Metadata } from "next";
import { AnimatedLogo } from "@/components/ui/animated-logo";

export const metadata: Metadata = {
    title: "Privacy Policy — Privault",
    description: "Privault's privacy policy. Learn how we protect your data with zero-knowledge encryption.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans relative overflow-hidden">
            {/* Grid background matching landing page */}
            <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
            <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none z-0" />

            {/* Navigation bar */}
            <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md border-b border-white/10 bg-black/40">
                <AnimatedLogo />
                <Link 
                    href="/" 
                    className="px-6 py-2 border border-white/20 text-white hover:bg-white/10 transition-colors uppercase tracking-widest mono text-xs flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
            </nav>

            {/* Main content */}
            <main className="relative z-10 pt-28 pb-24 px-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-12">
                    <Shield className="w-8 h-8 text-[#ff4500]" />
                    <h1 className="text-3xl font-bold text-white mono tracking-widest uppercase">Privacy Policy</h1>
                </div>
                <div className="space-y-12 text-gray-400 leading-relaxed mono uppercase tracking-wider">
                    <p className="text-xs text-gray-600 tracking-widest">Last updated: March 8, 2026</p>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 tracking-widest">1. Zero-Knowledge Architecture</h2>
                        <p>Privault uses a zero-knowledge encryption architecture. This means your master password and decrypted credentials <strong className="text-white">never leave your device</strong>. All encryption and decryption happens entirely in your browser using AES-256-GCM. Our servers only store encrypted ciphertext that is computationally impossible to decrypt without your master password.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 tracking-widest">2. Data We Collect</h2>
                        <p>We collect the minimum data necessary to provide the service:</p>
                        <ul className="list-disc ml-6 space-y-2 mt-4 text-[#ff4500]/80">
                            <li><span className="text-gray-400">Email address (for authentication and account recovery)</span></li>
                            <li><span className="text-gray-400">Encrypted vault data (unreadable without your master password)</span></li>
                            <li><span className="text-gray-400">Account metadata (creation date, last login timestamp)</span></li>
                            <li><span className="text-gray-400">Security event logs (login attempts, vault access patterns)</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 tracking-widest">3. Data We Cannot Access</h2>
                        <p>Due to our zero-knowledge design, we <strong className="text-white">cannot</strong> access:</p>
                        <ul className="list-disc ml-6 space-y-2 mt-4 text-[#ff4500]/80">
                            <li><span className="text-gray-400">Your master password</span></li>
                            <li><span className="text-gray-400">Your decrypted passwords, notes, or credentials</span></li>
                            <li><span className="text-gray-400">Your derived encryption keys</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 tracking-widest">4. Data Storage</h2>
                        <p>Your encrypted data is stored securely on Supabase infrastructure with row-level security policies ensuring each user can only access their own data. All data at rest is encrypted by the hosting provider in addition to our client-side encryption.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 tracking-widest">5. Data Deletion</h2>
                        <p>You can delete your account and all associated data at any time from the Settings page. Account deletion is permanent and irreversible — all encrypted data is removed from our servers.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 tracking-widest">6. Contact</h2>
                        <p>For privacy-related inquiries, please open an issue on our project repository or contact us via email.</p>
                    </section>
                </div>
            </main>

            {/* Terminal bottom bar */}
            <div className="fixed bottom-0 inset-x-0 h-8 border-t border-[#333] bg-black/80 backdrop-blur-md z-50 flex items-center justify-between px-4 mono text-[10px] uppercase text-gray-500 hidden sm:flex">
                <div className="flex items-center gap-4">
                    <span className="text-white bg-[#333] px-2 py-0.5">SECURE_ENV: READY</span>
                    <span>&gt;&gt;&gt;&gt;&gt;</span>
                    <span className="text-[#ff4500]">LEGAL: VERIFIED</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1"><Database className="w-3 h-3" /> VAULT_SYNC: ACTIVE</span>
                    <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> PROTOCOL: v2.4.0</span>
                </div>
            </div>
        </div>
    );
}
