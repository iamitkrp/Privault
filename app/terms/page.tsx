import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service — Privault",
    description: "Privault's terms of service. Understand your rights and responsibilities when using our zero-knowledge password manager.",
};

export default function TermsOfServicePage() {
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
                    <FileText className="w-8 h-8 text-brand" />
                    <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
                </div>
                <div className="prose prose-invert max-w-none space-y-6 text-secondary leading-relaxed">
                    <p className="text-sm text-secondary/60">Last updated: March 8, 2026</p>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">1. Acceptance</h2>
                        <p>By using Privault, you agree to these terms of service. If you do not agree, please do not use the service.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">2. Service Description</h2>
                        <p>Privault is a zero-knowledge password manager that encrypts your credentials on your device. We provide secure storage, retrieval, and management of encrypted password data.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">3. Your Responsibilities</h2>
                        <ul className="list-disc ml-6 space-y-1 mt-2">
                            <li><strong className="text-foreground">Master Password:</strong> You are solely responsible for remembering your master password. We cannot recover it or decrypt your data without it.</li>
                            <li><strong className="text-foreground">Account Security:</strong> Keep your login credentials secure and notify us of any unauthorized access.</li>
                            <li><strong className="text-foreground">Lawful Use:</strong> Use the service only for lawful purposes.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">4. No Warranty</h2>
                        <p>Privault is provided &quot;as is&quot; without warranties of any kind. While we use industry-standard encryption (AES-256-GCM, PBKDF2), no system is 100% secure. We are not liable for any data loss or security breaches beyond our reasonable control.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">5. Data Ownership</h2>
                        <p>Your data belongs to you. We do not claim ownership over any credentials or information you store in your vault. You may export or delete your data at any time.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">6. Termination</h2>
                        <p>You may close your account at any time. We reserve the right to suspend accounts engaged in abuse or violation of these terms.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">7. Changes to Terms</h2>
                        <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
                    </section>
                </div>
            </main>
        </div>
    );
}
