import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from './supabase/server'
import { getSupabaseAdmin } from './supabase/admin'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && ADMIN_EMAILS.includes(email.toLowerCase()))
}

/**
 * Confirms the caller is a signed-in admin, from a Server Component / Action /
 * route handler. The /admin middleware already enforces this, but Server Actions
 * re-check here as defence in depth. Throws when not an admin.
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) throw new Error('Unauthorized.')
  return user
}

/** requireAdmin() plus a ready service-role client (bypasses RLS). Throws otherwise. */
export async function adminClient(): Promise<SupabaseClient> {
  await requireAdmin()
  const supabase = getSupabaseAdmin()
  if (!supabase) throw new Error('Supabase is not configured (SUPABASE_SERVICE_ROLE_KEY).')
  return supabase
}
