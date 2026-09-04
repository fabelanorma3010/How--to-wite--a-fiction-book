import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

let browserClient: SupabaseClient | null = null

/**
 * Supabase client for use in `'use client'` components. Backed by the
 * publishable ("anon") key and the browser's cookie store, so it carries the
 * signed-in user's session and every query runs under Row Level Security.
 * Returns null when Supabase env vars are missing.
 */
export function createClient(): SupabaseClient | null {
  if (!url || !anonKey) return null
  browserClient ??= createBrowserClient(url, anonKey)
  return browserClient
}
