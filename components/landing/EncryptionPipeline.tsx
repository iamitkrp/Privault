"use client";

import { motion } from "framer-motion";

export default function EncryptionPipeline() {
    return (
        <div className="w-full h-full relative z-20 flex items-center justify-center p-4">
            <svg
                viewBox="0 0 1000 500"
                className="w-full h-full max-w-[800px] xl:max-w-[1000px] drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Decorative Grid */}
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
                <rect width="1000" height="500" fill="url(#grid)" />

                {/* DEFINITIONS for gradients and markers */}
                <defs>
                    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff4500" stopOpacity="0" />
                        <stop offset="50%" stopColor="#ff4500" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ff4500" stopOpacity="0" />
                    </linearGradient>
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Paths for the animated data dots */}
                    <path id="flow-pass-kdf" d="M 200 135 L 300 135" />
                    <path id="flow-kdf-key" d="M 480 135 L 560 135" />
                    <path id="flow-key-aes" d="M 640 170 L 640 300" />
                    <path id="flow-data-aes" d="M 200 335 L 560 335" />
                    <path id="flow-aes-cloud" d="M 720 335 C 780 335 780 235 840 235" />
                </defs>

                {/* CONNECTION LINES (Edges) */}
                <g stroke="#333" strokeWidth="2" strokeDasharray="4 4" fill="none">
                    <path d="M 200 135 L 300 135" />
                    <path d="M 480 135 L 560 135" />
                    <path d="M 640 170 L 640 300" />
                    <path d="M 200 335 L 560 335" />
                    <path d="M 720 335 C 780 335 780 235 840 235" />
                </g>

                {/* DATA DOTS ANIMATIONS */}
                <g filter="url(#neonGlow)">
                    <circle r="3" fill="#ff4500">
                        <animateMotion dur="2s" repeatCount="indefinite">
                            <mpath href="#flow-pass-kdf" />
                        </animateMotion>
                    </circle>
                    <circle r="3" fill="#00ffcc">
                        <animateMotion dur="2s" begin="1s" repeatCount="indefinite">
                            <mpath href="#flow-kdf-key" />
                        </animateMotion>
                    </circle>
                    <circle r="4" fill="#00ffcc">
                        <animateMotion dur="1.5s" repeatCount="indefinite">
                            <mpath href="#flow-key-aes" />
                        </animateMotion>
                    </circle>
                    <circle r="3" fill="#ff4500">
                        <animateMotion dur="3s" repeatCount="indefinite">
                            <mpath href="#flow-data-aes" />
                        </animateMotion>
                    </circle>
                    <circle r="4" fill="#a855f7">
                        <animateMotion dur="2.5s" repeatCount="indefinite">
                            <mpath href="#flow-aes-cloud" />
                        </animateMotion>
                    </circle>
                </g>

                {/* Edge Labels */}
                <g fontFamily="monospace" fontSize="9" fill="#666" letterSpacing="1">
                    <text x="210" y="125">UTF-8 BYTES</text>
                    <text x="490" y="125">32-BYTE KEY</text>
                    <text x="650" y="240" transform="rotate(90 650 240)">MASTER KEY</text>
                    <text x="350" y="325">PLAINTEXT JSON</text>
                    <text x="750" y="305">CIPHERTEXT + TAG</text>
                </g>

                {/* --- BOXES --- */}

                {/* 1. User Password */}
                <g transform="translate(20, 100)">
                    <rect width="180" height="70" rx="4" fill="#050505" stroke="#444" strokeWidth="1" />
                    <line x1="0" y1="0" x2="20" y2="0" stroke="#ff4500" strokeWidth="2" />
                    <text x="15" y="25" fill="#888" fontFamily="monospace" fontSize="10" letterSpacing="1">INPUT // 01</text>
                    <text x="15" y="45" fill="#fff" fontFamily="sans-serif" fontSize="14" fontWeight="bold">Master Password</text>
                    <text x="15" y="60" fill="#555" fontFamily="monospace" fontSize="9">ONLY EXISTS IN MEMORY</text>
                </g>

                {/* 2. PBKDF2 */}
                <g transform="translate(300, 100)">
                    <rect width="180" height="70" rx="4" fill="#050505" stroke="#444" strokeWidth="1" />
                    <rect x="-5" y="15" width="5" height="40" fill="#00ffcc" opacity="0.5" />
                    <text x="15" y="25" fill="#00ffcc" fontFamily="monospace" fontSize="10" letterSpacing="1">KDF // 02</text>
                    <text x="15" y="45" fill="#00ffcc" fontFamily="sans-serif" fontSize="14" fontWeight="bold">PBKDF2 Hashing</text>
                    <text x="15" y="60" fill="#555" fontFamily="monospace" fontSize="9">100,000 ITERATIONS + SALT</text>
                </g>

                {/* 3. Master Key */}
                <g transform="translate(560, 100)">
                    <rect width="160" height="70" rx="4" fill="#050505" stroke="#444" strokeWidth="1" />
                    <line x1="140" y1="0" x2="160" y2="0" stroke="#00ffcc" strokeWidth="2" />
                    <text x="15" y="25" fill="#888" fontFamily="monospace" fontSize="10" letterSpacing="1">DERIVED // 03</text>
                    <text x="15" y="45" fill="#fff" fontFamily="sans-serif" fontSize="14" fontWeight="bold">Cryptographic Key</text>
                    <text x="15" y="60" fill="#555" fontFamily="monospace" fontSize="9">AES-256 (32 BYTES)</text>
                </g>

                {/* 4. Vault Data (Plaintext) */}
                <g transform="translate(20, 300)">
                    <rect width="180" height="70" rx="4" fill="#050505" stroke="#444" strokeWidth="1" />
                    <line x1="0" y1="0" x2="20" y2="0" stroke="#ff4500" strokeWidth="2" />
                    <text x="15" y="25" fill="#888" fontFamily="monospace" fontSize="10" letterSpacing="1">LOCAL // 04</text>
                    <text x="15" y="45" fill="#fff" fontFamily="sans-serif" fontSize="14" fontWeight="bold">Private Vault Data</text>
                    <text x="15" y="60" fill="#555" fontFamily="monospace" fontSize="9">PASSWORDS & NOTES</text>
                </g>

                {/* 5. AES-256-GCM Engine */}
                <g transform="translate(560, 300)">
                    <motion.rect
                        width="160"
                        height="70"
                        rx="4"
                        fill="#050505"
                        stroke="#a855f7"
                        strokeWidth="1.5"
                        animate={{ strokeOpacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <text x="15" y="25" fill="#a855f7" fontFamily="monospace" fontSize="10" letterSpacing="1">ENGINE // 05</text>
                    <text x="15" y="45" fill="#a855f7" fontFamily="sans-serif" fontSize="14" fontWeight="bold">AES-256-GCM</text>
                    <text x="15" y="60" fill="#555" fontFamily="monospace" fontSize="9">AUTH TAG GENERATION</text>

                    {/* Inner decorative scanning line */}
                    <motion.line
                        x1="0" y1="35" x2="160" y2="35"
                        stroke="#a855f7"
                        strokeWidth="1"
                        opacity="0.3"
                        animate={{ y1: [10, 60, 10], y2: [10, 60, 10] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                </g>

                {/* 6. Cloud Server Storage */}
                <g transform="translate(840, 200)">
                    <rect width="140" height="70" rx="4" fill="#050505" stroke="#444" strokeWidth="1" />
                    <rect x="135" y="15" width="5" height="40" fill="#a855f7" opacity="0.5" />
                    <text x="15" y="25" fill="#888" fontFamily="monospace" fontSize="10" letterSpacing="1">REMOTE // 06</text>
                    <text x="15" y="45" fill="#fff" fontFamily="sans-serif" fontSize="14" fontWeight="bold">Blind Server</text>
                    <text x="15" y="60" fill="#555" fontFamily="monospace" fontSize="9">CANNOT DECRYPT</text>
                </g>

                {/* Decorative corner brackets for SVG container */}
                <path d="M 0 20 L 0 0 L 20 0" fill="none" stroke="#666" strokeWidth="2" />
                <path d="M 1000 20 L 1000 0 L 980 0" fill="none" stroke="#666" strokeWidth="2" />
                <path d="M 0 480 L 0 500 L 20 500" fill="none" stroke="#666" strokeWidth="2" />
                <path d="M 1000 480 L 1000 500 L 980 500" fill="none" stroke="#666" strokeWidth="2" />

            </svg>

            {/* Fade overlay so left/right sides blend into background */}
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black to-transparent pointer-events-none" />
        </div>
    );
}
