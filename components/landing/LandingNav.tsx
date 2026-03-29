"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { UserMenu } from "@/components/ui/user-menu";
import { ThemeSwitcher } from "@/components/theme-switcher";

const NAV = [
  { href: "/core-tech", label: "Core tech" },
  { href: "/architecture", label: "Architecture" },
  { href: "/data-model", label: "Data model" },
  { href: "/docs", label: "Docs" },
] as const;

/** Immersive top bar — logo left, links + CTA clustered right (Clay-style rail). */
export function LandingNav() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setNavHidden(false);
    lastScrollY.current = typeof window !== "undefined" ? window.scrollY : 0;
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) setNavHidden(false);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => {
      if (mobileOpen) return;
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      lastScrollY.current = y;

      if (y <= 12) {
        setNavHidden(false);
        return;
      }
      if (delta > 6) setNavHidden(true);
      else if (delta < -6) setNavHidden(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileOpen]);

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setAuthMode("login");
    setIsAuthModalOpen(true);
  };

  const linkClass = (active: boolean) =>
    `whitespace-nowrap text-[0.8125rem] font-medium tracking-wide transition-colors ${
      active ? "text-foreground" : "text-foreground/55 hover:text-foreground"
    }`;

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          y: navHidden ? "-100%" : 0,
        }}
        transition={{
          opacity: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
          y: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
        }}
        className="fixed top-0 inset-x-0 z-50 will-change-transform"
      >
        <div className="bg-background/45 backdrop-blur-2xl backdrop-saturate-150 [html[data-theme=light]_&]:bg-paper/40">
          <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-6 md:h-[4.25rem] md:px-12">
            <Link
              href="/"
              className="group relative flex min-w-0 shrink-0 items-center gap-2.5 text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <span
                className="relative h-8 w-8 shrink-0"
                aria-hidden
              >
                {/* Base hex */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-foreground/30 transition-colors duration-300 group-hover:text-foreground/55"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
                {/* Animated stroke — same path */}
                <motion.svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="pointer-events-none absolute inset-0 text-primary drop-shadow-[0_0_8px_rgba(0,204,102,0.35)] transition-colors group-hover:text-primary [html[data-theme=light]_&]:drop-shadow-[0_0_10px_rgba(139,92,246,0.35)]"
                >
                  <motion.path
                    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                    initial={{ pathLength: 0, pathOffset: 0 }}
                    animate={{ pathLength: [0, 0.45, 0], pathOffset: [0, 1, 2] }}
                    transition={{ duration: 3.5, ease: "linear", repeat: Infinity }}
                  />
                </motion.svg>
              </span>
              <span className="truncate bg-gradient-to-r from-foreground to-fg-secondary bg-clip-text text-[0.95rem] font-semibold leading-none tracking-tight text-transparent transition-all duration-300 group-hover:from-foreground group-hover:to-primary lowercase [html[data-theme=light]_&]:group-hover:to-primary">
                privault
              </span>
            </Link>

            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3 md:gap-4">
              <nav
                className="hidden items-center gap-7 lg:flex xl:gap-9"
                aria-label="Main"
              >
                {NAV.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={linkClass(pathname === href)}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-1 sm:gap-2 md:ml-2 md:border-l md:border-foreground/10 md:pl-4 lg:pl-6 [html[data-theme=light]_&]:md:border-black/10">
                <ThemeSwitcher className="rounded-full p-2 text-foreground/70 transition-colors hover:bg-foreground/[0.06] hover:text-foreground [html[data-theme=light]_&]:hover:bg-black/[0.05]" />

                {user && profile ? (
                  <div className="hidden min-w-0 sm:block [&_button]:rounded-full [&_button]:border-0 [&_button]:bg-foreground/[0.06] [&_button]:px-3.5 [&_button]:py-2 [&_button]:text-xs [&_button]:font-medium [&_button]:normal-case [&_button]:tracking-normal [html[data-theme=light]_&]:[&_button]:bg-black/[0.06]">
                    <UserMenu />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleLoginClick}
                    className="hidden rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 sm:inline-flex"
                  >
                    Sign in
                  </button>
                )}

                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/[0.06] lg:hidden [html[data-theme=light]_&]:hover:bg-black/[0.05]"
                  aria-expanded={mobileOpen}
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                  onClick={() => setMobileOpen((o) => !o)}
                >
                  {mobileOpen ? (
                    <X className="h-5 w-5" strokeWidth={1.75} />
                  ) : (
                    <Menu className="h-5 w-5" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden border-t border-foreground/[0.05] bg-background/55 backdrop-blur-xl [html[data-theme=light]_&]:border-black/[0.05] [html[data-theme=light]_&]:bg-paper/50 lg:hidden"
              >
                <nav
                  className="flex flex-col px-6 py-4 md:px-12"
                  aria-label="Mobile main"
                >
                  {NAV.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`border-b border-foreground/[0.05] py-3.5 text-[0.9375rem] font-medium tracking-wide last:border-b-0 [html[data-theme=light]_&]:border-black/[0.05] ${
                        pathname === href
                          ? "text-foreground"
                          : "text-foreground/55"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                  <div className="mt-4 flex flex-col gap-2 border-t border-foreground/[0.05] pt-4 [html[data-theme=light]_&]:border-black/[0.05]">
                    {user && profile ? (
                      <div className="sm:hidden [&_button]:w-full [&_button]:justify-between">
                        <UserMenu />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          setMobileOpen(false);
                          handleLoginClick(e);
                        }}
                        className="w-full rounded-full bg-foreground py-3 text-sm font-medium text-background sm:hidden"
                      >
                        Sign in
                      </button>
                    )}
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={() => router.push("/dashboard")}
      />
    </>
  );
}
