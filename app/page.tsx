"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { ImmersiveBackground } from "@/components/landing/immersive-background";
import { LandingNav } from "@/components/landing/LandingNav";

import { Lock, EyeOff, Server, Fingerprint, Key, ChevronRight, Download, Hexagon } from "lucide-react";

import EncryptionPipeline from "@/components/landing/EncryptionPipeline";

const features = [
  {
    icon: Lock,
    title: "Absolute Encryption",
    desc: "AES-256-GCM encryption secures your data with the exact same standard used by global financial institutions and governments.",
    accent: "bg-emerald-500/20 text-emerald-400"
  },
  {
    icon: EyeOff,
    title: "Zero-Knowledge Proof",
    desc: "Your master vault key never leaves your device. We are mathematically blind to your passwords and data.",
    accent: "bg-violet-500/20 text-violet-400"
  },
  {
    icon: Fingerprint,
    title: "PBKDF2 Derivation",
    desc: "With 100,000 iterations of cryptographic hashing, brute-force attacks on your vault are rendered computationally impossible.",
    accent: "bg-blue-500/20 text-blue-400"
  },
  {
    icon: Server,
    title: "Client-Side Architecture",
    desc: "The server acts as a dumb vault, only storing encrypted ciphertext. All intelligent processing happens right in your browser.",
    accent: "bg-rose-500/20 text-rose-400"
  },
  {
    icon: Key,
    title: "Entropy Generator",
    desc: "Generate cryptographically secure passwords with custom entropy requirements to defend against any dictionary attack.",
    accent: "bg-amber-500/20 text-amber-400"
  },
  {
    icon: Download,
    title: "Data Sovereignty",
    desc: "You own your data. Seamlessly export or import your entire vault in standard formats whenever you choose.",
    accent: "bg-cyan-500/20 text-cyan-400"
  }
];

const HERO_SUBTITLES = [
  "[Zero Knowledge.]",
  "[End-to-End Encrypted.]",
  "[Mathematically Blind.]",
  "[100% Client-Side.]"
];

export default function LandingPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [subtitleIndex, setSubtitleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSubtitleIndex((prev) => (prev + 1) % HERO_SUBTITLES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handlePrimaryAction = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user && profile) {
      router.push("/vault");
    } else {
      setAuthMode("signup");
      setIsAuthModalOpen(true);
    }
  };



  return (
    <div
      className="relative min-h-screen overflow-hidden bg-transparent font-sans text-foreground selection:bg-brand-subtle"
    >
      <ImmersiveBackground />

      <LandingNav />

      <section className="relative flex flex-col lg:flex-row items-start justify-between px-6 md:px-12 pt-28 pb-12 z-10 w-full max-w-[1600px] mx-auto overflow-hidden md:pt-32 lg:pt-36 lg:pb-16">
        
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-[45%] flex flex-col items-start z-30 pt-10 lg:pt-0"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Link 
              href="/github" 
              className="group mono text-xs text-fg-secondary hover:text-foreground tracking-widest uppercase flex items-center gap-3 border border-border px-3 py-1.5 bg-background/50 hover:bg-foreground/[0.02] transition-colors w-fit"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span>View Source on GitHub</span>
              <ChevronRight className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-8xl font-normal tracking-wide text-foreground mb-2 leading-none whitespace-nowrap"
          >
            Absolute <br /> Security.
          </motion.h1>
          <div className="h-[40px] sm:h-[48px] md:h-[60px] mt-2 mb-8 flex items-end">
            <AnimatePresence mode="wait">
              <motion.h2
                key={subtitleIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide leading-none whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, var(--text-gradient-start), var(--text-gradient-end))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'var(--text-gradient-start)' // Fallback
                }}
              >
                {HERO_SUBTITLES[subtitleIndex]}
              </motion.h2>
            </AnimatePresence>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mono text-sm text-fg-muted max-w-lg leading-relaxed mb-12"
          >
            Client-side encryption before data leaves your device. We cannot see, share, or sell your passwords. We are mathematically blind to your vault.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full justify-start mono text-xs uppercase"
          >
            <button onClick={handlePrimaryAction} className="group relative overflow-hidden py-4 px-8 text-background bg-foreground hover:opacity-90 transition-opacity w-full sm:w-auto text-center cursor-pointer">
              <span className="relative z-10 flex items-center justify-center gap-2 font-bold tracking-widest">
                {user && profile ? "Go to Dashboard" : "Initialize Vault"} <ChevronRight className="w-4 h-4" />
              </span>
            </button>

            <Link href="/docs" className="group relative overflow-hidden py-4 px-8 border border-border text-foreground hover:bg-foreground/5 transition-colors w-full sm:w-auto text-center">
              <span className="relative z-10 flex items-center justify-center gap-2 tracking-widest">Security Specs <ChevronRight className="w-4 h-4" /></span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Content - Encryption Pipeline Visualization */}
        <div className="w-full lg:w-[55%] lg:h-auto min-h-[450px] relative mt-10 lg:mt-0 z-20 hidden md:flex items-center justify-end lg:pr-12">
          <EncryptionPipeline />
        </div>
      </section>



      {/* Feature Grid */}
      <section id="features" className="relative z-20 py-20 lg:py-24 px-6 lg:px-12 bg-transparent border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tighter text-foreground mb-6 uppercase leading-none"
            >
              ENGINEERED FOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--pipeline-neon-1)] to-[var(--pipeline-neon-2)]">PARANOIA.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mono text-sm text-fg-muted max-w-2xl uppercase tracking-widest leading-relaxed"
            >
              We've stripped away the noise and focused entirely on cryptographic perfection.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border/50 p-[1px] rounded-[2rem] overflow-hidden shadow-2xl relative">
            {features.map((f, i) => {
              const accentColor = i % 3 === 0 ? 'var(--pipeline-neon-1)' : i % 3 === 1 ? 'var(--pipeline-neon-2)' : 'var(--pipeline-neon-3)';
              
              return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative h-[340px] p-8 bg-background hover:bg-bg-secondary transition-all duration-500 overflow-hidden flex flex-col cursor-crosshair"
              >
                {/* Abstract Data Mesh Background (Subtle) */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500"
                    style={{ backgroundImage: 'linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                />

                {/* Hover Spotlight matching the neon scheme */}
                <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at 50% 120%, ${accentColor}22 0%, transparent 70%)`
                    }}
                />

                {/* Massive Watermark Icon */}
                <div 
                    className="absolute -right-8 -bottom-10 opacity-[0.02] group-hover:opacity-[0.06] transition-all duration-700 pointer-events-none"
                    style={{ color: accentColor }}
                >
                  <f.icon className="w-64 h-64 transform -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-transform duration-700 ease-out" strokeWidth={1} />
                </div>

                {/* Hardware Corners (appear on hover) */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-transparent group-hover:border-foreground/30 transition-all duration-500 scale-150 group-hover:scale-100 pointer-events-none"></div>
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-transparent group-hover:border-foreground/30 transition-all duration-500 scale-150 group-hover:scale-100 pointer-events-none"></div>
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-transparent group-hover:border-foreground/30 transition-all duration-500 scale-150 group-hover:scale-100 pointer-events-none"></div>
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-transparent group-hover:border-foreground/30 transition-all duration-500 scale-150 group-hover:scale-100 pointer-events-none"></div>

                {/* Top System Bar */}
                <div className="relative z-10 flex justify-between items-center w-full mb-auto opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }}></div>
                        <span className="mono text-[9px] tracking-[0.2em] text-foreground font-bold uppercase">SEC_MOD_0{i + 1}</span>
                    </div>
                    <f.icon className="w-5 h-5 text-fg-muted group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                </div>

                {/* Main Content (pushed to bottom) */}
                <div className="relative z-10 mt-auto transform group-hover:-translate-y-2 transition-transform duration-500">
                    <h3 className="mono text-[16px] font-bold text-foreground mb-3 tracking-[0.1em] uppercase leading-tight drop-shadow-md">
                        {f.title}
                    </h3>

                    <p className="mono text-fg-secondary text-[10px] leading-[1.8] uppercase tracking-[0.15em] pr-4 group-hover:text-foreground transition-colors mix-blend-luminosity">
                        {f.desc}
                    </p>
                </div>
                
                {/* Active scan line */}
                <div 
                    className="absolute top-0 bottom-0 left-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                    style={{ backgroundColor: accentColor }}
                />
              </motion.div>
            )})}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="relative z-20 overflow-hidden bg-transparent border-t border-border/40 pt-16 pb-8">
        {/* Animated scanning border top */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--pipeline-neon-1)] to-transparent opacity-50 blur-[1px]"></div>
        <motion.div 
            className="absolute top-0 left-0 h-[2px] w-64 bg-[var(--pipeline-neon-2)] blur-sm"
            animate={{ left: ['-20%', '120%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Huge Faded Background Logo/Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] overflow-hidden select-none">
            <h1 className="text-[10rem] md:text-[14rem] font-bold text-foreground whitespace-nowrap tracking-tighter mix-blend-overlay">PRIVAULT</h1>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col">
            {/* Top Grid Area */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 border-b border-border/30 pb-12">
                
                {/* Brand / Status Column */}
                <div className="col-span-1 md:col-span-2 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 border border-border/50 flex items-center justify-center bg-bg-secondary group hover:border-[var(--pipeline-neon-1)] transition-colors cursor-crosshair">
                                <Hexagon className="w-6 h-6 text-foreground group-hover:text-[var(--pipeline-neon-1)] transition-colors" strokeWidth={1.5} />
                            </div>
                            <span className="text-3xl font-bold tracking-tighter uppercase text-foreground">Privault.</span>
                        </div>
                        <p className="mono text-xs sm:text-sm text-fg-secondary uppercase tracking-widest max-w-sm leading-[1.8] mb-8">
                            Absolute cryptographic isolation. Your data is mathematically inaccessible to us. We cannot read, share, or sell what we cannot see.
                        </p>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-[var(--pipeline-neon-2)] animate-pulse glow"></div>
                        <span className="mono text-xs uppercase tracking-[0.2em] font-bold text-foreground">Core Systems Online</span>
                    </div>
                </div>

                {/* Links Column 1 */}
                <div className="col-span-1 flex flex-col gap-5">
                    <span className="mono text-xs text-foreground uppercase tracking-[0.2em] mb-2 font-bold flex items-center gap-2">
                        <span className="w-4 h-[2px] bg-[var(--pipeline-neon-2)]"></span> Architecture
                    </span>
                    <Link href="#" className="mono text-xs sm:text-sm text-fg-secondary hover:text-[var(--pipeline-neon-2)] transition-colors uppercase tracking-[0.1em] flex items-center gap-2 group w-fit">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--pipeline-neon-2)]">►</span> Whitepaper
                    </Link>
                    <Link href="#" className="mono text-xs sm:text-sm text-fg-secondary hover:text-[var(--pipeline-neon-2)] transition-colors uppercase tracking-[0.1em] flex items-center gap-2 group w-fit">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--pipeline-neon-2)]">►</span> Source Code
                    </Link>
                    <Link href="#" className="mono text-xs sm:text-sm text-fg-secondary hover:text-[var(--pipeline-neon-2)] transition-colors uppercase tracking-[0.1em] flex items-center gap-2 group w-fit">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--pipeline-neon-2)]">►</span> Security Audit
                    </Link>
                </div>

                {/* Links Column 2 */}
                <div className="col-span-1 flex flex-col gap-5">
                    <span className="mono text-xs text-foreground uppercase tracking-[0.2em] mb-2 font-bold flex items-center gap-2">
                        <span className="w-4 h-[2px] bg-[var(--pipeline-neon-3)]"></span> Legal
                    </span>
                    <Link href="#" className="mono text-xs sm:text-sm text-fg-secondary hover:text-[var(--pipeline-neon-3)] transition-colors uppercase tracking-[0.1em] flex items-center gap-2 group w-fit">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--pipeline-neon-3)]">►</span> Privacy Policy
                    </Link>
                    <Link href="#" className="mono text-xs sm:text-sm text-fg-secondary hover:text-[var(--pipeline-neon-3)] transition-colors uppercase tracking-[0.1em] flex items-center gap-2 group w-fit">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--pipeline-neon-3)]">►</span> Terms of Service
                    </Link>
                    <Link href="#" className="mono text-xs sm:text-sm text-fg-secondary hover:text-[var(--pipeline-neon-3)] transition-colors uppercase tracking-[0.1em] flex items-center gap-2 group w-fit">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--pipeline-neon-3)]">►</span> Contact Protocol
                    </Link>
                </div>
            </div>

            {/* Bottom Strip */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <span className="mono text-[10px] sm:text-xs text-fg-muted uppercase tracking-[0.2em]">© {new Date().getFullYear()} Privault</span>
                    <span className="w-1 h-1 bg-border rounded-full"></span>
                    <span className="mono text-[10px] sm:text-xs text-fg-muted uppercase tracking-[0.2em]">All Rights Reserved.</span>
                </div>

                {/* Cyberpunk Decorative element */}
                <div className="flex items-center gap-1.5 opacity-60">
                    <div className="w-12 h-1 bg-[var(--pipeline-neon-1)]"></div>
                    <div className="w-3 h-1 bg-[var(--pipeline-neon-1)]"></div>
                    <div className="w-1.5 h-1 bg-[var(--pipeline-neon-1)]"></div>
                </div>
            </div>
        </div>
      </footer>


      <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          initialMode={authMode}
          onSuccess={() => router.push("/dashboard")}
      />
    </div>
  );
}
