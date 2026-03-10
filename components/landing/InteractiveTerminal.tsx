"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const BOOT_SEQUENCE = [
    "[SYSTEM] INITIALIZING SECURE KERNEL...",
    "[SYSTEM] LOADING CRYPTOGRAPHIC MODULES...",
    "[SYSTEM] MOUNTING VIRTUAL FILESYSTEM...",
    "[NETWORK] ESTABLISHING ENCRYPTED TUNNEL [WSS://VAULT.PRIVAULT.IO]",
    "[NETWORK] HANDSHAKE SUCCESSFUL. ELIPTIC CURVE: P-384",
    "[AUTH] WAITING FOR USER CREDENTIALS...",
];

const ENCRYPTION_LOGS = [
    "Generating random entropy pool...",
    "Deriving master key via PBKDF2 (100,000 iterations)...",
    "Key derivation complete. Time: 482ms",
    "Encrypting payload chunk 1/4 (AES-256-GCM)...",
    "Encrypting payload chunk 2/4 (AES-256-GCM)...",
    "Encrypting payload chunk 3/4 (AES-256-GCM)...",
    "Encrypting payload chunk 4/4 (AES-256-GCM)...",
    "Calculating authentication tag...",
    "Payload encrypted successfully. Size: 4.2MB",
    "Syncing ciphertext to origin server...",
    "Sync complete. Zero-knowledge proof verified.",
];

export default function InteractiveTerminal() {
    const [lines, setLines] = useState<string[]>([]);
    const [phase, setPhase] = useState<"boot" | "idle" | "encrypting">("boot");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        let currentLine = 0;

        const runSequence = (sequence: string[], nextPhase: "boot" | "idle" | "encrypting", delayMs: number) => {
            if (currentLine < sequence.length) {
                setLines((prev) => [...prev, sequence[currentLine] || ""].slice(-40));
                currentLine++;
                timeout = setTimeout(() => runSequence(sequence, nextPhase, delayMs), Math.random() * delayMs + 50);
            } else {
                setPhase(nextPhase);
            }
        };

        if (phase === "boot") {
            setLines([]);
            currentLine = 0;
            runSequence(BOOT_SEQUENCE, "idle", 300);
        } else if (phase === "idle") {
            timeout = setTimeout(() => {
                setLines((prev) => [...prev, "", ">> INCOMING DATA STREAM DETECTED.", ">> INITIATING ENCRYPTION PROTOCOL..."]);
                setPhase("encrypting");
            }, 3000);
        } else if (phase === "encrypting") {
            currentLine = 0;
            runSequence(ENCRYPTION_LOGS, "idle", 200);
        }

        return () => clearTimeout(timeout);
    }, [phase]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [lines]);

    return (
        <div className="relative w-full max-w-[500px] xl:max-w-[600px] h-[400px] xl:h-[450px] z-20">
            <div className="w-full h-full bg-black/80 backdrop-blur-xl border border-[#333] rounded-sm flex flex-col font-mono text-[10px] xl:text-xs overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">

                {/* Terminal Header */}
                <div className="h-8 border-b border-[#333] bg-[#0a0a0a] flex items-center px-4 justify-between select-none">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff4500]/20 border border-[#ff4500]/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                    </div>
                    <div className="text-gray-500 uppercase tracking-widest text-[9px]">Root@Privault-Core:~</div>
                    <div className="w-12" /> {/* Spacer for balance */}
                </div>

                {/* Terminal Body */}
                <div ref={containerRef} className="flex-1 p-4 overflow-y-auto overflow-x-hidden text-emerald-500/80 custom-scrollbar leading-relaxed">
                    {lines.map((line, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`mb-1 ${line.startsWith("[SYSTEM]") ? "text-blue-400/80" : line.startsWith("[NETWORK]") ? "text-purple-400/80" : line.startsWith("[AUTH]") ? "text-yellow-400/80" : line.startsWith(">>") ? "text-[#ff4500]" : ""}`}
                        >
                            {line || "\u00A0"}
                        </motion.div>
                    ))}
                    {/* Blinking Cursor */}
                    <motion.div
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-2 h-3.5 bg-emerald-500 inline-block align-middle ml-1 mt-1"
                    />
                    <div />
                </div>

                {/* Scanline Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-50 mix-blend-overlay" />
            </div>

            {/* Glow Behind Terminal */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-900/10 blur-[100px] -z-10 rounded-full" />
        </div>
    );
}
