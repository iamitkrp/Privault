import Link from "next/link";
import { FileText, ArrowLeft, Database, GitBranch } from "lucide-react";
import { Metadata } from "next";
import { AnimatedLogo } from "@/components/ui/animated-logo";

export const metadata: Metadata = {
    title: "Terms of Service — Privault",
    description: "Privault's terms of service. Understand your rights and responsibilities when using our zero-knowledge password manager.",
};

export default function TermsOfServicePage() {
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
                    <FileText className="w-8 h-8 text-[#ff4500]" />
                    <h1 className="text-3xl font-bold text-white mono tracking-widest uppercase">Terms of Service</h1>
                </div>
                <div className="space-y-12 text-gray-400 leading-relaxed mono uppercase tracking-wider">
                    <p className="text-xs text-gray-600 tracking-widest">Last updated: March 8, 2026</p>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 tracking-widest">1. Acceptance</h2>
                        <p>By using Privault, you agree to these terms of service. If you do not agree, please do not use the service.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 tracking-widest">2. Service Description</h2>
                        <p>Privault is a zero-knowledge password manager that encrypts your credentials on your device. We provide secure storage, retrieval, and management of encrypted password data.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 tracking-widest">3. Your Responsibilities</h2>
                        <ul className="list-disc ml-6 space-y-4 mt-4 text-[#ff4500]/80">
                            <li><strong className="text-white">Master Password:</strong> <span className="text-gray-400">You are solely responsible for remembering your master password. We cannot recover it or decrypt your data without it.</span></li>
                            <li><strong className="text-white">Account Security:</strong> <span className="text-gray-400">Keep your login credentials secure and notify us of any unauthorized access.</span></li>
                            <li><strong className="text-white">Lawful Use:</strong> <span className="text-gray-400">Use the service only for lawful purposes.</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 tracking-widest">4. No Warranty</h2>
                        <p>Privault is provided &quot;as is&quot; without warranties of any kind. While we use industry-standard encryption (AES-256-GCM, PBKDF2), no system is 100% secure. We are not liable for any data loss or security breaches beyond our reasonable control.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 tracking-widest">5. Data Ownership</h2>
                        <p>Your data belongs to you. We do not claim ownership over any credentials or information you store in your vault. You may export or delete your data at any time.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 tracking-widest">6. Termination</h2>
                        <p>You may close your account at any time. We reserve the right to suspend accounts engaged in abuse or violation of these terms.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 tracking-widest">7. Changes to Terms</h2>
                        <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
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
