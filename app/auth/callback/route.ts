import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    try {
      // Create server-side Supabase client
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error) {
        // Successful verification - redirect to vault
        return NextResponse.redirect(new URL('/vault', request.url));
      }
      
      console.error('Email verification error:', error);
    } catch (err) {
      console.error('Auth callback error:', err);
    }
  }

  // If there's an error or no code, redirect to login with error
  return NextResponse.redirect(new URL('/login?error=verification-failed', request.url));
} 