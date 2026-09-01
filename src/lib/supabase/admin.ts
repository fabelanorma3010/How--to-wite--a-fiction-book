import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Supabase client keyed with the secret ("service_role") key. SERVER ONLY —
 * it bypasses Row Level Security and carries no user session. Use it for
 * privileged work like billing webhooks. Never import this from a client
 * component. Returns null when SUPABASE_SERVICE_ROLE_KEY is not set.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceRoleKey) return null
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
