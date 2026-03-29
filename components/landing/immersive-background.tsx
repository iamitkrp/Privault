"use client";

import { motion } from "framer-motion";

/**
 * High-end brutalist cyber backdrop
 */
export function ImmersiveBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[-1] min-h-dvh bg-[var(--page-solid-bg)] overflow-hidden"
      aria-hidden
    >
      {/* Premium Grain / Noise Texture Overlay */}
      <div 
        className="absolute inset-0 z-[-1] mix-blend-overlay pointer-events-none bg-immersive-noise"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Structural Grid Mesh */}
      <div 
        className="absolute inset-0 bg-immersive-grid-1"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--color-foreground) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-foreground) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          backgroundPosition: 'center center'
        }}
      />

      {/* Crosshair Intersections for Grid */}
      <div 
        className="absolute inset-0 bg-immersive-grid-2"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--color-foreground) 2px, transparent 2px),
            linear-gradient(to bottom, var(--color-foreground) 2px, transparent 2px)
          `,
          backgroundSize: '400px 400px',
          backgroundPosition: 'center center'
        }}
      />

      {/* Ambient Neon Void Spots Removed per user request to strictly enforce Brutalist Monochrome */}

      {/* Abstract Scanning CRT Line */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-[200px] w-full bg-immersive-crt"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--color-foreground), transparent)',
        }}
        animate={{ y: ['-50vh', '150vh'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
