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
