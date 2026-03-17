"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    Settings, 
    LogOut,
    Lock,
    Hexagon,
    Activity,
    Server,
    Database,
    Network
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";

// ─── Data ──────────────────────────────────────────────────────────────────

const MAIN_NAV = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Global Settings", href: "/settings", icon: Settings },
];

// ─── Components ─────────────────────────────────────────────────────────────

export function DashboardSidebar() {
    const pathname = usePathname();
    const { signOut } = useAuth();
    
    return (
        <aside className="w-[280px] h-full flex flex-col bg-background border-r border-border z-40 relative">
            
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

            {/* ─── Header: Branding ─── */}
            <div className="h-20 flex items-center px-6 border-b border-border relative z-10 bg-background/80 backdrop-blur-md">
                 <Link href="/dashboard" className="flex items-center gap-3 font-semibold group w-full">
                      <div className="relative">
                          <Hexagon className="w-6 h-6 text-foreground group-hover:text-success transition-colors duration-300 relative z-10" />
                          <div className="absolute inset-0 bg-success/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <span className="mono text-sm tracking-widest text-foreground group-hover:text-success transition-colors duration-300">
                           PRIVAULT.
                      </span>
                 </Link>
            </div>

            {/* ─── Navigation Area ─── */}
            <div className="flex-1 overflow-y-auto px-4 py-8 relative z-10 scrollbar-hide flex flex-col gap-8">
                
                {/* System Diagnostics Section */}
                <div>
                     <div className="mono text-[10px] tracking-widest text-fg-secondary mb-4 px-3 flex items-center gap-2">
                         <Activity className="w-3 h-3 text-emerald-500" />
                         SYSTEM_LINKS
                     </div>
                     <nav className="flex flex-col gap-1">
                         {MAIN_NAV.map((item) => {
                             const isActive = pathname === item.href;
                             return (
                                 <Link 
                                     key={item.href} 
                                     href={item.href}
                                     className={`group flex items-center gap-4 px-3 py-3 border border-transparent transition-all duration-300
                                         ${isActive 
                                             ? 'bg-bg-tertiary border-border text-foreground' 
                                             : 'text-fg-secondary hover:text-foreground hover:bg-bg-secondary hover:border-border-secondary'}
                                     `}
                                 >
                                      <div className={`transition-colors duration-300 ${isActive ? 'text-success' : 'text-fg-secondary group-hover:text-fg-muted'}`}>
                                          <item.icon className="w-5 h-5" strokeWidth={1.5} />
                                      </div>
                                      
                                      <span className="mono text-xs uppercase tracking-widest flex-1">
                                          {item.name}
                                      </span>

                                      {isActive && (
                                          <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_var(--color-success)] animate-pulse" />
                                      )}
                                 </Link>
                             );
                         })}
                     </nav>
                </div>

                {/* Secure Environment Details */}
                <div className="mt-auto">
                     <div className="mono text-[10px] tracking-widest text-fg-secondary mb-4 px-3 border-t border-border pt-6 flex items-center gap-2">
                         <Lock className="w-3 h-3 text-violet-500" />
                         SECURE_ENV
                     </div>
                     
                     {/* Pseudo-telemetry for aesthetic */}
                     <div className="flex flex-col gap-3 px-3">
                          <div className="flex items-center justify-between mono text-[10px] text-fg-secondary uppercase tracking-widest p-2 bg-bg-secondary border border-border">
                              <span className="flex items-center gap-2"><Server className="w-3 h-3" /> Node</span>
                              <span className="text-emerald-500">EU-WEST-LOCAL</span>
                          </div>
                          <div className="flex items-center justify-between mono text-[10px] text-fg-secondary uppercase tracking-widest p-2 bg-bg-secondary border border-border">
                              <span className="flex items-center gap-2"><Database className="w-3 h-3" /> Sync</span>
                              <span className="text-fg-muted">STANDBY</span>
                          </div>
                          <div className="flex items-center justify-between mono text-[10px] text-fg-secondary uppercase tracking-widest p-2 bg-bg-secondary border border-border">
                              <span className="flex items-center gap-2"><Network className="w-3 h-3" /> Uplink</span>
                              <span className="text-success">ENCRYPTED</span>
                          </div>
                     </div>
                </div>

            </div>

            {/* ─── Footer Action ─── */}
            <div className="p-4 border-t border-border bg-bg-secondary relative z-10">
                <button 
                    onClick={signOut}
                    className="w-full flex items-center justify-center gap-3 py-3 border border-border-secondary text-fg-muted hover:text-success hover:border-success hover:bg-success/10 transition-all duration-300 group"
                >
                    <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="mono text-[11px] font-bold tracking-[0.2em] uppercase">Terminate Session</span>
                </button>
            </div>
            
        </aside>
    );
}

export default DashboardSidebar;
