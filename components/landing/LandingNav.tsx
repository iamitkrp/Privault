"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { UserMenu } from "@/components/ui/user-menu";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function LandingNav() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const handleLoginClick = (e: React.MouseEvent) => {
      e.preventDefault();
      setAuthMode("login");
      setIsAuthModalOpen(true);
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md border-b border-border-secondary bg-background/40"
      >
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
            className="text-foreground/30 group-hover:text-foreground/70 transition-colors duration-500"
          >
            {/* The base hexagon, always visible */}
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>

          {/* The glowing animated tracer line */}
          <motion.svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground drop-shadow-[0_0_8px_rgba(var(--color-foreground),0.8)] group-hover:text-amber-500 group-hover:drop-shadow-[0_0_12px_rgba(245,158,11,1)] transition-all duration-500 absolute left-0 top-1/2 -translate-y-1/2"
          >
            <motion.path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                initial={{ pathLength: 0, pathOffset: 0 }}
                animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 1, 2] }}
                transition={{ duration: 4, ease: "linear", repeat: Infinity }}
            />
          </motion.svg>
          <span className="mono text-sm tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-foreground to-fg-secondary relative z-10 transition-colors duration-500 group-hover:from-foreground group-hover:to-amber-500">
            PRIVAULT.
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-12 mono text-xs text-fg-secondary">
          <Link href="/core-tech" className={`hover:text-foreground transition-colors uppercase tracking-widest ${pathname === "/core-tech" ? "text-foreground font-bold" : ""}`}>Core Tech</Link>
          <Link href="/architecture" className={`hover:text-foreground transition-colors uppercase tracking-widest ${pathname === "/architecture" ? "text-foreground font-bold" : ""}`}>Architecture</Link>
          <Link href="/data-model" className={`hover:text-foreground transition-colors uppercase tracking-widest ${pathname === "/data-model" ? "text-foreground font-bold" : ""}`}>Data Model</Link>
          <Link href="/docs" className={`hover:text-foreground transition-colors uppercase tracking-widest ${pathname === "/docs" ? "text-foreground font-bold" : ""}`}>Docs</Link>
        </div>

        <div className="flex items-center gap-4 mono text-xs">
          <ThemeSwitcher />
          {user && profile ? (
              <UserMenu />
          ) : (
            <button onClick={handleLoginClick} className="px-6 py-2 border border-border text-foreground hover:bg-foreground/5 transition-colors uppercase tracking-widest cursor-pointer">
                Sign In
            </button>
          )}
        </div>
      </motion.nav>
      
      <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          initialMode={authMode}
          onSuccess={() => router.push("/dashboard")}
      />
    </>
  );
}
