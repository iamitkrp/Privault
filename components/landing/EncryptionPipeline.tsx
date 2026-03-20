"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type StepKey = 1 | 2 | 3 | 4 | 5 | 6 | null;

const TOOLTIPS: Record<NonNullable<StepKey>, { title: string; text: string; x: number; y: number }> = {
    1: {
        title: "// 01: Master Password",
        text: "Your master password is the absolute root of your vault's security. It is never transmitted to our servers and only exists locally in your device's active memory. When you close the app, it is gone forever.",
        x: 40, y: 155
    },
    2: {
        title: "// 02: PBKDF2 Key Derivation",
        text: "Your password itself is too short to be a cryptographic key. It is mathematically hashed 100,000 times using PBKDF2 with a unique cryptographic salt. This computationally expensive process prevents brute-force guessing attacks.",
        x: 340, y: 155
    },
    3: {
        title: "// 03: Cryptographic Master Key",
        text: "The result of the hashing function is a pure 256-bit (32-byte) cryptographic key. This is the actual mathematical key used by the AES engine to lock and unlock your secure data.",
        x: 340, y: 395
    },
    4: {
        title: "// 04: Local Vault Data",
        text: "Your plaintext passwords, secure notes, and sensitive data blocks are prepared locally in your browser. This raw data never leaves your device unencrypted.",
        x: 40, y: 395
    },
    5: {
        title: "// 05: AES-256-GCM Engine",
        text: "The military-grade encryption engine. It feeds your Data Block (Step 04) and the Master Key (Step 03) into the AES-256 cipher to produce impenetrable ciphertext. GCM also generates an authentication tag to prevent tampering.",
        x: 40, y: 320
    },
    6: {
        title: "// 06: Zero-Knowledge Server",
        text: "Only the fully encrypted ciphertext and authentication tag are sent to the cloud. The server is mathematically 'blind'—it stores the vault but fundamentally cannot decrypt it without your local Master Key.",
        x: 340, y: 320
    }
};

export default function EncryptionPipeline() {
    const [hovered, setHovered] = useState<StepKey>(null);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full relative z-20 flex items-center justify-center p-2 xl:p-0 group"
        >


            <svg
                viewBox="0 0 700 700"
                className="w-full h-full svg-shadow pointer-events-none relative z-10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* DEFINITIONS for gradients and markers */}
                <defs>
                    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff4500" stopOpacity="0" />
                        <stop offset="50%" stopColor="#ff4500" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ff4500" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* THE ENTIRE VISUAL LAYOUT SHIFTED DOWN 30px FOR PERFECT VERTICAL CENTERING */}
                <g transform="translate(0, 30)">
                    {/* Vertical Pipeline Paths */}
                    <path id="flow-pass-kdf" d="M 280 90 L 420 90" />
                    <path id="flow-kdf-key" d="M 540 140 C 600 180, 600 240, 540 280" />
                    <path id="flow-key-data" d="M 420 330 L 280 330" />
                    <path id="flow-data-engine" d="M 160 380 C 100 420, 100 480, 160 520" />
                    <path id="flow-engine-server" d="M 280 570 L 420 570" />

                    {/* CONNECTION LINES (Edges) */}
                    <g stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="6 6">
                        <path d="M 280 90 L 420 90" stroke={hovered === 1 || hovered === 2 ? "#ff4500" : undefined} className="transition-all duration-500" />
                        <path d="M 540 140 C 600 180, 600 240, 540 280" stroke={hovered === 2 || hovered === 3 ? "#00ffcc" : undefined} className="transition-all duration-500" />
                        <path d="M 420 330 L 280 330" stroke={hovered === 3 || hovered === 4 ? "#00ffcc" : undefined} className="transition-all duration-500" />
                        <path d="M 160 380 C 100 420, 100 480, 160 520" stroke={hovered === 4 || hovered === 5 ? "#ff4500" : undefined} className="transition-all duration-500" />
                        <path d="M 280 570 L 420 570" stroke={hovered === 5 || hovered === 6 ? "#a855f7" : undefined} className="transition-all duration-500" />
                    </g>

                    {/* DATA DOTS ANIMATIONS — no blur filter for performance */}
                    <g>
                        <circle r="4" fill="#ff4500" opacity="0.9">
                            <animateMotion dur="2.5s" repeatCount="indefinite"><mpath href="#flow-pass-kdf" /></animateMotion>
                        </circle>
                        <circle r="3" fill="#00ffcc" opacity="0.9">
                            <animateMotion dur="2.5s" begin="0.5s" repeatCount="indefinite"><mpath href="#flow-kdf-key" /></animateMotion>
                        </circle>
                        <circle r="4" fill="#00ffcc" opacity="0.9">
                            <animateMotion dur="2.5s" repeatCount="indefinite"><mpath href="#flow-key-data" /></animateMotion>
                        </circle>
                        <circle r="4" fill="#ff4500" opacity="0.9">
                            <animateMotion dur="2.5s" begin="0.8s" repeatCount="indefinite"><mpath href="#flow-data-engine" /></animateMotion>
                        </circle>
                        <circle r="4" fill="#a855f7" opacity="0.9">
                            <animateMotion dur="2.5s" repeatCount="indefinite"><mpath href="#flow-engine-server" /></animateMotion>
                        </circle>
                    </g>

                    {/* CONNECTION LABELS */}
                    <g fontFamily="monospace" fontSize="11" fill="#aaaaaa" letterSpacing="1" textAnchor="middle">
                        <text x="350" y="80">UTF-8 BYTES</text>
                        <text x="610" y="215">32-BYTE DERIVATION</text>
                        <text x="350" y="320">MASTER KEY</text>
                        <text x="90" y="455">DATA BLOCK</text>
                        <text x="350" y="560">CIPHERTEXT + TAG</text>
                    </g>

                    {/* --- PIPELINE NODES (BOXES) --- */}

                    {/* Master Password - STEP 01 */}
                    <g 
                        transform="translate(40, 40)" 
                        className="pointer-events-auto cursor-pointer transition-all duration-300" 
                        onMouseEnter={() => setHovered(1)} 
                        onMouseLeave={() => setHovered(null)}
                    >
                        <rect width="240" height="100" rx="6" className="fill-bg-secondary transition-colors duration-300" stroke={hovered === 1 ? "#ff4500" : "var(--color-border-secondary)"} strokeWidth="2" />
                        <line x1="0" y1="0" x2="30" y2="0" stroke="#ff4500" strokeWidth="4" />
                        <text x="20" y="35" className="fill-fg-muted" fontFamily="monospace" fontSize="12" letterSpacing="1">// STEP 01</text>
                        <text x="20" y="65" className="fill-foreground font-sans text-xl font-bold">Master Password</text>
                        <text x="20" y="85" className="fill-fg-secondary" fontFamily="monospace" fontSize="10">ONLY EXISTS IN MEMORY</text>
                    </g>

                    {/* PBKDF2 Hashing - STEP 02 */}
                    <g 
                        transform="translate(420, 40)" 
                        className="pointer-events-auto cursor-pointer transition-all duration-300"
                        onMouseEnter={() => setHovered(2)} 
                        onMouseLeave={() => setHovered(null)}
                    >
                        <rect width="240" height="100" rx="6" className="fill-bg-secondary transition-colors duration-300" stroke={hovered === 2 ? "#00ffcc" : "var(--color-border-secondary)"} strokeWidth="2" />
                        <rect x="-4" y="25" width="4" height="50" fill="#00ffcc" opacity="0.8" />
                        <text x="20" y="35" className="fill-fg-muted" fontFamily="monospace" fontSize="12" letterSpacing="1">// STEP 02</text>
                        <text x="20" y="65" className="fill-foreground font-sans text-xl font-bold">PBKDF2 Hashing</text>
                        <text x="20" y="85" className="fill-fg-secondary" fontFamily="monospace" fontSize="10">100K ITERATIONS + SALT</text>
                    </g>

                    {/* Cryptographic Key - STEP 03 */}
                    <g 
                        transform="translate(420, 280)" 
                        className="pointer-events-auto cursor-pointer transition-all duration-300"
                        onMouseEnter={() => setHovered(3)} 
                        onMouseLeave={() => setHovered(null)}
                    >
                        <rect width="240" height="100" rx="6" className="fill-bg-secondary transition-colors duration-300" stroke={hovered === 3 ? "#00ffcc" : "var(--color-border-secondary)"} strokeWidth="2" />
                        <line x1="210" y1="0" x2="240" y2="0" stroke="#00ffcc" strokeWidth="4" />
                        <text x="20" y="35" className="fill-fg-muted" fontFamily="monospace" fontSize="12" letterSpacing="1">// STEP 03</text>
                        <text x="20" y="65" className="fill-foreground font-sans text-lg font-bold">Cryptographic Key</text>
                        <text x="20" y="85" className="fill-fg-secondary" fontFamily="monospace" fontSize="10">AES-256 (32 BYTES)</text>
                    </g>

                    {/* Private Vault Data - STEP 04 */}
                    <g 
                        transform="translate(40, 280)" 
                        className="pointer-events-auto cursor-pointer transition-all duration-300"
                        onMouseEnter={() => setHovered(4)} 
                        onMouseLeave={() => setHovered(null)}
                    >
                        <rect width="240" height="100" rx="6" className="fill-bg-secondary transition-colors duration-300" stroke={hovered === 4 ? "#ff4500" : "var(--color-border-secondary)"} strokeWidth="2" />
                        <line x1="0" y1="0" x2="30" y2="0" stroke="#ff4500" strokeWidth="4" />
                        <text x="20" y="35" className="fill-fg-muted" fontFamily="monospace" fontSize="12" letterSpacing="1">// STEP 04</text>
                        <text x="20" y="65" className="fill-foreground font-sans text-xl font-bold">Private Vault Data</text>
                        <text x="20" y="85" className="fill-fg-secondary" fontFamily="monospace" fontSize="10">PASSWORDS & NOTES</text>
                    </g>

                    {/* AES-256-GCM Engine - STEP 05 */}
                    <g 
                        transform="translate(40, 520)" 
                        className="pointer-events-auto cursor-pointer transition-all duration-300"
                        onMouseEnter={() => setHovered(5)} 
                        onMouseLeave={() => setHovered(null)}
                    >
                        <rect
                            width="240" height="100" rx="6" className="fill-bg-elevated" stroke="#a855f7" strokeWidth="2.5"
                            opacity={hovered === 5 ? 1 : 0.8}
                        />
                        <text x="25" y="35" className="fill-fg-muted" fontFamily="monospace" fontSize="12" letterSpacing="1">// STEP 05</text>
                        <text x="25" y="65" className="fill-foreground font-sans text-2xl font-bold">AES-256-GCM</text>
                        <text x="25" y="85" className="fill-fg-secondary" fontFamily="monospace" fontSize="10">AUTH TAG GENERATION</text>
                    </g>

                    {/* Cloud Server (Blind) - STEP 06 */}
                    <g 
                        transform="translate(420, 520)" 
                        className="pointer-events-auto cursor-pointer transition-all duration-300"
                        onMouseEnter={() => setHovered(6)} 
                        onMouseLeave={() => setHovered(null)}
                    >
                        <rect width="240" height="100" rx="6" className="fill-bg-secondary transition-colors duration-300" stroke={hovered === 6 ? "var(--color-fg-muted)" : "var(--color-border-secondary)"} strokeWidth="2" />
                        <rect x="236" y="25" width="4" height="50" fill="#a855f7" opacity="0.8" />
                        <text x="20" y="35" className="fill-fg-muted" fontFamily="monospace" fontSize="12" letterSpacing="1">// STEP 06</text>
                        <text x="20" y="65" className="fill-foreground font-sans text-xl font-bold">Blind Server</text>
                        <text x="20" y="85" className="fill-fg-secondary" fontFamily="monospace" fontSize="10">CANNOT DECRYPT</text>
                    </g>
                </g>

                {/* THE HOVER TOOLTIP (Rendered dynamically based on state) */}
                <AnimatePresence>
                    {hovered && (
                        <motion.g
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="pointer-events-none"
                        >
                            <foreignObject x={TOOLTIPS[hovered].x} y={TOOLTIPS[hovered].y} width="320" height="180" className="overflow-visible">
                                <div className="p-4 rounded-xl border border-border bg-background/90 shadow-lg backdrop-blur-3xl relative overflow-hidden group">
                                    {/* Glassmorphism gradient effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent pointer-events-none"></div>
                                    <h3 
                                        className="font-mono text-xs mb-3 font-semibold tracking-wider"
                                        style={{ 
                                            color: hovered === 1 || hovered === 4 ? "#ff4500" : 
                                                   hovered === 2 || hovered === 3 ? "#00ffcc" : 
                                                   hovered === 5 ? "#a855f7" : "var(--color-foreground)" 
                                        }}
                                    >
                                        {TOOLTIPS[hovered].title}
                                    </h3>
                                    <div className="h-px w-full bg-border mb-3" />
                                    <p className="text-fg-secondary text-sm leading-relaxed font-sans drop-shadow-sm">
                                        {TOOLTIPS[hovered].text}
                                    </p>
                                </div>
                            </foreignObject>
                        </motion.g>
                    )}
                </AnimatePresence>

                {/* Decorative corner brackets for SVG container */}
                {/* Removed as requested */}

            </svg>

            {/* Edge Fades for Seamless Integration */}
            <div className="absolute inset-y-0 left-0 w-12 lg:w-24 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 lg:w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-10 lg:h-20 bg-gradient-to-b from-background to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-10 lg:h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </motion.div>
    );
}
