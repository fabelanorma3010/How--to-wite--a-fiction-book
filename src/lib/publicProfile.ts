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

/** Same as getPublicProfile, but looked up by user id instead of username. */
export async function getPublicProfileById(id: string): Promise<PublicProfile | null> {
  const supabase = await createClient()
  if (!supabase) return null

  const { data } = await supabase
    .from('public_profile_cards')
    .select(
      'id, username, name, first_name, last_name, avatar_url, bio, website_url, instagram_url, tiktok_url, youtube_url, twitter_url, created_at',
    )
    .eq('id', id)
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

export interface PublicProfileCard {
  id: string
  username: string
  name: string
  avatarUrl: string | null
  bio: string
}

/**
 * Newest public profiles for the /creators gallery. Only returns rows that have
 * *some* content (a bio or an avatar) — every signup is public by default, so
 * this keeps blank auto-generated profiles out of the directory.
 */
export async function listPublicProfiles(limit = 60): Promise<PublicProfileCard[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('public_profile_cards')
    .select('id, username, name, avatar_url, bio')
    .order('created_at', { ascending: false })
    .limit(limit * 3)

  return (data ?? [])
    .map((row) => ({
      id: row.id as string,
      username: row.username as string,
      name: row.name as string,
      avatarUrl: (row.avatar_url as string | null) ?? null,
      bio: ((row.bio as string | null) ?? '').trim(),
    }))
    .filter((p) => p.bio || p.avatarUrl)
    .slice(0, limit)
}
