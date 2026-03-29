"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { ImmersiveBackground } from "@/components/landing/immersive-background";
import { LandingNav } from "@/components/landing/LandingNav";

import { Lock, EyeOff, Server, Fingerprint, Key, ChevronRight, Download, Hexagon, Activity } from "lucide-react";

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

export default function LandingPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

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
            className="mono text-xs text-fg-secondary mb-8 tracking-widest uppercase flex items-center gap-2 border border-border px-3 py-1 bg-background/50"
          >
            <Activity className="w-3 h-3 text-success" />
            <span>[[ SYSTEM ENCRYPTED // AES-256 ]]</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter text-foreground mb-2 leading-none whitespace-nowrap"
          >
            Absolute <br /> Security.
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-7xl font-normal tracking-tighter text-gradient mt-2 mb-8 leading-none"
          >
            [Zero Knowledge.]
          </motion.h2>

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
      <section id="features" className="relative z-20 py-20 lg:py-24 px-6 lg:px-12 bg-background border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground mb-6 uppercase"
            >
              Engineered for paranoia.
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border border-border glass p-[1px]">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative p-10 bg-bg-secondary hover:bg-bg-tertiary transition-all duration-500 overflow-hidden"
              >
                {/* Subtle background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                {/* Glowing corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-foreground/[0.02] blur-xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-foreground/[0.05] transition-colors"></div>

                <div className={`w-12 h-12 flex items-center justify-center mb-8 text-fg-muted group-hover:text-foreground transition-all duration-500 group-hover:scale-110`}>
                  <f.icon className="w-7 h-7" strokeWidth={1} />
                </div>

                <h3 className="mono text-lg font-bold text-foreground mb-4 tracking-[0.2em] uppercase">
                  {f.title}
                </h3>

                <p className="mono text-fg-secondary text-[10px] sm:text-xs leading-relaxed uppercase tracking-wider pr-4 group-hover:text-foreground transition-colors">
                  {f.desc}
                </p>

                {/* Tech metadata details */}
                <div className="absolute bottom-4 right-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  <div className="mono text-[7px] text-fg-muted">STATUS: VERIFIED</div>
                  <div className="mono text-[7px] text-fg-muted font-bold px-1.5 py-0.5 border border-border">MOD_{i + 1}</div>
                </div>

                {/* Decorative corner square */}
                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-border group-hover:border-success transition-colors"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



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
            <Link href="/github" className="hover:text-foreground transition-colors">Source</Link>
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
