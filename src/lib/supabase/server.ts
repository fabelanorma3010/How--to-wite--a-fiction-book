import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * Supabase client for route handlers, server components and server actions.
 * Reads/writes the session cookie via `next/headers`, so queries run as the
 * signed-in user under Row Level Security. Returns null when Supabase env vars
 * are missing so callers (and the build) degrade instead of throwing.
 */
export async function createClient(): Promise<SupabaseClient | null> {
  if (!url || !anonKey) return null

  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Called from a Server Component — the middleware refreshes the session instead.
        }
      },
    },
  })
}
