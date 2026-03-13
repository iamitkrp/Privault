"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { Settings, LogOut, ChevronDown } from "lucide-react";

export function UserMenu() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    const handleSignOut = async () => {
        setIsOpen(false);
        await signOut();
        router.push("/");
    };

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 mono text-xs text-gray-400 hover:text-white uppercase tracking-widest transition-colors px-3 py-2 border border-transparent hover:border-[#333] hover:bg-white/5"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                <span className="max-w-[200px] truncate">{user.email}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-[#0a0a0a] border border-[#333] shadow-2xl shadow-black/50 z-[200] overflow-hidden">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-[#222]">
                        <p className="mono text-[9px] text-gray-500 uppercase tracking-widest">Signed in as</p>
                        <p className="mono text-xs text-white truncate mt-0.5">{user.email}</p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                router.push("/settings");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <Settings className="w-3.5 h-3.5" />
                            Profile Settings
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left mono text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
