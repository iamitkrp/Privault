"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function AnimatedLogo() {
    return (
        <Link href="/" className="flex items-center gap-3 font-semibold text-lg tracking-wide group cursor-pointer relative">
            <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/20 group-hover:text-white/50 transition-colors duration-500"
            >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>

            <motion.svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] group-hover:text-amber-500 group-hover:drop-shadow-[0_0_12px_rgba(245,158,11,1)] transition-all duration-500 absolute left-0 top-1/2 -translate-y-1/2"
            >
                <motion.path
                    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                    initial={{ pathLength: 0, pathOffset: 0 }}
                    animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 1, 2] }}
                    transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                />
            </motion.svg>

            <span className="mono text-sm tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 relative z-10 transition-colors duration-500 group-hover:from-white group-hover:to-amber-500">
                PRIVAULT.
            </span>
        </Link>
    );
}
