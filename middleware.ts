import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware that generates a per-request nonce for Content-Security-Policy.
 * This replaces the blanket 'unsafe-inline' with a cryptographically random
 * nonce, ensuring only trusted inline scripts/styles from Next.js execute.
 */
export function middleware(request: NextRequest) {
    // Generate a cryptographic nonce for this request
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

    // Derive Supabase origin for connect-src
    const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

    // Build nonce-based CSP — 'strict-dynamic' allows Next.js-injected scripts
    // that carry the nonce to load additional trusted scripts.
    const cspDirectives = [
        `default-src 'self'`,
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
        `style-src 'self' 'nonce-${nonce}'`,
        `img-src 'self' data: blob:`,
        `font-src 'self'`,
        `connect-src 'self' ${supabaseOrigin}`.trim(),
        `frame-src 'none'`,
        `object-src 'none'`,
        `base-uri 'self'`,
        `form-action 'self'`,
    ];

    const cspHeaderValue = cspDirectives.join('; ');

    // Clone request headers and attach the nonce so the root layout can read it
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    // Set security headers on the response
    response.headers.set('Content-Security-Policy', cspHeaderValue);
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        {
            source: '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
    ],
};
