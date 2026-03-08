"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = "info", duration: number = 4000) => {
        const id = crypto.randomUUID();
        setToasts(prev => [...prev, { id, type, message, duration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
                {toasts.map(t => (
                    <ToastItem key={t.id} toast={t} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    const configs = {
        success: { icon: CheckCircle, bg: "bg-success/10 border-success/30", text: "text-success" },
        error: { icon: AlertCircle, bg: "bg-error/10 border-error/30", text: "text-error" },
        warning: { icon: AlertTriangle, bg: "bg-warning/10 border-warning/30", text: "text-warning" },
        info: { icon: Info, bg: "bg-info/10 border-info/30", text: "text-info" },
    };

    const config = configs[toast.type];
    const Icon = config.icon;

    return (
        <div
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-lg shadow-lg animate-in slide-in-from-right-5 fade-in duration-300 ${config.bg}`}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.text}`} />
            <p className="text-sm text-foreground flex-1">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="p-0.5 text-secondary/50 hover:text-foreground transition-colors flex-shrink-0"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
