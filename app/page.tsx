import Link from "next/link";
import { Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/10 rounded-full blur-[100px] -z-10" />

      {/* Basic Nav */}
      <header className="px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-brand font-bold tracking-widest">
          <Shield className="w-6 h-6" />
          <span>PRIVAULT</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-secondary hover:text-foreground text-sm font-medium transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="text-sm font-semibold text-brand-foreground bg-brand px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors">
            Create Vault
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 relative mt-[-80px]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/5 border border-brand/20 text-brand text-xs font-semibold tracking-wide uppercase mb-8">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          Zero-Knowledge Security
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl mb-6">
          Your digital life, <br className="hidden md:block" />
          <span className="text-gradient">cryptographically secured.</span>
        </h1>

        <p className="text-lg md:text-xl text-secondary max-w-2xl mb-10 leading-relaxed">
          Privault encrypts all your passwords on your device before they ever touch the network. Only you hold the keys. No one else — not even us — can access your data.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/signup" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand text-brand-foreground font-semibold hover:bg-brand-hover hover:scale-105 active:scale-95 transition-all shadow-glow">
            Get Started for Free
          </Link>
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-secondary/10 text-foreground font-medium hover:bg-secondary/20 transition-all">
            Unlock Vault
          </Link>
        </div>
      </main>
    </div>
  );
}
