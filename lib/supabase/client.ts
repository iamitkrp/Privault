import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database' // Assumes we have generated types

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase credentials missing. Check your environment variables.');
    }

    return createBrowserClient<Database>(
        supabaseUrl || '',
        supabaseAnonKey || ''
    )
}
