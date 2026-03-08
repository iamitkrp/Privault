"use client";

import { useEffect, useState, useCallback } from "react";
import { passphraseManager } from "@/lib/crypto/passphrase";
import { SESSION_CONFIG } from "@/constants";
import { Clock, X } from "lucide-react";

/**
 * SessionMonitor — provides a global warning banner when the vault is about
 * to auto-lock due to inactivity, and tracks session state.
 *
 * The actual auto-lock logic lives in PassphraseManager. This component
 * monitors the remaining time and shows a 2-minute warning banner.
 */
export function SessionMonitor() {
    const [showWarning, setShowWarning] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [isLocked, setIsLocked] = useState(!passphraseManager.isUnlocked());

    // Subscribe to lock/unlock events
    useEffect(() => {
        const unsubscribe = passphraseManager.subscribe((locked: boolean) => {
            setIsLocked(locked);
            if (locked) {
                setShowWarning(false);
            }
        });
        return unsubscribe;
    }, []);

    // Countdown timer for the warning
    useEffect(() => {
        if (isLocked) return;

        let lastActivity = Date.now();

        const resetLastActivity = () => {
            lastActivity = Date.now();
            setShowWarning(false);
        };

        // Listen to user activity
        SESSION_CONFIG.activityEvents.forEach(event => {
            window.addEventListener(event, resetLastActivity, { passive: true });
        });

        const interval = setInterval(() => {
            const elapsed = Date.now() - lastActivity;
            const remaining = SESSION_CONFIG.timeoutMs - elapsed;
            const remainingSec = Math.max(0, Math.ceil(remaining / 1000));

            setSecondsLeft(remainingSec);

            // Show warning when less than 2 minutes remain
            if (remaining <= SESSION_CONFIG.warningBeforeTimeoutMs && remaining > 0) {
                setShowWarning(true);
            } else {
                setShowWarning(false);
            }
        }, 1000);

        return () => {
            clearInterval(interval);
            SESSION_CONFIG.activityEvents.forEach(event => {
                window.removeEventListener(event, resetLastActivity);
            });
        };
    }, [isLocked]);

    const handleExtend = useCallback(() => {
        // Any activity resets the timer via PassphraseManager,
        // so we just dispatch a synthetic event
        passphraseManager.resetAutoLockTimer();
        setShowWarning(false);
    }, []);

    if (!showWarning || isLocked) return null;

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-warning/10 border border-warning/30 backdrop-blur-lg shadow-lg">
                <Clock className="w-5 h-5 text-warning flex-shrink-0 animate-pulse" />
                <div className="text-sm">
                    <span className="text-warning font-medium">Session expiring in </span>
                    <span className="text-warning font-bold tabular-nums">
                        {minutes}:{seconds.toString().padStart(2, '0')}
                    </span>
                </div>
                <button
                    onClick={handleExtend}
                    className="ml-2 px-3 py-1 rounded-lg text-xs font-semibold bg-warning text-black hover:bg-warning/90 transition-colors"
                >
                    Extend
                </button>
                <button
                    onClick={() => setShowWarning(false)}
                    className="p-1 text-warning/60 hover:text-warning transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
