"use client";



export function DataModelSVG() {
    return (
        <div className="w-full h-full relative z-20 flex items-center justify-center p-2 xl:p-0 my-16">
            <svg
                viewBox="0 0 800 400"
                className="w-full h-full relative z-10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Connection lines indicating the payload tree structure */}
                <path d="M 250 200 L 350 100" stroke="#333" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 250 200 L 350 200" stroke="#333" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 250 200 L 350 300" stroke="#333" strokeWidth="2" strokeDasharray="4 4" />

                {/* Animated payloads */}
                <circle r="3" fill="#00ffcc" opacity="0.8">
                    <animateMotion dur="2.5s" repeatCount="indefinite" path="M 250 200 L 350 100" />
                </circle>
                <circle r="3" fill="#ff4500" opacity="0.8">
                    <animateMotion dur="2.5s" repeatCount="indefinite" path="M 250 200 L 350 200" />
                </circle>
                <circle r="3" fill="#a855f7" opacity="0.8">
                    <animateMotion dur="2.5s" repeatCount="indefinite" path="M 250 200 L 350 300" />
                </circle>

                {/* --- ROOT CONTAINER --- */}
                <g transform="translate(50, 150)">
                    <rect width="200" height="100" rx="6" className="fill-bg-secondary" stroke="var(--color-border)" strokeWidth="2" />
                    <text x="20" y="30" className="fill-foreground font-sans text-xl font-bold">Encrypted Vault</text>
                    <text x="20" y="55" className="fill-fg-secondary" fontFamily="monospace" fontSize="10">BLOB RECORD (SERVER)</text>
                    <rect x="20" y="70" width="160" height="15" rx="2" fill="#222" />
                    <text x="25" y="80" fill="#00ffcc" fontFamily="monospace" fontSize="8" letterSpacing="2">A8F3...44901B</text>
                </g>

                {/* --- DECRYPTED TREE NODES --- */}

                {/* Node 1: Passwords */}
                <g transform="translate(350, 50)">
                    <rect width="220" height="80" rx="6" className="fill-background" stroke="#00ffcc" strokeWidth="1.5" />
                    <rect x="0" y="0" width="4" height="80" rx="2" fill="#00ffcc" />
                    <text x="20" y="30" className="fill-foreground font-sans text-lg font-bold">Passwords[]</text>
                    <text x="20" y="50" className="fill-fg-secondary" fontFamily="monospace" fontSize="9">- url, username</text>
                    <text x="20" y="65" className="fill-fg-muted" fontFamily="monospace" fontSize="9">- cipher_password</text>
                </g>

                {/* Node 2: Secure Notes */}
                <g transform="translate(350, 160)">
                    <rect width="220" height="80" rx="6" className="fill-background" stroke="#ff4500" strokeWidth="1.5" />
                    <rect x="0" y="0" width="4" height="80" rx="2" fill="#ff4500" />
                    <text x="20" y="30" className="fill-foreground font-sans text-lg font-bold">Notes[]</text>
                    <text x="20" y="50" className="fill-fg-secondary" fontFamily="monospace" fontSize="9">- title, tags</text>
                    <text x="20" y="65" className="fill-fg-muted" fontFamily="monospace" fontSize="9">- cipher_content</text>
                </g>

                {/* Node 3: Metadata */}
                <g transform="translate(350, 270)">
                    <rect width="220" height="80" rx="6" className="fill-background" stroke="#a855f7" strokeWidth="1.5" />
                    <rect x="0" y="0" width="4" height="80" rx="2" fill="#a855f7" />
                    <text x="20" y="30" className="fill-foreground font-sans text-lg font-bold">Metadata / Config</text>
                    <text x="20" y="50" className="fill-fg-secondary" fontFamily="monospace" fontSize="9">- user_preferences</text>
                    <text x="20" y="65" className="fill-fg-muted" fontFamily="monospace" fontSize="9">- vault_version: v1.0.0</text>
                </g>

                {/* Decorative Elements */}



            </svg>
        </div>
    );
}
