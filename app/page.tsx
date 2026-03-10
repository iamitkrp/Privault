"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";

import { Lock, EyeOff, Server, Fingerprint, Key, ChevronRight, ArrowRight, Download, Hexagon, Activity, Database, GitBranch } from "lucide-react";

import InteractiveTerminal from "@/components/landing/InteractiveTerminal";

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
        <div className="flex items-center gap-3 font-semibold text-lg tracking-wide group cursor-pointer">
          <Hexagon className="w-6 h-6 text-white group-hover:text-gray-300 transition-colors" strokeWidth={1.5} />
          <span className="mono text-sm tracking-widest text-white">PRIVAULT.</span>
        </div>

        <div className="hidden md:flex items-center gap-12 mono text-xs text-gray-400">
          <Link href="#features" className="hover:text-white transition-colors uppercase tracking-widest">Core Tech</Link>
          <Link href="#architecture" className="hover:text-white transition-colors uppercase tracking-widest">Architecture</Link>
          <Link href="#data" className="hover:text-white transition-colors uppercase tracking-widest">Data Model</Link>
          <Link href="#docs" className="hover:text-white transition-colors uppercase tracking-widest">Docs</Link>
        </div>

        <div className="flex items-center gap-6 mono text-xs">
          <Link href="/login" className="px-6 py-2 border border-white/20 text-white hover:bg-white/10 transition-colors uppercase tracking-widest">
            Sign In
          </Link>
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
            <Link href="/signup" className="group relative overflow-hidden py-4 px-8 text-black bg-white hover:bg-gray-200 transition-colors w-full sm:w-auto text-center">
              <span className="relative z-10 flex items-center justify-center gap-2 font-bold tracking-widest">Initialize Vault <ChevronRight className="w-4 h-4" /></span>
            </Link>

            <Link href="/docs" className="group relative overflow-hidden py-4 px-8 border border-[#444] text-white hover:bg-white/5 transition-colors w-full sm:w-auto text-center">
              <span className="relative z-10 flex items-center justify-center gap-2 tracking-widest">Security Specs <ChevronRight className="w-4 h-4" /></span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Content - Interactive Terminal Visualization */}
        <div className="w-full lg:w-[55%] h-[500px] lg:h-[650px] relative mt-10 lg:mt-0 z-20 hidden md:flex items-center justify-end lg:pr-12">
          <InteractiveTerminal />
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

      {/* Final CTA */}
      <section className="relative z-20 pt-48 pb-60 px-6 overflow-hidden border-t border-[#111]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl mx-auto relative z-10 flex flex-col items-center"
        >
          {/* Headline */}
          <div className="relative inline-block mb-8 text-center px-12 md:px-20 py-8">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 uppercase leading-none">
              Ready to Secure
              <br />
              Your World?
            </h2>
          </div>

          <p className="mono text-[10px] md:text-sm text-gray-400 mb-14 max-w-2xl text-center uppercase tracking-[0.2em] leading-relaxed">
            Take back control of your digital identity. Zero-knowledge, zero tracking, infinite peace of mind.
          </p>

          {/* Enhanced Cyberpunk Button */}
          <Link href="/signup" className="group relative inline-flex items-center justify-center">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-[#ff4500] blur-[25px] opacity-20 group-hover:opacity-60 transition-opacity duration-500 rounded-sm"></div>

            {/* Button Surface */}
            <div className="relative px-12 md:px-16 py-5 bg-black border border-[#444] hover:border-[#ff4500] transition-colors duration-300 flex items-center gap-4 overflow-hidden rounded-sm text-white hover:text-[#ff4500]">
              {/* Hover highlighting sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff4500]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>

              <span className="font-bold uppercase tracking-[0.2em] text-sm relative z-10">Deploy Vault Instance</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />

              {/* Tech Details (Corner squares) */}
              <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-gray-600 transition-colors group-hover:bg-[#ff4500]"></div>
              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#ff4500]"></div>
            </div>
          </Link>

          {/* System Status Line under button */}
          <div className="mt-12 flex items-center gap-4 opacity-60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></div>
              <span className="mono text-[9px] text-gray-500 uppercase tracking-widest hidden md:inline">Global Network: Standing By for Deployment</span>
              <span className="mono text-[9px] text-gray-500 uppercase tracking-widest md:hidden">Network: Ready</span>
            </div>
            <svg className="w-24 md:w-40 h-px hidden sm:block opacity-30"><line x1="0" y1="0" x2="100%" y2="0" stroke="currentColor" strokeDasharray="2 2" /></svg>
            <div className="mono text-[9px] text-gray-500 tracking-widest hidden sm:block">STATUS: ACK</div>
          </div>

        </motion.div>
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
    </div>
  );
}
