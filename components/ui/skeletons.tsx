/**
 * Loading skeleton components for various UI sections.
 * Uses the `.skeleton` CSS class from globals.css for the shimmer effect.
 */

export function CredentialCardSkeleton() {
    return (
        <div className="glass p-5 rounded-xl border border-border/50 flex flex-col justify-between h-full animate-in fade-in duration-300">
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg skeleton" />
                    <div className="flex-1">
                        <div className="h-4 w-28 skeleton mb-1.5" />
                        <div className="h-3 w-16 skeleton" />
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-3 w-full skeleton" />
                    <div className="h-3 w-3/4 skeleton" />
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 flex justify-between">
                <div className="h-3 w-24 skeleton" />
                <div className="h-3 w-3 skeleton rounded-full" />
            </div>
        </div>
    );
}

export function CredentialListSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <CredentialCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function VaultHealthSkeleton() {
    return (
        <div className="glass rounded-xl border border-border/50 p-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg skeleton" />
                <div>
                    <div className="h-5 w-32 skeleton mb-1" />
                    <div className="h-3 w-48 skeleton" />
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-background/40 border border-border/50 p-3 rounded-lg">
                        <div className="h-3 w-12 skeleton mb-2" />
                        <div className="h-6 w-8 skeleton" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SettingsSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass rounded-xl border border-border/50 overflow-hidden">
                    <div className="p-6 border-b border-border/30 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg skeleton" />
                        <div>
                            <div className="h-5 w-40 skeleton mb-1" />
                            <div className="h-3 w-56 skeleton" />
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="h-10 w-full skeleton mb-3" />
                        <div className="h-10 w-full skeleton" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function PageSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            <div>
                <div className="h-7 w-48 skeleton mb-2" />
                <div className="h-4 w-72 skeleton" />
            </div>
            <CredentialListSkeleton />
        </div>
    );
}
