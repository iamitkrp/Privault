import { FileText, Database, GitBranch } from "lucide-react";
import { Metadata } from "next";
import { ImmersiveBackground } from "@/components/landing/immersive-background";
import { LandingNav } from "@/components/landing/LandingNav";

export const metadata: Metadata = {
    title: "Terms of Service — Privault",
    description: "Privault's terms of service. Understand your rights and responsibilities when using our zero-knowledge password manager.",
};

export default function TermsOfServicePage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-transparent font-sans text-foreground">
            <ImmersiveBackground />
            <LandingNav />

            {/* Main content */}
            <main className="relative z-10 pt-28 pb-24 px-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-12">
                    <FileText className="w-8 h-8 text-success" />
                    <h1 className="text-3xl font-bold text-foreground mono tracking-widest uppercase">Terms of Service</h1>
                </div>
                <div className="space-y-12 text-fg-secondary leading-relaxed mono uppercase tracking-wider">
                    <p className="text-xs text-fg-muted tracking-widest">Last updated: March 8, 2026</p>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4 tracking-widest">1. Acceptance</h2>
                        <p>By using Privault, you agree to these terms of service. If you do not agree, please do not use the service.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4 tracking-widest">2. Service Description</h2>
                        <p>Privault is a zero-knowledge password manager that encrypts your credentials on your device. We provide secure storage, retrieval, and management of encrypted password data.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4 tracking-widest">3. Your Responsibilities</h2>
                        <ul className="list-disc ml-6 space-y-4 mt-4 text-success/80">
                            <li><strong className="text-foreground">Master Password:</strong> <span className="text-fg-secondary">You are solely responsible for remembering your master password. We cannot recover it or decrypt your data without it.</span></li>
                            <li><strong className="text-foreground">Account Security:</strong> <span className="text-fg-secondary">Keep your login credentials secure and notify us of any unauthorized access.</span></li>
                            <li><strong className="text-foreground">Lawful Use:</strong> <span className="text-fg-secondary">Use the service only for lawful purposes.</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4 tracking-widest">4. No Warranty</h2>
                        <p>Privault is provided &quot;as is&quot; without warranties of any kind. While we use industry-standard encryption (AES-256-GCM, PBKDF2), no system is 100% secure. We are not liable for any data loss or security breaches beyond our reasonable control.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4 tracking-widest">5. Data Ownership</h2>
                        <p>Your data belongs to you. We do not claim ownership over any credentials or information you store in your vault. You may export or delete your data at any time.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4 tracking-widest">6. Termination</h2>
                        <p>You may close your account at any time. We reserve the right to suspend accounts engaged in abuse or violation of these terms.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4 tracking-widest">7. Changes to Terms</h2>
                        <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
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
