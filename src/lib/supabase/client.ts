import { createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * Supabase client for use in `'use client'` components. Backed by the
 * publishable ("anon") key and the browser's cookie store, so it carries the
 * signed-in user's session and every query runs under Row Level Security.
 */
export function createClient() {
  if (!url || !anonKey) {
    throw new Error('Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).')
  }
  return createBrowserClient(url, anonKey)
}
