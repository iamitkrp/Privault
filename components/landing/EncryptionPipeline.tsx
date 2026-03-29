"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Key, Fingerprint, Lock, Database, Cpu, Server } from "lucide-react";

type StepKey = 1 | 2 | 3 | 4 | 5 | 6 | null;

const TOOLTIPS: Record<NonNullable<StepKey>, { title: string; text: string; x: number; y: number }> = {
    1: {
        title: "// 01: Master Password",
        text: "Your master password is the absolute root of your vault's security. It is never transmitted to our servers and only exists locally in your device's active memory. When you close the app, it is gone forever.",
        x: 40, y: 130
    },
    2: {
        title: "// 02: PBKDF2 Key Derivation",
        text: "Your password itself is too short to be a cryptographic key. It is mathematically hashed 100,000 times using PBKDF2 with a unique cryptographic salt. This computationally expensive process prevents brute-force guessing attacks.",
        x: 340, y: 130
    },
    3: {
        title: "// 03: Cryptographic Master Key",
        text: "The result of the hashing function is a pure 256-bit (32-byte) cryptographic key. This is the actual mathematical key used by the AES engine to lock and unlock your secure data.",
        x: 340, y: 5
    },
    4: {
        title: "// 04: Local Vault Data",
        text: "Your plaintext passwords, secure notes, and sensitive data blocks are prepared locally in your browser. This raw data never leaves your device unencrypted.",
        x: 40, y: 5
    },
    5: {
        title: "// 05: AES-256-GCM Engine",
        text: "The military-grade encryption engine. It feeds your Data Block (Step 04) and the Master Key (Step 03) into the AES-256 cipher to produce impenetrable ciphertext. GCM also generates an authentication tag to prevent tampering.",
        x: 40, y: 160
    },
    6: {
        title: "// 06: Zero-Knowledge Server",
        text: "Only the fully encrypted ciphertext and authentication tag are sent to the cloud. The server is mathematically 'blind'—it stores the vault but fundamentally cannot decrypt it without your local Master Key.",
        x: 340, y: 160
    }
};

export default function EncryptionPipeline() {
    const [hovered, setHovered] = useState<StepKey>(null);

    const PipelineCard = ({ step, title, subtitle, icon: Icon, color, isHovered, onEnter, onLeave }: any) => {
        return (
            <foreignObject width="320" height="180" x="-40" y="-40">
                <div 
                    className="w-[240px] h-[100px] mx-[40px] my-[40px] rounded-[10px] relative transition-transform duration-300"
                    onPointerEnter={onEnter}
                    onPointerLeave={onLeave}
                    style={{
                        cursor: "pointer",
                        transform: "scale(1)",
                        filter: isHovered ? `drop-shadow(0 12px 24px ${color}55)` : 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))'
                    }}
                >
                    {/* Top Section (Image Area) */}
                    <div 
                        className="absolute top-0 left-0 w-full h-[45px] rounded-t-[10px] transition-transform duration-[400ms] overflow-hidden"
                        style={{ 
                            backgroundColor: color,
                            transform: isHovered ? "translateY(-8px)" : "translateY(0px)",
                            zIndex: 0
                        }}
                    >
                        {/* Huge watermark-style icon in the top section */}
                        <div className="absolute right-2 -top-1 text-black opacity-[0.15]">
                            <Icon className="w-12 h-12 transform rotate-12" strokeWidth={2.5} />
                        </div>
                    </div>

                    {/* Bottom Section (Description Area) */}
                    <div 
                        className="absolute bottom-0 left-0 w-full h-[75px] rounded-[10px] flex flex-col justify-center px-4 transition-colors duration-300"
                        style={{ 
                            backgroundColor: "var(--bg-secondary)",
                            border: `1px solid var(--color-border)`,
                            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05)`,
                            zIndex: 10
                        }}
                    >
                        {/* Header Row */}
                        <div className="flex justify-between items-center w-full mb-[6px]">
                            <span className="mono text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: color }}>Step {step}</span>
                            <div className="flex gap-[3px]">
                                <span className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: color, opacity: 1 }} />
                                <span className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: color, opacity: 0.5 }} />
                                <span className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: color, opacity: 0.2 }} />
                            </div>
                        </div>

                        {/* Title Row */}
                        <h3 className="font-sans text-[15px] font-bold leading-[1.1] mb-[4px] text-foreground tracking-tight truncate">
                            {title}
                        </h3>

                        {/* Subtitle Row */}
                        <p className="mono text-[9px] text-fg-secondary uppercase tracking-[0.1em] truncate">
                            {subtitle}
                        </p>
                    </div>
                </div>
            </foreignObject>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full relative z-20 flex items-center justify-center p-2 xl:p-0 group"
        >

            <svg
                viewBox="0 0 700 480"
                className="w-full h-full relative z-10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid meet"
                onPointerLeave={() => setHovered(null)}
            >
                {/* DEFINITIONS for gradients and markers */}
                <defs>
                    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff4500" stopOpacity="0" />
                        <stop offset="50%" stopColor="#ff4500" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ff4500" stopOpacity="0" />
                    </linearGradient>
                    <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.08" />
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.04" />
                    </filter>
                    
                    {/* Connection Gradients */}
                    <linearGradient id="grad-path-1" gradientUnits="userSpaceOnUse" x1="280" y1="70" x2="420" y2="70">
                        <stop offset="0%" stopColor="var(--pipeline-neon-1)" />
                        <stop offset="100%" stopColor="var(--pipeline-neon-2)" />
                    </linearGradient>
                    <linearGradient id="grad-path-3" gradientUnits="userSpaceOnUse" x1="420" y1="230" x2="280" y2="230">
                        <stop offset="0%" stopColor="var(--pipeline-neon-2)" />
                        <stop offset="100%" stopColor="var(--pipeline-neon-1)" />
                    </linearGradient>
                    <linearGradient id="grad-path-4" gradientUnits="userSpaceOnUse" x1="160" y1="280" x2="160" y2="340">
                        <stop offset="0%" stopColor="var(--pipeline-neon-1)" />
                        <stop offset="100%" stopColor="var(--pipeline-neon-3)" />
                    </linearGradient>
                </defs>

                {/* THE ENTIRE VISUAL LAYOUT SHIFTED DOWN 30px FOR PERFECT VERTICAL CENTERING */}
                <g transform="translate(0, 30)">
                    {/* Vertical Pipeline Paths */}
                    <path id="flow-pass-kdf" d="M 280 70 L 420 70" />
                    <path id="flow-kdf-key" d="M 540 120 C 580 135, 580 165, 540 180" />
                    <path id="flow-key-data" d="M 420 230 L 280 230" />
                    <path id="flow-data-engine" d="M 160 280 C 120 295, 120 325, 160 340" />
                    <path id="flow-engine-server" d="M 280 390 L 420 390" />

                    {/* CONNECTION LINES (Edges) - Permanently visible gradients */}
                    <g fill="none" strokeWidth="2.5" strokeDasharray="4 4" strokeLinecap="round" opacity="0.6">
                        <path d="M 280 70 L 420 70" stroke="url(#grad-path-1)" />
                        <path d="M 540 120 C 580 135, 580 165, 540 180" stroke="var(--pipeline-neon-2)" />
                        <path d="M 420 230 L 280 230" stroke="url(#grad-path-3)" />
                        <path d="M 160 280 C 120 295, 120 325, 160 340" stroke="url(#grad-path-4)" />
                        <path d="M 280 390 L 420 390" stroke="var(--pipeline-neon-3)" />
                    </g>

                    {/* DATA DOTS ANIMATIONS */}
                    <g>
                        <circle r="4" fill="var(--pipeline-neon-1)">
                            <animateMotion dur="2.5s" repeatCount="indefinite"><mpath href="#flow-pass-kdf" /></animateMotion>
                        </circle>
                        <circle r="4" fill="var(--pipeline-neon-2)">
                            <animateMotion dur="2.5s" begin="0.5s" repeatCount="indefinite"><mpath href="#flow-kdf-key" /></animateMotion>
                        </circle>
                        <circle r="4" fill="var(--pipeline-neon-2)">
                            <animateMotion dur="2.5s" repeatCount="indefinite"><mpath href="#flow-key-data" /></animateMotion>
                        </circle>
                        <circle r="4" fill="var(--pipeline-neon-1)">
                            <animateMotion dur="2.5s" begin="0.8s" repeatCount="indefinite"><mpath href="#flow-data-engine" /></animateMotion>
                        </circle>
                        <circle r="4" fill="var(--pipeline-neon-3)">
                            <animateMotion dur="2.5s" repeatCount="indefinite"><mpath href="#flow-engine-server" /></animateMotion>
                        </circle>
                    </g>

                    {/* CONNECTION LABELS */}
                    <g fontFamily="monospace" fontSize="10" fontWeight="bold" fill="var(--color-fg-muted)" letterSpacing="1.5" textAnchor="middle" opacity="0.6">
                        <text x="350" y="60">UTF-8 BYTES</text>
                        <text x="610" y="155">32-BYTE DERIVATION</text>
                        <text x="350" y="220">MASTER KEY</text>
                        <text x="90" y="315">DATA BLOCK</text>
                        <text x="350" y="380">CIPHERTEXT + TAG</text>
                    </g>

                    {/* Master Password - STEP 01 */}
                    <g transform="translate(40, 20)">
                        <PipelineCard step="01" title="Master Password" subtitle="Only exists in memory" icon={Key} color="var(--pipeline-neon-1)" isHovered={hovered === 1} onEnter={() => setHovered(1)} onLeave={() => setHovered(null)} />
                    </g>

                    {/* PBKDF2 Hashing - STEP 02 */}
                    <g transform="translate(420, 20)">
                        <PipelineCard step="02" title="PBKDF2 Hashing" subtitle="100k iterations + salt" icon={Fingerprint} color="var(--pipeline-neon-2)" isHovered={hovered === 2} onEnter={() => setHovered(2)} onLeave={() => setHovered(null)} />
                    </g>

                    {/* Cryptographic Key - STEP 03 */}
                    <g transform="translate(420, 180)">
                        <PipelineCard step="03" title="Cryptographic Key" subtitle="AES-256 (32 BYTES)" icon={Lock} color="var(--pipeline-neon-2)" isHovered={hovered === 3} onEnter={() => setHovered(3)} onLeave={() => setHovered(null)} />
                    </g>

                    {/* Private Vault Data - STEP 04 */}
                    <g transform="translate(40, 180)">
                        <PipelineCard step="04" title="Private Vault Data" subtitle="Passwords & Notes" icon={Database} color="var(--pipeline-neon-1)" isHovered={hovered === 4} onEnter={() => setHovered(4)} onLeave={() => setHovered(null)} />
                    </g>

                    {/* AES-256-GCM Engine - STEP 05 */}
                    <g transform="translate(40, 340)">
                        <PipelineCard step="05" title="AES-256-GCM Engine" subtitle="Auth Tag Generation" icon={Cpu} color="var(--pipeline-neon-3)" isHovered={hovered === 5} onEnter={() => setHovered(5)} onLeave={() => setHovered(null)} />
                    </g>

                    {/* Cloud Server (Blind) - STEP 06 */}
                    <g transform="translate(420, 340)">
                        <PipelineCard step="06" title="Blind Server" subtitle="Zero-Knowledge Sandbox" icon={Server} color="var(--pipeline-neon-3)" isHovered={hovered === 6} onEnter={() => setHovered(6)} onLeave={() => setHovered(null)} />
                    </g>
                </g>

                {/* THE HOVER TOOLTIP */}
                <AnimatePresence>
                    {hovered && (
                        <motion.g
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="pointer-events-none"
                        >
                            <foreignObject x={TOOLTIPS[hovered as NonNullable<StepKey>].x} y={TOOLTIPS[hovered as NonNullable<StepKey>].y} width="300" height="150" className="overflow-visible">
                                <div className="p-4 rounded-xl bg-background border border-border shadow-lg flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div 
                                            className="w-1.5 h-1.5 rounded-full" 
                                            style={{ backgroundColor: hovered === 1 || hovered === 4 ? "var(--pipeline-neon-1)" : hovered === 2 || hovered === 3 ? "var(--pipeline-neon-2)" : "var(--pipeline-neon-3)" }} 
                                        />
                                        <h3 className="mono text-[11px] font-bold tracking-widest text-foreground uppercase">
                                            {TOOLTIPS[hovered as NonNullable<StepKey>].title}
                                        </h3>
                                    </div>
                                    <p className="text-fg-secondary text-[11.5px] leading-relaxed font-sans">
                                        {TOOLTIPS[hovered as NonNullable<StepKey>].text}
                                    </p>
                                </div>
                            </foreignObject>
                        </motion.g>
                    )}
                </AnimatePresence>

                {/* Decorative corner brackets for SVG container */}
                {/* Removed as requested */}

            </svg>
        </motion.div>
    );
}
