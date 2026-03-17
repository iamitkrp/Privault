"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    Settings, 
    LogOut,
    Hexagon
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


            {/* ─── Header: Branding ─── */}
            <div className="h-20 flex items-center px-6 border-b border-border bg-background">
                 <Link href="/dashboard" className="flex items-center gap-3 font-semibold group w-full">
                      <Hexagon className="w-6 h-6 text-foreground group-hover:text-success transition-colors duration-300" />
                      <span className="mono text-sm tracking-widest text-foreground group-hover:text-success transition-colors duration-300">
                           PRIVAULT.
                      </span>
                 </Link>
            </div>

            {/* ─── Navigation Area ─── */}
            <div className="flex-1 overflow-y-auto px-4 py-8 scrollbar-hide flex flex-col gap-8">
                
                {/* Navigation */}
                <div>
                     <div className="mono text-[10px] tracking-widest text-fg-secondary mb-4 px-3">
                         NAVIGATION
                     </div>
                     <nav className="flex flex-col gap-1">
                         {MAIN_NAV.map((item) => {
                             const isActive = pathname === item.href;
                             return (
                                 <Link 
                                     key={item.href} 
                                     href={item.href}
                                     className={`group flex items-center gap-4 px-3 py-3 border border-transparent transition-colors duration-200
                                         ${isActive 
                                             ? 'bg-bg-tertiary border-border text-foreground' 
                                             : 'text-fg-secondary hover:text-foreground hover:bg-bg-secondary hover:border-border-secondary'}
                                     `}
                                 >
                                      <div className={`transition-colors duration-200 ${isActive ? 'text-success' : 'text-fg-secondary group-hover:text-fg-muted'}`}>
                                          <item.icon className="w-5 h-5" strokeWidth={1.5} />
                                      </div>
                                      
                                      <span className="mono text-xs uppercase tracking-widest flex-1">
                                          {item.name}
                                      </span>

                                     {isActive && (
                                         <div className="w-1.5 h-1.5 rounded-full bg-success" />
                                     )}
                                 </Link>
                             );
                         })}
                     </nav>
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
