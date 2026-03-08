import Link from "next/link";
import { Shield, Lock, Eye, EyeOff, Server, Fingerprint, Key, ArrowRight, Sparkles, RefreshCw, Download } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: Lock,
      title: "AES-256 Encryption",
      desc: "Military-grade encryption protects every password with the same standard used by governments.",
    },
    {
      icon: EyeOff,
      title: "Zero-Knowledge",
      desc: "Your master password never leaves your device. We literally cannot see your data.",
    },
    {
      icon: Fingerprint,
      title: "PBKDF2 Key Derivation",
      desc: "100,000 iterations make brute-force attacks computationally infeasible.",
    },
    {
      icon: Server,
      title: "Client-Side Only",
      desc: "All encryption and decryption happens in your browser. The server only stores ciphertext.",
    },
    {
      icon: Key,
      title: "Password Generator",
      desc: "Create strong, unique passwords with customizable length, symbols, and entropy.",
    },
    {
      icon: Download,
      title: "Import & Export",
      desc: "Bring your passwords from CSV/JSON or export them anytime. Your data, your rules.",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[900px] h-[900px] bg-brand/8 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-info/5 rounded-full blur-[80px] -z-10" />

      {/* Nav */}
      <header className="px-6 md:px-12 py-5 flex items-center justify-between z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5 text-brand font-bold tracking-widest text-lg">
          <Shield className="w-7 h-7" />
          <span>PRIVAULT</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-secondary hover:text-foreground text-sm font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
            Sign In
          </Link>
          <Link href="/signup" className="text-sm font-semibold text-brand-foreground bg-brand px-5 py-2.5 rounded-lg hover:bg-brand-hover transition-all hover:scale-[1.02] active:scale-[0.98] shadow-glow">
            Create Vault
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 relative pt-8 pb-20 md:pt-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/5 border border-brand/20 text-brand text-xs font-semibold tracking-wide uppercase mb-10">
          <Sparkles className="w-3.5 h-3.5" />
          Zero-Knowledge Security
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground max-w-5xl mb-7 leading-[1.05]">
          Your digital life, <br className="hidden md:block" />
          <span className="text-gradient">cryptographically secured.</span>
        </h1>

        <p className="text-lg md:text-xl text-secondary max-w-2xl mb-12 leading-relaxed">
          Privault encrypts all your passwords on your device before they ever touch the network. Only you hold the keys. No one else — not even us — can access your data.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
          <Link href="/signup" className="group w-full sm:w-auto px-8 py-4 rounded-xl bg-brand text-brand-foreground font-semibold hover:bg-brand-hover hover:scale-[1.03] active:scale-[0.97] transition-all shadow-glow flex items-center justify-center gap-2">
            Get Started for Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-border text-foreground font-medium hover:bg-white/10 transition-all">
            Unlock Vault
          </Link>
        </div>

        {/* Security proof strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-secondary/60 uppercase tracking-wider font-medium mb-20">
          <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-brand/50" /> AES-256-GCM</span>
          <span className="hidden sm:inline text-border">|</span>
          <span className="flex items-center gap-1.5"><RefreshCw className="w-3 h-3 text-brand/50" /> PBKDF2 100K Iterations</span>
          <span className="hidden sm:inline text-border">|</span>
          <span className="flex items-center gap-1.5"><Eye className="w-3 h-3 text-brand/50" /> Open Architecture</span>
        </div>

        {/* Feature Grid */}
        <section className="max-w-6xl w-full">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Built for paranoid people.</h2>
          <p className="text-secondary mb-12 max-w-xl mx-auto">Every design decision prioritizes your security and privacy above all else.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="glass p-6 rounded-xl text-left group hover:border-brand/30 transition-all duration-300 hover:shadow-lg"
              >
                <div className="w-11 h-11 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-brand" />
                </div>
                <h3 className="text-foreground font-semibold mb-2">{f.title}</h3>
                <p className="text-secondary text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 px-6 text-center z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-secondary/50">© {new Date().getFullYear()} Privault. Your security is our obsession.</p>
          <div className="flex items-center gap-6 text-xs text-secondary/50">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
