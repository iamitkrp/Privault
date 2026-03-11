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
        x: 640, y: 155
    },
    3: {
        title: "// 03: Cryptographic Master Key",
        text: "The result of the hashing function is a pure 256-bit (32-byte) cryptographic key. This is the actual mathematical key used by the AES engine to lock and unlock your secure data.",
        x: 340, y: 355
    },
    4: {
        title: "// 04: Local Vault Data",
        text: "Your plaintext passwords, secure notes, and sensitive data blocks are prepared locally in your browser. This raw data never leaves your device unencrypted.",
        x: 40, y: 300
    },
    5: {
        title: "// 05: AES-256-GCM Engine",
        text: "The military-grade encryption engine. It feeds your Data Block (Step 04) and the Master Key (Step 03) into the AES-256 cipher to produce impenetrable ciphertext. GCM also generates an authentication tag to prevent tampering.",
        x: 340, y: 555
    },
    6: {
        title: "// 06: Zero-Knowledge Server",
        text: "Only the fully encrypted ciphertext and authentication tag are sent to the cloud. The server is mathematically 'blind'—it stores the vault but fundamentally cannot decrypt it without your local Master Key.",
        x: 640, y: 300
    }
};

export default function EncryptionPipeline() {
    const [hovered, setHovered] = useState<StepKey>(null);

    return (
        <div className="w-full h-full relative z-20 flex items-center justify-center p-2 lg:p-6">
            <svg
                viewBox="0 0 1000 600"
                className="w-full h-full drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] pointer-events-none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Decorative Grid */}
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
                <rect width="1000" height="600" fill="url(#grid)" />

                {/* DEFINITIONS for gradients and markers */}
                <defs>
                    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff4500" stopOpacity="0" />
                        <stop offset="50%" stopColor="#ff4500" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ff4500" stopOpacity="0" />
                    </linearGradient>
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Paths for the animated data dots in a Z-Shape */}
                    <path id="flow-pass-kdf" d="M 280 90 L 720 90" />
                    <path id="flow-kdf-key" d="M 840 140 C 840 190, 500 190, 500 240" />
                    <path id="flow-key-data" d="M 500 340 C 500 390, 160 390, 160 440" />
                    <path id="flow-data-engine" d="M 280 490 L 380 490" />
                    <path id="flow-engine-server" d="M 620 490 L 720 490" />

                    {/* Tooltip Background Blur (Safari support) */}
                    <filter id="tooltipBlur">
                        <feGaussianBlur stdDeviation="15" result="blur" />
                        <feComponentTransfer in="blur" result="faded">
                            <feFuncA type="linear" slope="0.8" />
                        </feComponentTransfer>
                        <feColorMatrix type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 1 0" />
                        <feComposite in="SourceGraphic" in2="faded" operator="over" />
                    </filter>
                </defs>

                {/* CONNECTION LINES (Edges) */}
                <g stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="6 6">
                    <path d="M 280 90 L 720 90" stroke={hovered === 1 || hovered === 2 ? "#ff4500" : undefined} className="transition-all duration-500" />
                    <path d="M 840 140 C 840 190, 500 190, 500 240" stroke={hovered === 2 || hovered === 3 ? "#00ffcc" : undefined} className="transition-all duration-500" />
                    <path d="M 500 340 C 500 390, 160 390, 160 440" stroke={hovered === 3 || hovered === 4 ? "#00ffcc" : undefined} className="transition-all duration-500" />
                    <path d="M 280 490 L 380 490" stroke={hovered === 4 || hovered === 5 ? "#ff4500" : undefined} className="transition-all duration-500" />
                    <path d="M 620 490 L 720 490" stroke={hovered === 5 || hovered === 6 ? "#a855f7" : undefined} className="transition-all duration-500" />
                </g>

                {/* DATA DOTS ANIMATIONS */}
                <g filter="url(#neonGlow)">
                    <circle r="4" fill="#ff4500">
                        <animateMotion dur="2.5s" repeatCount="indefinite"><mpath href="#flow-pass-kdf" /></animateMotion>
                    </circle>
                    <circle r="3" fill="#00ffcc">
                        <animateMotion dur="2s" begin="1.2s" repeatCount="indefinite"><mpath href="#flow-kdf-key" /></animateMotion>
                    </circle>
                    <circle r="5" fill="#00ffcc">
                        <animateMotion dur="1.5s" repeatCount="indefinite"><mpath href="#flow-key-data" /></animateMotion>
                    </circle>
                    <circle r="4" fill="#ff4500">
                        <animateMotion dur="1.5s" begin="0.8s" repeatCount="indefinite"><mpath href="#flow-data-engine" /></animateMotion>
                    </circle>
                    <circle r="5" fill="#a855f7">
                        <animateMotion dur="2.5s" repeatCount="indefinite"><mpath href="#flow-engine-server" /></animateMotion>
                    </circle>
                </g>

                {/* CONNECTION LABELS */}
                <g fontFamily="monospace" fontSize="11" fill="#aaaaaa" letterSpacing="1" textAnchor="middle">
                    <text x="500" y="80">UTF-8 BYTES</text>
                    <text x="670" y="195">32-BYTE DERIVATION</text>
                    <text x="330" y="380">MASTER KEY</text>
                    <text x="330" y="480">DATA BLOCK</text>
                    <text x="670" y="480">CIPHERTEXT + TAG</text>
                </g>

                {/* --- PIPELINE NODES (BOXES) --- */}

                {/* Master Password - STEP 01 */}
                <g 
                    transform="translate(40, 40)" 
                    className="pointer-events-auto cursor-pointer transition-all duration-300" 
                    onMouseEnter={() => setHovered(1)} 
                    onMouseLeave={() => setHovered(null)}
                >
                    <rect width="240" height="100" rx="6" fill="#080808" stroke={hovered === 1 ? "#ff4500" : "#333"} strokeWidth="2" className="transition-colors duration-300" />
                    <line x1="0" y1="0" x2="30" y2="0" stroke="#ff4500" strokeWidth="4" />
                    <text x="20" y="35" fill="#888" fontFamily="monospace" fontSize="12" letterSpacing="1">// STEP 01</text>
                    <text x="20" y="65" fill="#fff" fontFamily="sans-serif" fontSize="20" fontWeight="bold">Master Password</text>
                    <text x="20" y="85" fill="#666" fontFamily="monospace" fontSize="10">ONLY EXISTS IN MEMORY</text>
                </g>

                {/* PBKDF2 Hashing - STEP 02 */}
                <g 
                    transform="translate(720, 40)" 
                    className="pointer-events-auto cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHovered(2)} 
                    onMouseLeave={() => setHovered(null)}
                >
                    <rect width="240" height="100" rx="6" fill="#080808" stroke={hovered === 2 ? "#00ffcc" : "#333"} strokeWidth="2" className="transition-colors duration-300" />
                    <rect x="-4" y="25" width="4" height="50" fill="#00ffcc" opacity="0.8" />
                    <text x="20" y="35" fill="#00ffcc" fontFamily="monospace" fontSize="12" letterSpacing="1">// STEP 02</text>
                    <text x="20" y="65" fill="#00ffcc" fontFamily="sans-serif" fontSize="20" fontWeight="bold">PBKDF2 Hashing</text>
                    <text x="20" y="85" fill="#666" fontFamily="monospace" fontSize="10">100K ITERATIONS + SALT</text>
                </g>

                {/* Cryptographic Key - STEP 03 */}
                <g 
                    transform="translate(380, 240)" 
                    className="pointer-events-auto cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHovered(3)} 
                    onMouseLeave={() => setHovered(null)}
                >
                    <rect width="240" height="100" rx="6" fill="#080808" stroke={hovered === 3 ? "#00ffcc" : "#333"} strokeWidth="2" className="transition-colors duration-300" />
                    <line x1="210" y1="0" x2="240" y2="0" stroke="#00ffcc" strokeWidth="4" />
                    <text x="20" y="35" fill="#888" fontFamily="monospace" fontSize="12" letterSpacing="1">// STEP 03</text>
                    <text x="20" y="65" fill="#fff" fontFamily="sans-serif" fontSize="18" fontWeight="bold">Cryptographic Key</text>
                    <text x="20" y="85" fill="#666" fontFamily="monospace" fontSize="10">AES-256 (32 BYTES)</text>
                </g>

                {/* Private Vault Data - STEP 04 */}
                <g 
                    transform="translate(40, 440)" 
                    className="pointer-events-auto cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHovered(4)} 
                    onMouseLeave={() => setHovered(null)}
                >
                    <rect width="240" height="100" rx="6" fill="#080808" stroke={hovered === 4 ? "#ff4500" : "#333"} strokeWidth="2" className="transition-colors duration-300" />
                    <line x1="0" y1="0" x2="30" y2="0" stroke="#ff4500" strokeWidth="4" />
                    <text x="20" y="35" fill="#888" fontFamily="monospace" fontSize="12" letterSpacing="1">// STEP 04</text>
                    <text x="20" y="65" fill="#fff" fontFamily="sans-serif" fontSize="20" fontWeight="bold">Private Vault Data</text>
                    <text x="20" y="85" fill="#666" fontFamily="monospace" fontSize="10">PASSWORDS & NOTES</text>
                </g>

                {/* AES-256-GCM Engine - STEP 05 */}
                <g 
                    transform="translate(380, 440)" 
                    className="pointer-events-auto cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHovered(5)} 
                    onMouseLeave={() => setHovered(null)}
                >
                    <motion.rect
                        width="240" height="100" rx="6" fill="#110515" stroke="#a855f7" strokeWidth="2.5"
                        animate={hovered === 5 ? 
                            { strokeOpacity: 1, boxShadow: "0px 0px 25px #a855f7" } : 
                            { strokeOpacity: [1, 0.4, 1], boxShadow: ["0px 0px 5px #a855f7", "0px 0px 15px #a855f7", "0px 0px 5px #a855f7"] }
                        }
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <text x="25" y="35" fill="#a855f7" fontFamily="monospace" fontSize="12" letterSpacing="1">// STEP 05</text>
                    <text x="25" y="65" fill="#a855f7" fontFamily="sans-serif" fontSize="24" fontWeight="bold">AES-256-GCM</text>
                    <text x="25" y="85" fill="#a855f7" fontFamily="monospace" fontSize="10">AUTH TAG GENERATION</text>

                    {/* Inner decorative scanning line */}
                    <motion.line
                        x1="0" y1="50" x2="240" y2="50" stroke="#a855f7" strokeWidth="2" opacity="0.4"
                        animate={{ y1: [10, 90, 10], y2: [10, 90, 10] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                </g>

                {/* Cloud Server (Blind) - STEP 06 */}
                <g 
                    transform="translate(720, 440)" 
                    className="pointer-events-auto cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHovered(6)} 
                    onMouseLeave={() => setHovered(null)}
                >
                    <rect width="240" height="100" rx="6" fill="#080808" stroke={hovered === 6 ? "#888" : "#333"} strokeWidth="2" className="transition-colors duration-300" />
                    <rect x="236" y="25" width="4" height="50" fill="#a855f7" opacity="0.8" />
                    <text x="20" y="35" fill="#888" fontFamily="monospace" fontSize="12" letterSpacing="1">// STEP 06</text>
                    <text x="20" y="65" fill="#fff" fontFamily="sans-serif" fontSize="20" fontWeight="bold">Blind Server</text>
                    <text x="20" y="85" fill="#666" fontFamily="monospace" fontSize="10">CANNOT DECRYPT</text>
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
                                <div className="p-4 rounded-xl border border-white/20 shadow-[0_0_30px_rgba(0,0,0,1)] backdrop-blur-3xl bg-black/90 relative overflow-hidden group">
                                    {/* Glassmorphism gradient effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                                    <h3 
                                        className="font-mono text-xs mb-3 font-semibold tracking-wider"
                                        style={{ 
                                            color: hovered === 1 || hovered === 4 ? "#ff4500" : 
                                                   hovered === 2 || hovered === 3 ? "#00ffcc" : 
                                                   hovered === 5 ? "#a855f7" : "#fff" 
                                        }}
                                    >
                                        {TOOLTIPS[hovered].title}
                                    </h3>
                                    <div className="h-px w-full bg-white/10 mb-3" />
                                    <p className="text-gray-300 text-sm leading-relaxed font-sans shadow-black drop-shadow-md">
                                        {TOOLTIPS[hovered].text}
                                    </p>
                                </div>
                            </foreignObject>
                        </motion.g>
                    )}
                </AnimatePresence>

                {/* Decorative corner brackets for SVG container */}
                <path d="M 0 30 L 0 0 L 30 0" fill="none" stroke="#666" strokeWidth="2" />
                <path d="M 1000 30 L 1000 0 L 970 0" fill="none" stroke="#666" strokeWidth="2" />
                <path d="M 0 570 L 0 600 L 30 600" fill="none" stroke="#666" strokeWidth="2" />
                <path d="M 1000 570 L 1000 600 L 970 600" fill="none" stroke="#666" strokeWidth="2" />

            </svg>

            {/* Edge Fades for Seamless Integration */}
            <div className="absolute inset-y-0 left-0 w-12 lg:w-24 bg-gradient-to-r from-black to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 lg:w-24 bg-gradient-to-l from-black to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-10 lg:h-20 bg-gradient-to-b from-black to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-10 lg:h-20 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </div>
    );
}
