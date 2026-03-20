import { LandingNav } from "@/components/landing/LandingNav";
import { DataModelSVG } from "@/components/landing/DataModelSVG";
import { Hexagon } from "lucide-react";
import Link from "next/link";

export default function DataModelPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-brand-subtle overflow-hidden relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-grid-pattern opacity-40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background/90" />
      </div>

      <LandingNav />

      <main className="relative z-10 pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center min-h-screen">
        <div className="w-full text-left self-start">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground mb-6 uppercase">
            Data Model
            </h1>
            <p className="mono text-sm text-fg-muted max-w-2xl mb-8 uppercase tracking-widest leading-relaxed">
            A structurally sound approach to client-side deterministic serialization.
            </p>
        </div>

        {/* The SVG Workflow map */}
        <div className="w-full max-w-5xl h-[400px]">
            <DataModelSVG />
        </div>

        {/* Content Section */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border border-border glass p-[1px] mt-16">
          <div className="p-8 relative bg-bg-secondary group overflow-hidden">
             {/* Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.03] blur-2xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-cyan-500/[0.08]" />

            <h2 className="mono text-xl font-bold text-foreground mb-4 tracking-[0.2em] uppercase">
              Passwords
            </h2>
            <p className="mono text-sm text-fg-secondary leading-relaxed">
              Every password entry stores its standard credentials alongside a separate encrypted field for the actual password string. The metadata like URL and Username remain visible for searching.
            </p>
          </div>

          <div className="p-8 relative bg-bg-secondary group overflow-hidden">
              {/* Glow */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/[0.03] blur-2xl rounded-full -translate-x-10 -translate-y-10 group-hover:bg-amber-500/[0.08]" />

            <h2 className="mono text-xl font-bold text-foreground mb-4 tracking-[0.2em] uppercase">
              Secure Notes
            </h2>
            <p className="mono text-sm text-fg-secondary leading-relaxed">
              Notes are fundamentally similar. A title and optional tags structure the navigation, while the body content is heavily shielded behind the AES-GCM engine.
            </p>
          </div>

          <div className="p-8 relative bg-bg-secondary group overflow-hidden">
              {/* Glow */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-violet-500/[0.03] blur-2xl rounded-full translate-x-10 translate-y-10 group-hover:bg-violet-500/[0.08]" />

            <h2 className="mono text-xl font-bold text-foreground mb-4 tracking-[0.2em] uppercase">
              Envelope Structure
            </h2>
            <p className="mono text-sm text-fg-secondary leading-relaxed">
              The overall database schema embraces an Envelope pattern. The database record is merely an Envelope wrapper for an arbitrary encrypted payload of bytes, ensuring forward compatibility.
            </p>
          </div>
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
