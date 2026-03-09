"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { Lock, EyeOff, Server, Fingerprint, Key, ChevronRight, ArrowRight, Download, Hexagon, Activity, Database, GitBranch } from "lucide-react";

// SVG Component for a single layer/cross-section of the padlock
const LockLayer = ({
  className, fillClass, strokeClass, patternId, patternFill, displayKeyhole = true
}: {
  className: string, fillClass: string, strokeClass: string, patternId?: string, patternFill?: string, displayKeyhole?: boolean
}) => (
  <svg viewBox="0 0 200 300" className={`absolute inset-0 w-full h-full ${className}`} style={{ transformStyle: 'preserve-3d' }}>
    <defs>
      {patternId && (
        <pattern id={patternId} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" className={patternFill || "fill-white/50"} />
        </pattern>
      )}
      <filter id="glow-strong">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Shackle */}
    <path
      d="M 50 140 V 70 C 50 20, 150 20, 150 70 V 140"
      fill="none"
      stroke={patternId ? `url(#${patternId})` : "currentColor"}
      strokeWidth="24"
      strokeLinecap="round"
      className={strokeClass}
    />

    {/* Main Body */}
    <rect
      x="20" y="140" width="160" height="130" rx="16" ry="16"
      className={`${fillClass} ${strokeClass}`}
      fill={patternId ? `url(#${patternId})` : undefined}
      strokeWidth="2"
    />

    {/* Keyhole (cut out or bright glow depending on layer) */}
    {displayKeyhole && (
      <g transform="translate(100, 205)" filter={patternId ? "url(#glow-strong)" : ""}>
        <circle cx="0" cy="-10" r="12" className={patternId ? "fill-white" : "fill-black"} />
        <path d="M -8 -5 L -12 20 L 12 20 L 8 -5 Z" className={patternId ? "fill-white" : "fill-black"} />
      </g>
    )}
  </svg>
);

// Floating Label for Padlock Layers
const PadlockLabel = ({ text, position, lineProps }: { text: string, position: string, lineProps: { w: number, h: number, x1: number, y1: number, x2: number, y2: number } }) => (
  <div className={`absolute ${position} flex items-center gap-2 z-40 group`}>
    <svg width={lineProps.w} height={lineProps.h} className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
      <line x1={lineProps.x1} y1={lineProps.y1} x2={lineProps.x2} y2={lineProps.y2} stroke="#fff" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx={lineProps.x1} cy={lineProps.y1} r="3" fill="#fff" />
      <circle cx={lineProps.x2} cy={lineProps.y2} r="2" fill="#fff" />
    </svg>
    <div className="border border-[#444] bg-black/90 backdrop-blur-md px-4 py-2 mono text-[10px] sm:text-xs text-gray-300 uppercase tracking-widest hover:text-white hover:border-white/60 transition-colors cursor-default whitespace-nowrap whitespace-pre">
      {text}
    </div>
  </div>
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

        {/* Right Content - True 3D Holographic Padlock */}
        <div className="w-full lg:w-[55%] h-[500px] lg:h-[600px] relative mt-10 lg:mt-0 flex items-center justify-end z-20 hidden md:flex pl-0 lg:pl-10">

          {/* Main 3D Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative w-full h-[500px] flex items-center justify-end"
            style={{ perspective: '1200px' }}
          >
            {/* Background ambient glow */}
            <div className="absolute top-1/2 right-20 -translate-y-1/2 w-96 h-96 bg-white/5 blur-[120px] rounded-full z-0 pointer-events-none"></div>

            {/* Static UI Overlay (Labels mapped to the 3D projection) */}
            <div className="absolute inset-0 z-50 pointer-events-none">
              <PadlockLabel
                text="ENTROPY & BRUTE DETECT"
                position="top-[20%] left-[45%]"
                lineProps={{ w: 100, h: 100, x1: 50, y1: 50, x2: 100, y2: 100 }}
              />
              <PadlockLabel
                text="LIVE VAULT ENCRYPTION"
                position="top-[38%] left-[25%]"
                lineProps={{ w: 150, h: 50, x1: 50, y1: 25, x2: 150, y2: 40 }}
              />
              <PadlockLabel
                text="ZERO-KNOWLEDGE AUTH"
                position="top-[55%] left-[40%]"
                lineProps={{ w: 120, h: 20, x1: 50, y1: 10, x2: 120, y2: 10 }}
              />
              <PadlockLabel
                text="MASTER KEY INTELLIGENCE"
                position="bottom-[20%] left-[30%]"
                lineProps={{ w: 120, h: 60, x1: 60, y1: 30, x2: 120, y2: 10 }}
              />
              <PadlockLabel
                text="VAULT SECURITY"
                position="bottom-[5%] left-[50%]"
                lineProps={{ w: 150, h: 80, x1: 75, y1: 40, x2: 120, y2: -20 }}
              />
            </div>

            {/* 3D Stacked Layers */}
            <motion.div
              className="relative w-[280px] h-[450px] lg:w-[350px] lg:h-[550px] right-0"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: [-20, -35, -20], rotateX: [5, 12, 5] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            >

              {/* Layer 1 (Back) - Faded skeletal outline */}
              <LockLayer
                className="opacity-10 translate-z-[-400px] -translate-x-[200px]"
                fillClass="fill-transparent"
                strokeClass="stroke-white/20"
                displayKeyhole={false}
              />

              {/* Layer 2 - Dotted wireframe */}
              <LockLayer
                className="opacity-30 translate-z-[-300px] -translate-x-[150px]"
                fillClass="fill-black/40"
                strokeClass="stroke-white/40 stroke-[1px] dasharray-2"
                displayKeyhole={false}
              />

              {/* Layer 3 - Core structural grid */}
              <LockLayer
                className="opacity-50 translate-z-[-200px] -translate-x-[100px]"
                fillClass="fill-black/60"
                strokeClass="stroke-white/60 stroke-[2px]"
                displayKeyhole={true}
              />

              {/* Layer 4 - Inner face (dashed/detailed) */}
              <LockLayer
                className="opacity-70 translate-z-[-100px] -translate-x-[50px]"
                fillClass="fill-black/80"
                strokeClass="stroke-white/80 stroke-[1px] dasharray-4"
                displayKeyhole={true}
              />

              {/* Layer 5 (Front) - Dense Data Point Map */}
              <LockLayer
                className="translate-z-0 z-10 drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                fillClass="fill-black/90"
                strokeClass="stroke-white/30"
                patternId="front-dots"
                patternFill="fill-white"
                displayKeyhole={true}
              />

              {/* Central Glowing Core (Pierces through the layers) */}
              <div className="absolute top-[340px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70px] h-[140px] bg-white/90 blur-[25px] rounded-[100%] translate-z-[-150px] pointer-events-none mix-blend-screen pulse-glow"></div>
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
        {/* Core Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[800px] bg-[#ff4500]/5 blur-[160px] rounded-full z-0 pointer-events-none"></div>

        {/* Large Decorative Background Hexagon */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] z-0 pointer-events-none"
        >
          <Hexagon className="w-[800px] h-[800px] text-white" strokeWidth={0.5} />
        </motion.div>

        {/* Dynamic Scanline Overlay limited to this section */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_bottom,transparent_50%,#fff_50%)] bg-[length:100%_4px] animate-scanline"></div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl mx-auto relative z-10 flex flex-col items-center"
        >
          {/* Animated Tech Icon */}
          <div className="relative mb-12 group cursor-default">
            {/* Spinning dashed ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 rounded-full border border-[#ff4500]/30 border-dashed"
            ></motion.div>

            {/* Inner solid ring */}
            <div className="w-24 h-24 rounded-full bg-[#050505] border border-[#222] flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(255,69,0,0.15)] group-hover:border-[#ff4500]/50 transition-colors duration-500">
              <div className="absolute inset-0 bg-gradient-to-b from-[#ff4500]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Hexagon className="w-10 h-10 text-[#ff4500] group-hover:scale-110 transition-transform duration-500" strokeWidth={1} />
              {/* Pulsing core dot */}
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-white rounded-full absolute mt-2"
              ></motion.div>
            </div>

            {/* Connecting lines top/bottom */}
            <div className="absolute -top-16 left-1/2 w-px h-12 bg-gradient-to-t from-[#ff4500]/50 to-transparent"></div>
            <div className="absolute -bottom-16 left-1/2 w-px h-12 bg-gradient-to-b from-[#ff4500]/50 to-transparent"></div>

            {/* Side node dots */}
            <div className="absolute top-1/2 -left-8 w-1 h-1 bg-[#ff4500] rounded-full"></div>
            <div className="absolute top-1/2 -right-8 w-1 h-1 bg-[#ff4500] rounded-full"></div>
            <div className="absolute top-1/2 -left-8 w-8 h-px bg-gradient-to-l from-[#ff4500]/30 to-transparent"></div>
            <div className="absolute top-1/2 -right-8 w-8 h-px bg-gradient-to-r from-[#ff4500]/30 to-transparent"></div>
          </div>

          {/* Headline with UI Brackets */}
          <div className="relative inline-block mb-8 text-center px-12 md:px-20 py-8">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 uppercase leading-none">
              Ready to Secure
              <br />
              Your World?
            </h2>

            {/* Left Bracket */}
            <svg className="absolute top-0 left-0 w-6 h-full text-[#333]" viewBox="0 0 20 100" preserveAspectRatio="none">
              <path d="M 20 0 L 0 0 L 0 100 L 20 100" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="0" y="45" width="4" height="10" fill="currentColor" />
            </svg>

            {/* Right Bracket */}
            <svg className="absolute top-0 right-0 w-6 h-full text-[#333]" viewBox="0 0 20 100" preserveAspectRatio="none">
              <path d="M 0 0 L 20 0 L 20 100 L 0 100" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="16" y="45" width="4" height="10" fill="currentColor" />
            </svg>

            {/* Tech IDs in corners */}
            <div className="absolute -top-4 -left-4 mono text-[10px] text-gray-800 tracking-tighter">PRV_V2.4_INIT</div>
            <div className="absolute -bottom-4 -right-4 mono text-[10px] text-gray-800 tracking-tighter">SRVR_ACK_READY</div>
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
