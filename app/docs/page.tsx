import { LandingNav } from "@/components/landing/LandingNav";
import { Hexagon, FileText, Code, Shield } from "lucide-react";
import Link from "next/link";


export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-brand-subtle overflow-hidden relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-grid-pattern opacity-40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background/90" />
      </div>

      <LandingNav />

      <main className="relative z-10 pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center min-h-screen">
        <div className="w-full text-left self-start">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground mb-6 uppercase">
            Documentation
            </h1>
            <p className="mono text-sm text-fg-muted max-w-2xl mb-16 uppercase tracking-widest leading-relaxed">
            The canonical source of truth for Privault's engineering standards.
            </p>
        </div>

        {/* Content Section */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border border-border glass p-[1px]">
          
          <Link href="/core-tech" className="focus:outline-none hover:bg-bg-tertiary transition-colors h-full">    
              <div className="p-8 relative bg-bg-secondary h-full group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] blur-2xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-emerald-500/[0.08]" />
                <div className="w-10 h-10 flex items-center justify-center mb-6 text-emerald-500 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h2 className="mono text-xl font-bold text-foreground mb-4 tracking-[0.2em] uppercase">
                Core Cryptography
                </h2>
                <p className="mono text-sm text-fg-secondary leading-relaxed">
                Review the AES-256-GCM configurations, PBKDF2 iterations, and Entropy methodologies ensuring cryptographic isolation.
                </p>
              </div>
          </Link>

          <Link href="/architecture" className="focus:outline-none hover:bg-bg-tertiary transition-colors h-full">    
              <div className="p-8 relative bg-bg-secondary h-full group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/[0.03] blur-2xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-rose-500/[0.08]" />
                <div className="w-10 h-10 flex items-center justify-center mb-6 text-rose-500 group-hover:scale-110 transition-transform">
                    <Code className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h2 className="mono text-xl font-bold text-foreground mb-4 tracking-[0.2em] uppercase">
                Architecture Specs
                </h2>
                <p className="mono text-sm text-fg-secondary leading-relaxed">
                Analyze the Zero-Knowledge Client-Server segregation structure outlining our threat model assumptions.
                </p>
              </div>
          </Link>

          <Link href="/data-model" className="focus:outline-none hover:bg-bg-tertiary transition-colors h-full">    
              <div className="p-8 relative bg-bg-secondary h-full group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.03] blur-2xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-blue-500/[0.08]" />
                <div className="w-10 h-10 flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h2 className="mono text-xl font-bold text-foreground mb-4 tracking-[0.2em] uppercase">
                Data Schemas
                </h2>
                <p className="mono text-sm text-fg-secondary leading-relaxed">
                Under the hood of the PostgreSQL database and envelope serialization algorithms.
                </p>
              </div>
          </Link>

        </div>
      </main>

      <footer className="relative z-20 pt-16 pb-20 border-t border-border bg-background text-xs text-fg-secondary mono uppercase tracking-widest mt-auto">
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
