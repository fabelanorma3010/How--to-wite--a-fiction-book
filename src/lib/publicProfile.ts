import { createClient } from './supabase/server'

export interface PublicProfile {
  id: string
  username: string
  name: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  bio: string
  websiteUrl: string
  instagramUrl: string
  tiktokUrl: string
  youtubeUrl: string
  twitterUrl: string
  createdAt: string
}

/**
 * Looks up a profile by its /u/<username> slug via public.public_profile_cards
 * — a view that only exposes public-safe columns, and only for rows the owner
 * has marked public. Works signed-out (the view grants select to anon).
 * Returns null if the username doesn't exist or the profile is private.
 */
export async function getPublicProfile(username: string): Promise<PublicProfile | null> {
  const supabase = await createClient()
  if (!supabase) return null

  const { data } = await supabase
    .from('public_profile_cards')
    .select(
      'id, username, name, first_name, last_name, avatar_url, bio, website_url, instagram_url, tiktok_url, youtube_url, twitter_url, created_at',
    )
    .ilike('username', username)
    .maybeSingle()

  if (!data) return null

  return {
    id: data.id,
    username: data.username,
    name: data.name,
    firstName: data.first_name ?? '',
    lastName: data.last_name ?? '',
    avatarUrl: data.avatar_url,
    bio: data.bio ?? '',
    websiteUrl: data.website_url ?? '',
    instagramUrl: data.instagram_url ?? '',
    tiktokUrl: data.tiktok_url ?? '',
    youtubeUrl: data.youtube_url ?? '',
    twitterUrl: data.twitter_url ?? '',
    createdAt: data.created_at,
  }
}
