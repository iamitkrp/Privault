"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, RefreshCw, Settings2, Check } from "lucide-react";
import { SESSION_CONFIG } from "@/constants";

interface PasswordGeneratorProps {
    onSelectPattern?: (password: string) => void;
}

export function PasswordGenerator({ onSelectPattern }: PasswordGeneratorProps) {
    const [password, setPassword] = useState("");
    const [length, setLength] = useState(16);
    const [useUpper, setUseUpper] = useState(true);
    const [useLower, setUseLower] = useState(true);
    const [useNumbers, setUseNumbers] = useState(true);
    const [useSymbols, setUseSymbols] = useState(true);
    const [copied, setCopied] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const clipboardClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup pending clipboard-clear timer on unmount
    useEffect(() => {
        return () => {
            if (clipboardClearTimer.current) clearTimeout(clipboardClearTimer.current);
        };
    }, []);

    const generatePassword = () => {
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

        let charset = "";
        if (useUpper) charset += upper;
        if (useLower) charset += lower;
        if (useNumbers) charset += numbers;
        if (useSymbols) charset += symbols;

        // Fallback if all disabled
        if (charset === "") {
            charset = lower + numbers;
            setUseLower(true);
            setUseNumbers(true);
        }

        // Rejection sampling to eliminate modulo bias.
        // The largest multiple of charset.length that fits in 2^32.
        const ceiling = Math.floor(0x100000000 / charset.length) * charset.length;

        let generated = "";
        let buffer = new Uint32Array(length * 4);
        window.crypto.getRandomValues(buffer);
        let bufIdx = 0;

        while (generated.length < length) {
            // Refill buffer if exhausted
            if (bufIdx >= buffer.length) {
                buffer = new Uint32Array(length * 4);
                window.crypto.getRandomValues(buffer);
                bufIdx = 0;
            }

            const value = buffer[bufIdx]!;
            bufIdx++;

            // Skip values in the rejection zone (biased remainder)
            if (value >= ceiling) continue;

            generated += charset[value % charset.length];
        }

        setPassword(generated);
        if (onSelectPattern) {
            onSelectPattern(generated);
        }
    };

    // Generate on mount or setting change
    useEffect(() => {
        generatePassword();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [length, useUpper, useLower, useNumbers, useSymbols]);

    const copyToClipboard = async () => {
        try {
            if (password) {
                await navigator.clipboard.writeText(password);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                // Reset clipboard-clear timer so the latest copy gets the full retention window
                if (clipboardClearTimer.current) clearTimeout(clipboardClearTimer.current);
                clipboardClearTimer.current = setTimeout(
                    () => navigator.clipboard.writeText('').catch(() => { }),
                    SESSION_CONFIG.clipboardClearMs
                );
            }
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    return (
        <div className="bg-background/50 border border-border/50 rounded-xl p-4 w-full">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-secondary uppercase tracking-widest">Generator</span>
                <button
                    type="button"
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-secondary hover:text-brand transition-colors p-1"
                >
                    <Settings2 className="w-4 h-4" />
                </button>
            </div>

            <div className="relative flex items-center mb-4">
                <div className="flex-1 bg-background border border-border rounded-lg px-4 py-3 font-mono text-lg tracking-wider text-foreground break-all text-center selection:bg-brand/20">
                    {password || "••••••••••••"}
                </div>
                <div className="absolute right-2 flex gap-1 items-center bg-background rounded-md px-1">
                    <button
                        type="button"
                        onClick={generatePassword}
                        className="p-2 text-secondary hover:text-brand transition-colors rounded-md focus:outline-none"
                        title="Regenerate"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={copyToClipboard}
                        className="p-2 text-secondary hover:text-success transition-colors rounded-md focus:outline-none"
                        title="Copy"
                    >
                        {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {showSettings && (
                <div className="space-y-4 pt-2 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                        <label className="text-sm text-secondary font-medium">Length: {length}</label>
                        <input
                            type="range"
                            min="8" max="64"
                            value={length}
                            onChange={(e) => setLength(parseInt(e.target.value))}
                            className="w-32 accent-brand"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'upper', label: 'A-Z', state: useUpper, set: setUseUpper },
                            { id: 'lower', label: 'a-z', state: useLower, set: setUseLower },
                            { id: 'nums', label: '0-9', state: useNumbers, set: setUseNumbers },
                            { id: 'syms', label: '!@#', state: useSymbols, set: setUseSymbols },
                        ].map((opt) => (
                            <label key={opt.id} className="flex items-center gap-2 text-sm text-secondary cursor-pointer hover:text-foreground transition-colors p-1">
                                <input
                                    type="checkbox"
                                    checked={opt.state}
                                    onChange={(e) => opt.set(e.target.checked)}
                                    className="rounded border-border bg-background focus:ring-brand accent-brand"
                                />
                                {opt.label}
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
