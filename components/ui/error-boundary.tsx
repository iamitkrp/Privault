"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error boundary component that catches unhandled errors in the component tree
 * and displays a friendly fallback UI instead of a white screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-6">
                        <AlertTriangle className="w-8 h-8 text-error" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
                    <p className="text-secondary text-sm mb-6 max-w-md">
                        An unexpected error occurred. Your data is safe — try refreshing the page.
                    </p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand text-brand-foreground font-medium hover:bg-brand-hover transition-colors text-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reload Page
                    </button>
                    {process.env.NODE_ENV === "development" && this.state.error && (
                        <pre className="mt-6 p-4 rounded-lg bg-background/50 border border-border text-xs text-error text-left max-w-lg overflow-auto max-h-40">
                            {this.state.error.message}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
