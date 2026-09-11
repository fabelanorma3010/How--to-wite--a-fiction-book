import { createClient } from './supabase/server'

export interface FollowStats {
  followerCount: number
  followingCount: number
  isFollowedByViewer: boolean
}

/** Follower/following counts for a profile, plus whether the current viewer already follows them. */
export async function getFollowStats(profileId: string, viewerId: string | null): Promise<FollowStats> {
  const supabase = await createClient()
  if (!supabase) return { followerCount: 0, followingCount: 0, isFollowedByViewer: false }

  const [followerRes, followingRes] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('followed_id', profileId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profileId),
  ])

  let isFollowedByViewer = false
  if (viewerId) {
    const { data } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', viewerId)
      .eq('followed_id', profileId)
      .maybeSingle()
    isFollowedByViewer = Boolean(data)
  }

  return {
    followerCount: followerRes.count ?? 0,
    followingCount: followingRes.count ?? 0,
    isFollowedByViewer,
  }
}

export interface FollowedProfile {
  id: string
  username: string
  name: string
  avatarUrl: string | null
}

/**
 * Public-profile cards for everyone a member follows, newest-followed first.
 * Looked up via public_profile_cards (not public.users directly — its RLS
 * only lets you select your own row) so this can only ever surface someone
 * who has also turned their own profile public; anyone followed who hasn't
 * is silently skipped, same as visiting their /u/<username> would 404.
 */
export async function getFollowing(userId: string): Promise<FollowedProfile[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data: rows } = await supabase
    .from('follows')
    .select('followed_id')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })

  const ids = (rows ?? []).map((row) => row.followed_id as string)
  if (ids.length === 0) return []

  const { data: profiles } = await supabase
    .from('public_profile_cards')
    .select('id, username, name, avatar_url')
    .in('id', ids)

  const byId = new Map((profiles ?? []).map((p) => [p.id as string, p]))
  return ids
    .map((id) => byId.get(id))
    .filter((p): p is { id: string; username: string; name: string; avatar_url: string | null } => Boolean(p))
    .map((p) => ({ id: p.id, username: p.username, name: p.name, avatarUrl: p.avatar_url }))
}
