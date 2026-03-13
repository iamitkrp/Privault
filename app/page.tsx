"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { UserMenu } from "@/components/ui/user-menu";

import { Lock, EyeOff, Server, Fingerprint, Key, ChevronRight, Download, Hexagon, Activity, Database, GitBranch } from "lucide-react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothScrollY = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });
  const heroY = useTransform(smoothScrollY, [0, 0.3], ["0%", "50%"]);
  const heroOpacity = useTransform(smoothScrollY, [0, 0.3], [1, 0]);

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

  const handleLoginClick = (e: React.MouseEvent) => {
      e.preventDefault();
      setAuthMode("login");
      setIsAuthModalOpen(true);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black text-white font-sans selection:bg-white/20 overflow-hidden relative"
    >
      {/* Immersive Grid Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-grid-pattern opacity-40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
      </div>

      {/* Navigation - Minimalist Technical */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md border-b border-white/10 bg-black/40"
      >
        <div className="flex items-center gap-3 font-semibold text-lg tracking-wide group cursor-pointer relative">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/20 group-hover:text-white/50 transition-colors duration-500"
          >
            {/* The base hexagon, always visible */}
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>

          {/* The glowing animated tracer line */}
          <motion.svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] group-hover:text-amber-500 group-hover:drop-shadow-[0_0_12px_rgba(245,158,11,1)] transition-all duration-500 absolute left-0 top-1/2 -translate-y-1/2"
          >
            <motion.path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                initial={{ pathLength: 0, pathOffset: 0 }}
                animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 1, 2] }}
                transition={{ duration: 4, ease: "linear", repeat: Infinity }}
            />
          </motion.svg>
          <span className="mono text-sm tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 relative z-10 transition-colors duration-500 group-hover:from-white group-hover:to-amber-500">
            PRIVAULT.
          </span>
        </div>

        <div className="hidden md:flex items-center gap-12 mono text-xs text-gray-400">
          <Link href="#features" className="hover:text-white transition-colors uppercase tracking-widest">Core Tech</Link>
          <Link href="#architecture" className="hover:text-white transition-colors uppercase tracking-widest">Architecture</Link>
          <Link href="#data" className="hover:text-white transition-colors uppercase tracking-widest">Data Model</Link>
          <Link href="#docs" className="hover:text-white transition-colors uppercase tracking-widest">Docs</Link>
        </div>

        <div className="flex items-center gap-4 mono text-xs">
          {user && profile ? (
              <UserMenu />
          ) : (
            <button onClick={handleLoginClick} className="px-6 py-2 border border-white/20 text-white hover:bg-white/10 transition-colors uppercase tracking-widest">
                Sign In
            </button>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-100px)] flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 pt-10 pb-20 z-10 w-full max-w-[1600px] mx-auto overflow-hidden">

        {/* Left Content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="w-full lg:w-[45%] flex flex-col items-start z-30 pt-10 lg:pt-0"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mono text-xs text-gray-500 mb-8 tracking-widest uppercase flex items-center gap-2 border border-[#333] px-3 py-1 bg-black/50"
          >
            <Activity className="w-3 h-3 text-[#ff4500]" />
            <span>[[ SYSTEM ENCRYPTED // AES-256 ]]</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter text-white mb-2 leading-[0.9] whitespace-nowrap"
          >
            Absolute <br /> Security.
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-7xl font-normal tracking-tighter text-gray-500 mt-2 mb-8 leading-[0.9]"
          >
            [Zero Knowledge.]
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mono text-sm text-gray-400 max-w-lg leading-relaxed mb-12"
          >
            Client-side encryption before data leaves your device. We cannot see, share, or sell your passwords. We are mathematically blind to your vault.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full justify-start mono text-xs uppercase"
          >
            <button onClick={handlePrimaryAction} className="group relative overflow-hidden py-4 px-8 text-black bg-white hover:bg-gray-200 transition-colors w-full sm:w-auto text-center">
              <span className="relative z-10 flex items-center justify-center gap-2 font-bold tracking-widest">
                {user && profile ? "Go to Dashboard" : "Initialize Vault"} <ChevronRight className="w-4 h-4" />
              </span>
            </button>

            <Link href="/docs" className="group relative overflow-hidden py-4 px-8 border border-[#444] text-white hover:bg-white/5 transition-colors w-full sm:w-auto text-center">
              <span className="relative z-10 flex items-center justify-center gap-2 tracking-widest">Security Specs <ChevronRight className="w-4 h-4" /></span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Content - Encryption Pipeline Visualization */}
        <div className="w-full lg:w-[55%] h-[500px] lg:h-[650px] relative mt-10 lg:mt-0 z-20 hidden md:flex items-center justify-end lg:pr-12">
          <EncryptionPipeline />
        </div>
      </section>

      {/* Terminal Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 h-8 border-t border-[#333] bg-black/80 backdrop-blur-md z-50 flex items-center justify-between px-4 mono text-[10px] uppercase text-gray-500 hidden sm:flex">
        <div className="flex items-center gap-4">
          <span className="text-white bg-[#333] px-2 py-0.5">SECURE_ENV: READY</span>
          <span>&gt;&gt;&gt;&gt;&gt;</span>
          <span className="text-[#ff4500]">0 / 100%</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1"><Database className="w-3 h-3" /> VAULT_SYNC: STANDBY</span>
          <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> PROTOCOL: v2.4.0</span>
        </div>
      </div>

      {/* Feature Grid */}
      <section id="features" className="relative z-20 py-32 px-6 lg:px-12 bg-[#050505] border-y border-[#222]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6 uppercase"
            >
              Engineered for paranoia.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mono text-sm text-gray-400 max-w-2xl uppercase tracking-widest leading-relaxed"
            >
              We've stripped away the noise and focused entirely on cryptographic perfection.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[#111] border border-[#111]">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative p-10 bg-[#050505] hover:bg-[#080808] transition-all duration-500 overflow-hidden"
              >
                {/* Subtle background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                {/* Glowing corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/[0.02] blur-xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-white/[0.05] transition-colors"></div>

                <div className={`w-12 h-12 flex items-center justify-center mb-8 text-gray-600 group-hover:text-white transition-all duration-500 group-hover:scale-110`}>
                  <f.icon className="w-7 h-7" strokeWidth={1} />
                </div>

                <h3 className="mono text-lg font-bold text-white mb-4 tracking-[0.2em] uppercase">
                  {f.title}
                </h3>

                <p className="mono text-gray-500 text-[10px] sm:text-xs leading-relaxed uppercase tracking-wider pr-4 group-hover:text-gray-400 transition-colors">
                  {f.desc}
                </p>

                {/* Tech metadata details */}
                <div className="absolute bottom-4 right-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  <div className="mono text-[7px] text-gray-700">STATUS: VERIFIED</div>
                  <div className="mono text-[7px] text-gray-700 font-bold px-1.5 py-0.5 border border-gray-800">MOD_{i + 1}</div>
                </div>

                {/* Decorative corner square */}
                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-gray-800 group-hover:border-[#ff4500] transition-colors"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="relative z-20 pt-16 pb-20 border-t border-[#111] bg-black text-xs text-gray-600 mono uppercase tracking-widest">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Hexagon className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
            <span>© {new Date().getFullYear()} Privault [SECURE].</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/github" className="hover:text-white transition-colors">Source</Link>
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
