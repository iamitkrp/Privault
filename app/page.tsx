"use client";

import Link from "next/link";
import { Shield, Lock, Eye, EyeOff, Server, Fingerprint, Key, ArrowRight, Sparkles, RefreshCw, Download, ChevronRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const features = [
    {
      icon: Lock,
      title: "AES-256-GCM Encryption",
      desc: "Military-grade encryption protects every password with the same standard used by governments worldwide.",
    },
    {
      icon: EyeOff,
      title: "Zero-Knowledge Architecture",
      desc: "Your master password never leaves your device. We literally cannot see your data.",
    },
    {
      icon: Fingerprint,
      title: "PBKDF2 Key Derivation",
      desc: "100,000 iterations make brute-force attacks computationally infeasible, ensuring ultimate security.",
    },
    {
      icon: Server,
      title: "Client-Side Processing",
      desc: "All encryption and decryption happens in your browser. The server only stores ciphertext.",
    },
    {
      icon: Key,
      title: "Advanced Password Generator",
      desc: "Create strong, unique passwords with customizable length, symbols, and high entropy.",
    },
    {
      icon: Download,
      title: "Seamless Import & Export",
      desc: "Bring your passwords from CSV/JSON or export them anytime. Your data, your rules.",
    },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-bg-primary relative overflow-hidden flex flex-col font-sans selection:bg-brand/30 selection:text-foreground text-foreground">
      {/* Background Animated Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15],
            x: [0, 50, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-brand/20 blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -50, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[30%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-info/20 blur-[130px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/50 to-bg-primary opacity-80" />
      </div>

      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

      {/* Nav */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="px-6 md:px-12 py-5 flex items-center justify-between z-50 max-w-7xl mx-auto w-full sticky top-0 backdrop-blur-md bg-bg-primary/40 border-b border-white/5"
      >
        <div className="flex items-center gap-2.5 text-brand font-bold tracking-widest text-lg group cursor-pointer">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 group-hover:bg-brand/20 transition-colors">
            <Shield className="w-5 h-5 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand to-brand/70">PRIVAULT</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-secondary hover:text-foreground text-sm font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
            Sign In
          </Link>
          <Link href="/signup" className="relative group inline-flex items-center justify-center p-[1px] text-sm font-medium rounded-lg bg-gradient-to-br from-brand/60 to-info/60 overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all">
            <span className="relative px-5 py-2 transition-all ease-in duration-200 bg-bg-elevated rounded-md group-hover:bg-opacity-0 font-semibold group-hover:text-white">
              Create Vault
            </span>
          </Link>
        </div>
      </motion.header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 relative pt-20 pb-32 md:pt-32 min-h-[90vh]">
        <motion.div
          style={{ y, opacity }}
          className="flex flex-col items-center justify-center w-full"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/5 border border-brand/20 text-brand text-xs font-semibold tracking-wide uppercase mb-10 backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.1)]"
          >
            <Sparkles className="w-4 h-4" />
            Zero-Knowledge Security Standard
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-white max-w-5xl mb-8 leading-[1.05] drop-shadow-2xl"
          >
            Your digital life, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand/80 to-info drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              cryptographically secured.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            className="text-lg md:text-xl text-secondary max-w-2xl mb-14 leading-relaxed font-light"
          >
            Privault encrypts all your passwords on your device before they ever touch the network. Only you hold the keys. No one else — not even us — can access your data.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-5 mb-24 w-full justify-center"
          >
            <Link href="/signup" className="group relative w-full sm:w-auto overflow-hidden rounded-xl p-[1px] shadow-[0_0_40px_rgba(16,185,129,0.25)] hover:shadow-[0_0_60px_rgba(16,185,129,0.4)] transition-all">
              <span className="absolute inset-0 bg-gradient-to-r from-brand via-info to-brand opacity-100 animate-gradient-x"></span>
              <div className="relative flex items-center justify-center gap-2 rounded-xl bg-brand/90 px-8 py-4 text-bg-primary font-bold transition-all hover:bg-white backdrop-blur-3xl min-w-[200px]">
                Get Started for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/login" className="group w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-foreground font-medium hover:bg-white/10 transition-all backdrop-blur-md flex items-center justify-center gap-2">
              Unlock Vault
            </Link>
          </motion.div>

          {/* Security proof strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs text-secondary/70 uppercase tracking-widest font-semibold p-6 rounded-2xl glass border border-white/5 w-full max-w-3xl mx-auto shadow-2xl"
          >
            <span className="flex items-center gap-2 hover:text-brand transition-colors"><Lock className="w-4 h-4 text-brand/70" /> AES-256-GCM</span>
            <span className="hidden sm:inline text-white/10">|</span>
            <span className="flex items-center gap-2 hover:text-brand transition-colors"><RefreshCw className="w-4 h-4 text-brand/70" /> PBKDF2 100K</span>
            <span className="hidden sm:inline text-white/10">|</span>
            <span className="flex items-center gap-2 hover:text-brand transition-colors"><Eye className="w-4 h-4 text-brand/70" /> Open Source</span>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <section className="max-w-7xl w-full mt-40 relative z-20">
          <div className="text-center mb-20 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-brand/20 blur-[100px] -z-10 rounded-full"></div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-md"
            >
              Built for <span className="text-brand">paranoid</span> people.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-secondary max-w-2xl mx-auto font-light"
            >
              Every design decision prioritizes your security and privacy above all else. Welcome to the Fort Knox of the web.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative p-8 rounded-3xl glass bg-bg-elevated/40 hover:bg-bg-elevated/60 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:border-brand/40 z-10 overflow-hidden backdrop-blur-xl border border-white/5"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

                <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:bg-brand/20">
                  <f.icon className="w-7 h-7 text-brand drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
                <h3 className="text-xl text-white font-semibold mb-3 tracking-tight group-hover:text-brand transition-colors">{f.title}</h3>
                <p className="text-secondary/80 text-sm leading-relaxed font-light">{f.desc}</p>

                <div className="mt-8 flex items-center text-xs font-semibold text-brand opacity-0 transform translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Learn more <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.8 }}
          className="mt-40 mb-10 w-full max-w-5xl mx-auto rounded-3xl p-1 md:p-[1px] relative overflow-hidden group shadow-[0_0_50px_rgba(16,185,129,0.15)]"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-brand via-info to-brand opacity-30 md:opacity-50 transition-opacity duration-500"></span>

          <div className="relative rounded-[23px] bg-bg-elevated/90 backdrop-blur-2xl p-10 md:p-16 flex flex-col items-center text-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand/20 blur-[100px] -z-10 rounded-full" />

            <Shield className="w-12 h-12 text-brand mb-6 opacity-80" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">Ready to secure your data?</h2>
            <p className="text-lg text-secondary mb-10 font-light max-w-xl mx-auto">
              Join users who trust Privault with their most sensitive information. No credit card required.
            </p>
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl bg-white text-bg-primary font-bold hover:bg-gray-200 hover:scale-105 transition-all shadow-xl text-lg">
              Create Your Free Vault <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-bg-primary/80 backdrop-blur-xl py-10 px-6 text-center z-10 relative mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-brand font-bold tracking-wider">
            <Shield className="w-5 h-5 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" /> PRIVAULT
          </div>
          <p className="text-sm text-secondary/50">© {new Date().getFullYear()} Privault. Your security is our obsession.</p>
          <div className="flex items-center gap-8 text-sm text-secondary/60 font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
