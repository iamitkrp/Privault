"use client";

import { motion } from "framer-motion";

export default function SecureVaultDoor() {
    return (
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[20%] w-[800px] h-[800px] xl:w-[1000px] xl:h-[1000px] opacity-60 pointer-events-none flex items-center justify-center">

            {/* Base Grid/Targeting Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-[120%] h-px bg-[#ff4500]" />
                <div className="h-[120%] w-px bg-[#ff4500] absolute" />
            </div>

            <svg viewBox="0 0 1000 1000" className="w-full h-full" fill="none" stroke="currentColor">

                {/* Outer Static Track */}
                <circle cx="500" cy="500" r="480" stroke="#333" strokeWidth="1" />
                <circle cx="500" cy="500" r="460" stroke="#222" strokeWidth="2" strokeDasharray="4 8" />

                {/* Slow Reverse Rotating Outer Dial */}
                <motion.g
                    animate={{ rotate: -360 }}
                    transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    style={{ originX: "50%", originY: "50%" }}
                >
                    <circle cx="500" cy="500" r="420" stroke="#444" strokeWidth="1" strokeDasharray="1 12" />
                    <circle cx="500" cy="500" r="400" stroke="#555" strokeWidth="2" strokeDasharray="60 40 2 40" />
                    {/* Edge Markers */}
                    <path d="M 500 60 L 500 100" stroke="#ff4500" strokeWidth="2" />
                    <path d="M 500 900 L 500 940" stroke="#ff4500" strokeWidth="2" />
                    <path d="M 60 500 L 100 500" stroke="#ff4500" strokeWidth="2" />
                    <path d="M 900 500 L 940 500" stroke="#ff4500" strokeWidth="2" />
                </motion.g>

                {/* Fast Forward Rotating Middle Dial */}
                <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                    style={{ originX: "50%", originY: "50%" }}
                >
                    <circle cx="500" cy="500" r="320" stroke="#333" strokeWidth="1" />
                    <circle cx="500" cy="500" r="300" stroke="#666" strokeWidth="4" strokeDasharray="2 20 40 20" />
                    <circle cx="500" cy="500" r="280" stroke="#ff4500" strokeWidth="1" strokeDasharray="4 60" opacity="0.5" />
                    {/* Inner Markers */}
                    {[...Array(12)].map((_, i) => (
                        <line
                            key={i}
                            x1="500" y1="180" x2="500" y2="200"
                            stroke="#555" strokeWidth="2"
                            transform={`rotate(${i * 30} 500 500)`}
                        />
                    ))}
                </motion.g>

                {/* The Iris/Aperture Core */}
                <motion.g
                    animate={{ rotate: -360 }}
                    transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                    style={{ originX: "50%", originY: "50%" }}
                >
                    {/* Hexagon Core representing Privault's logo shape */}
                    <polygon points="500,250 716.5,375 716.5,625 500,750 283.5,625 283.5,375" stroke="#444" strokeWidth="1" fill="rgba(0,0,0,0.5)" />
                    <circle cx="500" cy="500" r="230" stroke="#222" strokeWidth="1" />

                    {/* Aperture Blades (Abstract representation) */}
                    {[...Array(6)].map((_, i) => (
                        <path
                            key={i}
                            d="M 500 270 L 610 500 L 500 500 Z"
                            stroke="#555"
                            strokeWidth="1"
                            fill="rgba(50,50,50,0.1)"
                            transform={`rotate(${i * 60} 500 500)`}
                        />
                    ))}
                </motion.g>

                {/* Intricate Inner Locking Mechanism */}
                <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    style={{ originX: "50%", originY: "50%" }}
                >
                    <circle cx="500" cy="500" r="150" stroke="#ff4500" strokeWidth="1" strokeDasharray="100 50" opacity="0.6" />
                    <circle cx="500" cy="500" r="140" stroke="#888" strokeWidth="2" strokeDasharray="1 10" />
                    <circle cx="500" cy="500" r="100" stroke="#333" strokeWidth="1" />
                </motion.g>

                {/* Core Dot */}
                <circle cx="500" cy="500" r="10" fill="#ff4500" opacity="0.8" />
                <circle cx="500" cy="500" r="40" stroke="#ff4500" strokeWidth="1" fill="none" opacity="0.4" />

            </svg>

            {/* Decorative Technical Labels overlayed */}
            <div className="absolute top-[25%] left-[15%] text-[10px] font-mono text-gray-500 uppercase tracking-widest hidden md:block border border-[#333] bg-black/50 px-2 py-1 backdrop-blur-sm">
                <div>SYS_LOCK: ENGAGED</div>
                <div className="text-[#ff4500]">SEQ. 0x8F9B</div>
            </div>

            <div className="absolute bottom-[25%] left-[20%] text-[10px] font-mono text-gray-500 uppercase tracking-widest hidden md:block border border-[#333] bg-black/50 px-2 py-1 backdrop-blur-sm">
                <div>ZKP_PROTOCOL</div>
                <div>VERIFIED // TRUE</div>
            </div>

            <div className="absolute top-[50%] left-[8%] -translate-y-1/2 text-[10px] font-mono text-gray-600 uppercase tracking-widest origin-bottom-left -rotate-90 hidden md:block">
                SECURE APERTURE V2.4
            </div>

            {/* Fade Mask so it blends into the background nicely on the left side */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-transparent to-transparent z-10" />
        </div>
    );
}
