"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { Lock, EyeOff, Server, Fingerprint, Key, ChevronRight, ArrowRight, Download, Hexagon, Terminal, Activity, Database, GitBranch } from "lucide-react";

// Floating Info Box Component
const FloatingInfo = ({ title, value, label, position, delay = 0 }: { title: string, value: string, label: string, position: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8 }}
    className={`absolute ${position} border border-[#333] bg-black/80 backdrop-blur-md p-3 w-40 z-20`}
  >
    <div className="mono text-[9px] text-gray-500 uppercase tracking-widest mb-1 border-b border-[#333] pb-1">{title}</div>
    <div className="mono text-sm text-[#ff4500] font-bold mb-1">{value}</div>
    <div className="mono text-[8px] text-gray-400 uppercase">{label}</div>
  </motion.div>
);

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
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay"></div>
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
      <section className="relative min-h-[100vh] flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 pt-24 pb-20 z-10 w-full max-w-[1600px] mx-auto overflow-hidden">

        {/* Left Content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="w-full lg:w-1/2 flex flex-col items-start z-30 pt-10 lg:pt-0"
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

        {/* Right Content - Intricate Padlock & Nodes */}
        <div className="w-full lg:w-1/2 h-[600px] lg:h-[800px] relative mt-16 lg:mt-0 flex items-center justify-center lg:justify-end pr-0 lg:pr-10 z-20 hidden md:flex">

          <FloatingInfo
            title="ENTROPY LEVELS"
            value="MAX / 256-BIT"
            label="PBKDF2 ITERATIONS: 100K"
            position="top-20 left-10 lg:left-0"
            delay={0.8}
          />
          <FloatingInfo
            title="VAULT STATUS"
            value="LOCKED"
            label="AWAITING MASTER KEY"
            position="top-1/3 left-0 lg:-left-20"
            delay={1}
          />
          <FloatingInfo
            title="SERVER SYNC"
            value="CIPHERTEXT ONLY"
            label="ZERO KNOWLEDGE VERIFIED"
            position="bottom-1/4 left-10 lg:left-10"
            delay={1.2}
          />

          {/* The Padlock Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative w-[300px] h-[450px] lg:w-[400px] lg:h-[550px]"
          >
            {/* Outline Glow */}
            <div className="absolute inset-x-8 top-0 bottom-32 bg-[#ff4500]/5 blur-[80px] rounded-full z-0"></div>

            {/* Inner Lock Shackle SVG */}
            <svg viewBox="0 0 200 150" className="absolute top-0 left-1/2 -translate-x-1/2 w-[65%] h-auto z-10 drop-shadow-2xl">
              <path d="M 50 150 V 80 C 50 30, 150 30, 150 80 V 150" fill="none" stroke="#222" strokeWidth="25" strokeLinecap="square" />
              <path d="M 50 150 V 80 C 50 30, 150 30, 150 80 V 150" fill="none" stroke="url(#metal)" strokeWidth="23" strokeLinecap="square" />
              <path d="M 55 150 V 80 C 55 35, 145 35, 145 80 V 150" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="square" />

              <defs>
                <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#111" />
                  <stop offset="20%" stopColor="#333" />
                  <stop offset="50%" stopColor="#666" />
                  <stop offset="80%" stopColor="#222" />
                  <stop offset="100%" stopColor="#111" />
                </linearGradient>
              </defs>
            </svg>

            {/* Lock Body */}
            <div className="absolute bottom-10 left-0 right-0 h-[65%] bg-gradient-to-br from-[#1a1a1a] via-[#111] to-[#050505] border border-[#333] shadow-2xl z-20 flex items-center justify-center overflow-hidden">
              {/* Grime/Texture */}
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
              {/* Horizontal Detail Lines */}
              <div className="absolute inset-x-0 top-4 h-px bg-[#333]"></div>
              <div className="absolute inset-x-0 bottom-4 h-px bg-[#333]"></div>
              <div className="absolute inset-y-0 left-4 w-px bg-[#333]"></div>
              <div className="absolute inset-y-0 right-4 w-px bg-[#333]"></div>

              {/* Center Lock Mechanism Circle */}
              <div className="relative w-40 h-40 rounded-full border border-[#444] bg-[#0a0a0a] shadow-inner flex items-center justify-center">
                {/* Gear teeth */}
                <div className="absolute inset-2 border-[4px] border-dashed border-[#333] rounded-full animate-[spin_60s_linear_infinite]"></div>
                <div className="absolute inset-6 border border-[#222] rounded-full"></div>
                {/* Keyhole */}
                <div className="w-8 h-8 rounded-full bg-[#ff4500] shadow-[0_0_20px_rgba(255,69,0,0.5)] flex flex-col items-center justify-center z-10 animate-pulse">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <div className="w-1.5 h-3 bg-black -mt-0.5"></div>
                </div>
              </div>

              {/* Tech details */}
              <div className="absolute bottom-8 left-8 mono text-[10px] text-gray-500">
                <div className="mb-1">AES-GCM</div>
                <div>NONCE: OK</div>
              </div>
              <div className="absolute top-8 right-8 flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#ff4500] shadow-[0_0_5px_rgba(255,69,0,0.8)]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
              </div>
            </div>

            {/* Terminal Window Overlay (Node Graph) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="absolute -bottom-5 -right-10 lg:-right-20 w-64 h-48 bg-black/90 border border-[#333] backdrop-blur-xl z-30 flex flex-col"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#333] bg-[#0a0a0a]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3 h-3 text-gray-500" />
                  <span className="mono text-[9px] text-gray-400">NETWORK.LOG</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-sm bg-gray-700 hover:bg-[#ff4500] transition-colors cursor-pointer"></div>
                </div>
              </div>

              <div className="p-3 relative flex-1 overflow-hidden">
                {/* Fake Node Network Graph */}
                <svg className="w-full h-full opacity-60">
                  <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="#444" strokeWidth="1" />
                  <line x1="50%" y1="50%" x2="80%" y2="40%" stroke="#444" strokeWidth="1" />
                  <line x1="50%" y1="50%" x2="60%" y2="80%" stroke="#ff4500" strokeWidth="1.5" strokeDasharray="4 2" className="animate-[dash_2s_linear_infinite]" />
                  <line x1="20%" y1="70%" x2="50%" y2="50%" stroke="#444" strokeWidth="1" />
                  <line x1="80%" y1="40%" x2="70%" y2="80%" stroke="#444" strokeWidth="1" />

                  <circle cx="20%" cy="30%" r="3" fill="#666" />
                  <circle cx="50%" cy="50%" r="4" fill="#fff" className="animate-pulse" />
                  <circle cx="80%" cy="40%" r="3" fill="#666" />
                  <circle cx="20%" cy="70%" r="3" fill="#666" />
                  <circle cx="60%" cy="80%" r="4" fill="#ff4500" className="animate-node-blink" />
                  <circle cx="70%" cy="80%" r="3" fill="#666" />
                </svg>

                <div className="absolute bottom-2 left-3 mono text-[8px] text-gray-500">
                  SYNC_NODES: 2,048<br />
                  REDUNDANCY: ACTIVE
                </div>
              </div>
            </motion.div>
          </motion.div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 px-1 bg-[#222] border border-[#222]">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative p-8 bg-[#050505] hover:bg-[#0a0a0a] transition-colors duration-300 overflow-hidden"
              >
                <div className={`w-10 h-10 flex items-center justify-center mb-6 text-gray-500 group-hover:text-white transition-colors duration-300`}>
                  <f.icon className="w-6 h-6" strokeWidth={1.5} />
                </div>

                <h3 className="mono text-lg font-bold text-white mb-4 tracking-widest uppercase">
                  {f.title}
                </h3>

                <p className="mono text-gray-500 text-xs leading-relaxed uppercase pr-4">
                  {f.desc}
                </p>

                {/* Tech detail corner */}
                <div className="absolute top-4 right-4 text-[8px] mono text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  SYS_MOD_{i + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-20 py-40 px-6 text-center border-b border-[#222]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto relative"
        >
          <Hexagon className="w-16 h-16 text-[#ff4500] mx-auto mb-8 opacity-80 shadow-[0_0_15px_rgba(255,69,0,0.5)]" strokeWidth={1} />

          <h2 className="text-4xl md:text-7xl font-bold tracking-tighter text-white mb-6 uppercase">
            Ready to secure your world?
          </h2>

          <p className="mono text-sm text-gray-400 mb-12 max-w-2xl mx-auto uppercase tracking-widest leading-relaxed">
            Take back control of your digital identity. Zero-knowledge, zero tracking, infinite peace of mind.
          </p>

          <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-[#ff4500] text-black font-bold uppercase tracking-widest hover:bg-white transition-all duration-300 text-sm">
            Deploy Vault Instance <ArrowRight className="w-4 h-4" />
          </Link>
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
