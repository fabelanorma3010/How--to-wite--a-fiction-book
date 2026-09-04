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
  /** URL slug for the public profile at /u/<username>. Null until assigned. */
  username: string | null
  bio: string
  websiteUrl: string
  instagramUrl: string
  tiktokUrl: string
  youtubeUrl: string
  twitterUrl: string
  /** Whether /u/<username> is visible to others. */
  isPublic: boolean
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
    .select(
      'first_name, last_name, name, email, avatar_url, role, username, bio, website_url, instagram_url, tiktok_url, youtube_url, twitter_url, is_public',
    )
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
    username: typeof profile?.username === 'string' ? profile.username : null,
    bio: pick(profile?.bio),
    websiteUrl: pick(profile?.website_url),
    instagramUrl: pick(profile?.instagram_url),
    tiktokUrl: pick(profile?.tiktok_url),
    youtubeUrl: pick(profile?.youtube_url),
    twitterUrl: pick(profile?.twitter_url),
    isPublic: profile?.is_public !== false,
  }
}
