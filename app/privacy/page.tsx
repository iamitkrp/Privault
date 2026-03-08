import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy — Privault",
    description: "Privault's privacy policy. Learn how we protect your data with zero-knowledge encryption.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-background">
            <header className="px-6 md:px-12 py-5 max-w-4xl mx-auto">
                <Link href="/" className="flex items-center gap-2 text-secondary hover:text-foreground text-sm transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
            </header>
            <main className="max-w-4xl mx-auto px-6 pb-20">
                <div className="flex items-center gap-3 mb-8">
                    <Shield className="w-8 h-8 text-brand" />
                    <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
                </div>
                <div className="prose prose-invert max-w-none space-y-6 text-secondary leading-relaxed">
                    <p className="text-sm text-secondary/60">Last updated: March 8, 2026</p>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">1. Zero-Knowledge Architecture</h2>
                        <p>Privault uses a zero-knowledge encryption architecture. This means your master password and decrypted credentials <strong className="text-foreground">never leave your device</strong>. All encryption and decryption happens entirely in your browser using AES-256-GCM. Our servers only store encrypted ciphertext that is computationally impossible to decrypt without your master password.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">2. Data We Collect</h2>
                        <p>We collect the minimum data necessary to provide the service:</p>
                        <ul className="list-disc ml-6 space-y-1 mt-2">
                            <li>Email address (for authentication and account recovery)</li>
                            <li>Encrypted vault data (unreadable without your master password)</li>
                            <li>Account metadata (creation date, last login timestamp)</li>
                            <li>Security event logs (login attempts, vault access patterns)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">3. Data We Cannot Access</h2>
                        <p>Due to our zero-knowledge design, we <strong className="text-foreground">cannot</strong> access:</p>
                        <ul className="list-disc ml-6 space-y-1 mt-2">
                            <li>Your master password</li>
                            <li>Your decrypted passwords, notes, or credentials</li>
                            <li>Your derived encryption keys</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">4. Data Storage</h2>
                        <p>Your encrypted data is stored securely on Supabase infrastructure with row-level security policies ensuring each user can only access their own data. All data at rest is encrypted by the hosting provider in addition to our client-side encryption.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">5. Data Deletion</h2>
                        <p>You can delete your account and all associated data at any time from the Settings page. Account deletion is permanent and irreversible — all encrypted data is removed from our servers.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">6. Contact</h2>
                        <p>For privacy-related inquiries, please open an issue on our project repository or contact us via email.</p>
                    </section>
                </div>
            </main>
        </div>
    );
}
