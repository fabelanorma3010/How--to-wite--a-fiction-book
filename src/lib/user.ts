import { createClient } from './supabase/server'
import { isAdminEmail } from './admin'

export interface CurrentUser {
  id: string
  email: string
  firstName: string
  lastName: string
  /** Display name — `first last` when we have both, otherwise a provider value. */
  name: string
  avatarUrl: string | null
  isAdmin: boolean
  /** True when the account has an email/password identity (vs. Google-only). */
  hasPassword: boolean
}

function pick(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

/**
 * The signed-in user's profile for Server Components / Actions / route handlers:
 * `auth.getUser()` joined with their `public.users` row, with auth
 * `user_metadata` as a fallback for the brief window before the
 * `handle_new_user` trigger has committed. Returns null when signed out or when
 * Supabase is not configured.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient()
  if (!supabase) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('first_name, last_name, name, email, avatar_url, role')
    .eq('id', user.id)
    .maybeSingle()

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const email = user.email ?? (typeof profile?.email === 'string' ? profile.email : '')
  const firstName = pick(profile?.first_name, meta.first_name, meta.given_name)
  const lastName = pick(profile?.last_name, meta.last_name, meta.family_name)

  return {
    id: user.id,
    email,
    firstName,
    lastName,
    name:
      pick(profile?.name, meta.name, meta.full_name, [firstName, lastName].filter(Boolean).join(' ')) ||
      email.split('@')[0] ||
      'Member',
    avatarUrl: pick(profile?.avatar_url, meta.avatar_url, meta.picture) || null,
    isAdmin: isAdminEmail(user.email) || profile?.role === 'admin',
    hasPassword: (user.identities ?? []).some((identity) => identity.provider === 'email'),
  }
}
