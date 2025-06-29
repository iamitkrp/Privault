import React from 'react';
import { motion } from 'framer-motion';

export default function NewHero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[70vh] w-full px-4 py-24">
      {/* Animated background blob */}
      <motion.div
        className="absolute -z-10 top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-black/10 to-black/5 rounded-full blur-3xl opacity-60"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 15, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{ translateX: '-50%', translateY: '-50%' }}
      />
      {/* Animated SVG asset */}
      <motion.img
        src="/globe.svg"
        alt="Animated Globe"
        className="absolute -z-20 top-1/2 left-1/2 w-[320px] h-[320px] opacity-30"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        style={{ translateX: '-50%', translateY: '-50%' }}
      />
      <motion.h1
        className="text-6xl md:text-8xl font-extrabold text-center leading-tight mb-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Minimal Palette,<br />
        <span className="italic font-light">Maximal Impact</span>
      </motion.h1>
      <motion.p
        className="text-2xl md:text-3xl text-center max-w-2xl text-black/70 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        Bespoke UX craftsmanship. High-fidelity interactive animations. Seamless, ultra-smooth transitions.
      </motion.p>
      <motion.a
        href="#work"
        className="px-8 py-4 bg-black text-white rounded-full text-xl font-semibold shadow-lg hover:scale-105 transition-transform"
        whileHover={{ scale: 1.08 }}
      >
        See Our Work
      </motion.a>
    </section>
  );
} 