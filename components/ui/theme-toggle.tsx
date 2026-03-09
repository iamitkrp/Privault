"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * Theme toggle component — switches between dark and light mode
 * by setting the `data-theme` attribute on the <html> element.
 * Persists the preference in localStorage.
 */
export function ThemeToggle() {
    const [theme, setTheme] = useState<"dark" | "light">("dark");

    useEffect(() => {
        const stored = localStorage.getItem("privault-theme") as "dark" | "light" | null;
        if (stored) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTheme(stored);
            document.documentElement.setAttribute("data-theme", stored);
        }
    }, []);

    const toggle = () => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("privault-theme", next);
    };

    return (
        <button
            onClick={toggle}
            className="p-2 rounded-lg text-secondary hover:text-foreground hover:bg-white/5 transition-all"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            {theme === "dark" ? (
                <Sun className="w-4.5 h-4.5" />
            ) : (
                <Moon className="w-4.5 h-4.5" />
            )}
        </button>
    );
}
