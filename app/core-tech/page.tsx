import { LandingNav } from "@/components/landing/LandingNav";
import { Hexagon } from "lucide-react";
import Link from "next/link";


export default function CoreTechPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-brand-subtle overflow-hidden relative">
      {/* Immersive Grid Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-grid-pattern opacity-40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background/90" />
      </div>

      <LandingNav />

      <main className="relative z-10 pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-start min-h-screen">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground mb-6 uppercase">
          Core Technology
        </h1>
        <p className="mono text-sm text-fg-muted max-w-2xl mb-16 uppercase tracking-widest leading-relaxed">
          The cryptographic primitives and methodologies that power Privault's absolute security guarantees.
        </p>

        {/* Content Section */}
        <div className="w-full bg-bg-secondary border border-border glass p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.03] blur-2xl rounded-full translate-x-10 -translate-y-10" />

          <h2 className="mono text-xl font-bold text-foreground mb-4 tracking-[0.2em] uppercase">
            AES-256-GCM Implementation
          </h2>
          <p className="mono text-sm text-fg-secondary leading-relaxed mb-8">
            Our encryption standard uses Advanced Encryption Standard (AES) with 256-bit keys operated in Galois/Counter Mode (GCM). This provides both confidentiality and data origin authentication (integrity).
          </p>
          
          <h2 className="mono text-xl font-bold text-foreground mb-4 tracking-[0.2em] uppercase mt-12">
            PBKDF2 Key Derivation
          </h2>
          <p className="mono text-sm text-fg-secondary leading-relaxed mb-8">
            Master Passwords are never used directly. They are stretched via Password-Based Key Derivation Function 2 (PBKDF2) using SHA-256 with 100,000 iterations to make brute-force attacks computationally infeasible.
          </p>
          
          <h2 className="mono text-xl font-bold text-foreground mb-4 tracking-[0.2em] uppercase mt-12">
            Secure Entropy Generation
          </h2>
          <p className="mono text-sm text-fg-secondary leading-relaxed">
            All random numbers, salts, and initialization vectors (IVs) are generated using the Web Crypto API's cryptographically secure pseudo-random number generator (CSPRNG), ensuring true entropy.
          </p>

          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-amber-500" />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 pt-16 pb-20 border-t border-border bg-background text-xs text-fg-secondary mono uppercase tracking-widest">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Hexagon className="w-4 h-4 text-fg-muted" strokeWidth={1.5} />
            <span>© {new Date().getFullYear()} Privault [SECURE].</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
