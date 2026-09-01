import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// This app has its own session auth (see lib/auth.ts), so the Supabase client
// never needs to persist or refresh a GoTrue session.
const options = {
  auth: { persistSession: false, autoRefreshToken: false },
} as const

export const isSupabaseConfigured = Boolean(url && anonKey)

let anonClient: SupabaseClient | null = null

/**
 * Supabase client keyed with the publishable ("anon") key. Safe in the browser
 * and in server code; every query is subject to Row Level Security. Returns
 * null when Supabase env vars are missing so callers can degrade gracefully.
 */
export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null
  anonClient ??= createClient(url, anonKey, options)
  return anonClient
}

/**
 * Supabase client keyed with the secret ("service_role") key. SERVER ONLY —
 * it bypasses Row Level Security. Never import this from a client component.
 * Returns null when SUPABASE_SERVICE_ROLE_KEY is not set.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceRoleKey) return null
  return createClient(url, serviceRoleKey, options)
}
