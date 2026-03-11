"use client";

import { motion } from "framer-motion";

export default function EncryptionPipeline() {
    return (
        <div className="w-full h-full relative z-20 flex items-center justify-center p-2 lg:p-6 pointer-events-none">
            <svg
                viewBox="0 0 1000 600"
                className="w-full h-full drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
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
                </defs>

                {/* CONNECTION LINES (Edges) */}
                <g stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="6 6">
                    <path d="M 280 90 L 720 90" />
                    <path d="M 840 140 C 840 190, 500 190, 500 240" />
                    <path d="M 500 340 C 500 390, 160 390, 160 440" />
                    <path d="M 280 490 L 380 490" />
                    <path d="M 620 490 L 720 490" />
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

                {/* Master Password */}
                <g transform="translate(40, 40)">
                    <rect width="240" height="100" rx="6" fill="#080808" stroke="#333" strokeWidth="2" />
                    <line x1="0" y1="0" x2="30" y2="0" stroke="#ff4500" strokeWidth="4" />
                    <text x="20" y="35" fill="#888" fontFamily="monospace" fontSize="12" letterSpacing="1">// STEP 01</text>
                    <text x="20" y="65" fill="#fff" fontFamily="sans-serif" fontSize="20" fontWeight="bold">Master Password</text>
                    <text x="20" y="85" fill="#666" fontFamily="monospace" fontSize="10">ONLY EXISTS IN MEMORY</text>
                </g>

                {/* PBKDF2 Hashing */}
                <g transform="translate(720, 40)">
                    <rect width="240" height="100" rx="6" fill="#080808" stroke="#333" strokeWidth="2" />
                    <rect x="-4" y="25" width="4" height="50" fill="#00ffcc" opacity="0.8" />
                    <text x="20" y="35" fill="#00ffcc" fontFamily="monospace" fontSize="12" letterSpacing="1">// STEP 02</text>
                    <text x="20" y="65" fill="#00ffcc" fontFamily="sans-serif" fontSize="20" fontWeight="bold">PBKDF2 Hashing</text>
                    <text x="20" y="85" fill="#666" fontFamily="monospace" fontSize="10">100K ITERATIONS + SALT</text>
                </g>

                {/* Cryptographic Key */}
                <g transform="translate(380, 240)">
                    <rect width="240" height="100" rx="6" fill="#080808" stroke="#333" strokeWidth="2" />
                    <line x1="210" y1="0" x2="240" y2="0" stroke="#00ffcc" strokeWidth="4" />
                    <text x="20" y="35" fill="#888" fontFamily="monospace" fontSize="12" letterSpacing="1">// STEP 03</text>
                    <text x="20" y="65" fill="#fff" fontFamily="sans-serif" fontSize="18" fontWeight="bold">Cryptographic Key</text>
                    <text x="20" y="85" fill="#666" fontFamily="monospace" fontSize="10">AES-256 (32 BYTES)</text>
                </g>

                {/* Private Vault Data */}
                <g transform="translate(40, 440)">
                    <rect width="240" height="100" rx="6" fill="#080808" stroke="#333" strokeWidth="2" />
                    <line x1="0" y1="0" x2="30" y2="0" stroke="#ff4500" strokeWidth="4" />
                    <text x="20" y="35" fill="#888" fontFamily="monospace" fontSize="12" letterSpacing="1">// STEP 04</text>
                    <text x="20" y="65" fill="#fff" fontFamily="sans-serif" fontSize="20" fontWeight="bold">Private Vault Data</text>
                    <text x="20" y="85" fill="#666" fontFamily="monospace" fontSize="10">PASSWORDS & NOTES</text>
                </g>

                {/* AES-256-GCM Engine */}
                <g transform="translate(380, 440)">
                    <motion.rect
                        width="240" height="100" rx="6" fill="#110515" stroke="#a855f7" strokeWidth="2.5"
                        animate={{ strokeOpacity: [1, 0.4, 1], boxShadow: ["0px 0px 5px #a855f7", "0px 0px 15px #a855f7", "0px 0px 5px #a855f7"] }}
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

                {/* Cloud Server (Blind) */}
                <g transform="translate(720, 440)">
                    <rect width="240" height="100" rx="6" fill="#080808" stroke="#333" strokeWidth="2" />
                    <rect x="236" y="25" width="4" height="50" fill="#a855f7" opacity="0.8" />
                    <text x="20" y="35" fill="#888" fontFamily="monospace" fontSize="12" letterSpacing="1">// STEP 06</text>
                    <text x="20" y="65" fill="#fff" fontFamily="sans-serif" fontSize="20" fontWeight="bold">Blind Server</text>
                    <text x="20" y="85" fill="#666" fontFamily="monospace" fontSize="10">CANNOT DECRYPT</text>
                </g>

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
