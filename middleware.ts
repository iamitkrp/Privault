import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware that applies security headers to every HTML response.
 *
 * Why no nonce-based CSP?
 * ──────────────────────
 * Next.js 16 deprecated `middleware` in favour of `proxy`, and the framework
 * no longer reliably injects per-request nonces into its own <script> tags
 * when using the legacy middleware path.  React 19 + Framer Motion also
 * inject countless inline `style` attributes that cannot carry a nonce.
 *
 * Rather than ship a broken nonce that silently blocks client JS (causing a
 * blank page in production), we use a pragmatic CSP that allows inline
 * scripts/styles while still locking down every other vector.  The remaining
 * security headers (HSTS, X-Frame-Options, Permissions-Policy, etc.) are
 * unaffected and continue to provide strong protection.
 */
export function middleware(_request: NextRequest) {
    // Derive Supabase origin for connect-src
    const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

    const cspDirectives = [
        `default-src 'self'`,
        `script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:`,
        `style-src 'self' 'unsafe-inline'`,
        `img-src 'self' data: blob: https://*.spline.design`,
        `font-src 'self' https://fonts.gstatic.com`,
        `connect-src 'self' ${supabaseOrigin} https://prod.spline.design https://*.spline.design`.trim(),
        `worker-src 'self' blob:`,
        `frame-src https://my.spline.design`,
        `object-src 'none'`,
        `base-uri 'self'`,
        `form-action 'self'`,
    ];

    const cspHeaderValue = cspDirectives.join('; ');

    const response = NextResponse.next();

    // Set security headers on the response
    response.headers.set('Content-Security-Policy', cspHeaderValue);
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), clipboard-write=(self), payment=(), usb=(), bluetooth=(), display-capture=(), fullscreen=(self)');

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
