"use client";



export function ArchitectureSVG() {
    return (
        <div className="w-full h-full relative z-20 flex items-center justify-center p-2 xl:p-0 my-16">
            <svg
                viewBox="0 0 800 400"
                className="w-full h-full svg-shadow relative z-10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* DEFINITIONS for gradients and markers */}
                <defs>
                    <linearGradient id="cyber-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00ffcc" stopOpacity="0" />
                        <stop offset="50%" stopColor="#00ffcc" stopOpacity="1" />
                        <stop offset="100%" stopColor="#00ffcc" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="cyber-glow-red" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff4500" stopOpacity="0" />
                        <stop offset="50%" stopColor="#ff4500" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ff4500" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* CONNECTION LINES (Edges) */}
                <g stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="6 6">
                    <path d="M 300 150 L 500 150" />
                    <path d="M 500 250 L 300 250" />
                </g>

                {/* DATA DOTS ANIMATIONS */}
                <g>
                    {/* Client to Server */}
                    <circle r="4" fill="#00ffcc" opacity="0.9">
                        <animateMotion dur="3s" repeatCount="indefinite">
                            <mpath href="#clientToServer" />
                        </animateMotion>
                    </circle>
                    
                    {/* Server to Client */}
                    <circle r="4" fill="#ff4500" opacity="0.9">
                        <animateMotion dur="3s" repeatCount="indefinite">
                            <mpath href="#serverToClient" />
                        </animateMotion>
                    </circle>

                    {/* Invisible paths for motion tracking */}
                    <path id="clientToServer" d="M 300 150 L 500 150" />
                    <path id="serverToClient" d="M 500 250 L 300 250" />
                </g>

                {/* CONNECTION LABELS */}
                <g fontFamily="monospace" fontSize="11" fill="#aaaaaa" letterSpacing="1" textAnchor="middle">
                    <text x="400" y="140">ENCRYPTED PAYLOAD /// [CIPHERTEXT]</text>
                    <text x="400" y="270">ZERO KNOWLEDGE GET /// [VAULT SYNC]</text>
                </g>

                {/* --- PIPELINE NODES (BOXES) --- */}

                {/* THE CLIENT CONTAINER */}
                <g transform="translate(40, 50)">
                    <rect width="260" height="300" rx="6" className="fill-bg-secondary" stroke="#00ffcc" strokeWidth="2" opacity="0.9" />
                    <rect x="0" y="0" width="260" height="40" rx="6" className="fill-bg-tertiary" />
                    <line x1="0" y1="40" x2="260" y2="40" stroke="#00ffcc" strokeWidth="1" />
                    <text x="20" y="25" className="fill-foreground font-sans text-xl font-bold">Client / Browser</text>
                    
                    {/* Inner components of Client */}
                    <rect x="20" y="60" width="220" height="60" rx="4" className="fill-background" stroke="var(--color-border)" strokeWidth="1" />
                    <text x="35" y="85" className="fill-foreground font-sans text-sm font-bold">Cryptographic Engine</text>
                    <text x="35" y="105" className="fill-fg-secondary" fontFamily="monospace" fontSize="10">WebCrypto API (AES-GCM)</text>

                    <rect x="20" y="140" width="220" height="60" rx="4" className="fill-background" stroke="var(--color-border)" strokeWidth="1" />
                    <text x="35" y="165" className="fill-foreground font-sans text-sm font-bold">Local Active Memory</text>
                    <text x="35" y="185" className="fill-fg-secondary" fontFamily="monospace" fontSize="10">Raw Data + Master Key</text>

                    <rect x="20" y="220" width="220" height="60" rx="4" className="fill-background" stroke="var(--color-border)" strokeWidth="1" />
                    <text x="35" y="245" className="fill-foreground font-sans text-sm font-bold">State Management</text>
                    <text x="35" y="265" className="fill-fg-secondary" fontFamily="monospace" fontSize="10">Zustand / React Context</text>

                    {/* Flashing light indicator */}
                    <circle cx="230" cy="20" r="4" fill="#00ffcc">
                        <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
                    </circle>
                </g>

                {/* THE SERVER CONTAINER */}
                <g transform="translate(500, 50)">
                    <rect width="260" height="300" rx="6" className="fill-bg-secondary" stroke="#ff4500" strokeWidth="2" opacity="0.9" />
                    <rect x="0" y="0" width="260" height="40" rx="6" className="fill-bg-tertiary" />
                    <line x1="0" y1="40" x2="260" y2="40" stroke="#ff4500" strokeWidth="1" />
                    <text x="20" y="25" className="fill-foreground font-sans text-xl font-bold">Cloud Server</text>

                    {/* Innter components of Server */}
                    <rect x="20" y="70" width="220" height="70" rx="4" className="fill-background" stroke="var(--color-border)" strokeWidth="1" />
                    <text x="35" y="95" className="fill-foreground font-sans text-sm font-bold">Vault API</text>
                    <text x="35" y="115" className="fill-fg-secondary" fontFamily="monospace" fontSize="10">Endpoint handlers</text>
                    <text x="35" y="130" className="fill-amber-500" fontFamily="monospace" fontSize="9">BLIND TO CONTENT</text>

                    <rect x="20" y="180" width="220" height="90" rx="4" className="fill-background" stroke="var(--color-border)" strokeWidth="1" />
                    <text x="35" y="205" className="fill-foreground font-sans text-sm font-bold">Encrypted Database</text>
                    <text x="35" y="225" className="fill-fg-secondary" fontFamily="monospace" fontSize="10">Supabase / Postgres</text>
                    <text x="35" y="245" className="fill-fg-muted" fontFamily="monospace" fontSize="9">Stores Ciphertext & Tags</text>

                    {/* Flashing light indicator */}
                    <circle cx="230" cy="20" r="4" fill="#ff4500">
                        <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
                    </circle>
                </g>

                {/* Decorative Elements */}
            </svg>
        </div>
    );
}
