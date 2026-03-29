import { ImmersiveBackground } from "@/components/landing/immersive-background";
import { LandingNav } from "@/components/landing/LandingNav";
import { ArchitectureSVG } from "@/components/landing/ArchitectureSVG";
import { Hexagon } from "lucide-react";
import Link from "next/link";


export default function ArchitecturePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent font-sans text-foreground selection:bg-brand-subtle">
      <ImmersiveBackground />

      <LandingNav />

      <main className="relative z-10 pt-28 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center min-h-screen md:pt-32">
        <div className="w-full text-left self-start">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground mb-6 uppercase">
            Architecture
            </h1>
            <p className="mono text-sm text-fg-muted max-w-2xl mb-8 uppercase tracking-widest leading-relaxed">
            The fundamental design pattern that makes data breaches mathematically impossible.
            </p>
        </div>

        {/* The SVG Workflow map */}
        <div className="w-full max-w-5xl h-[400px]">
            <ArchitectureSVG />
        </div>

        {/* Content Section */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-border border-border glass p-[1px] mt-16">
          <div className="p-8 md:p-12 relative bg-bg-secondary group overflow-hidden">
             {/* Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.03] blur-2xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-cyan-500/[0.08]" />

            <h2 className="mono text-xl font-bold text-foreground mb-4 tracking-[0.2em] uppercase">
              The Client Engine
            </h2>
            <p className="mono text-sm text-fg-secondary leading-relaxed">
              The user's local device is the singular intelligence within the Privault ecosystem. It is here that encryption, decryption, password generation, and data formatting exclusively occur. Unencrypted data lives purely in volatile memory.
            </p>
          </div>

          <div className="p-8 md:p-12 relative bg-bg-secondary group overflow-hidden">
              {/* Glow */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/[0.03] blur-2xl rounded-full -translate-x-10 -translate-y-10 group-hover:bg-amber-500/[0.08]" />

            <h2 className="mono text-xl font-bold text-foreground mb-4 tracking-[0.2em] uppercase">
              The Blind Server
            </h2>
            <p className="mono text-sm text-fg-secondary leading-relaxed">
              Our cloud infrastructure serves only as a highly-available persistence layer. It receives, stores, and serves encrypted BLOBs. Without possession of the client's derived keys, the server cannot mathematically access the payload.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
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
