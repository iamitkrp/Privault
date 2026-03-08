import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Validates that a redirect path is safe (same-origin, relative path only).
 * Prevents open redirect attacks via the `next` query parameter.
 */
function isSafeRedirect(path: string): boolean {
    // Must be non-empty and start with exactly one /
    if (!path || !path.startsWith('/')) return false;
    // Block protocol-relative URLs (//evil.com)
    if (path.includes('//')) return false;
    // Block scheme prefixes anywhere in the path (javascript:, data:, https:, etc.)
    // Check the content after the leading slash for a colon before the next slash
    const afterLeadingSlash = path.slice(1);
    const nextSlash = afterLeadingSlash.indexOf('/');
    const firstSegment = nextSlash === -1 ? afterLeadingSlash : afterLeadingSlash.slice(0, nextSlash);
    if (firstSegment.includes(':')) return false;
    return true;
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // Validate the redirect target to prevent open redirect attacks
    const rawNext = searchParams.get('next') ?? '/vault'
    const next = isSafeRedirect(rawNext) ? rawNext : '/vault'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
