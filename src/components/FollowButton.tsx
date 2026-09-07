'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '../lib/supabase/client'

export default function FollowButton({
  viewerId,
  profileId,
  initialFollowing,
}: {
  viewerId: string | null
  profileId: string
  initialFollowing: boolean
}) {
  const t = useTranslations('ProfilePage')
  const [following, setFollowing] = useState(initialFollowing)
  const [busy, setBusy] = useState(false)

  if (!viewerId || viewerId === profileId) return null

  async function toggle() {
    if (!viewerId || busy) return
    setBusy(true)
    const supabase = createClient()
    if (!supabase) {
      setBusy(false)
      return
    }
    const next = !following
    setFollowing(next)
    try {
      const { error } = next
        ? await supabase.from('follows').insert({ follower_id: viewerId, followed_id: profileId })
        : await supabase.from('follows').delete().eq('follower_id', viewerId).eq('followed_id', profileId)
      if (error) throw error
    } catch {
      setFollowing(!next)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={busy}
      aria-pressed={following}
      className={`rounded-full px-5 py-2 text-sm font-bold transition-colors disabled:opacity-50 ${
        following
          ? 'border-2 border-ink/15 bg-white text-ink hover:bg-base'
          : 'bg-primary text-primary-content shadow-md transition-transform hover:scale-105'
      }`}
    >
      {following ? t('following') : t('follow')}
    </button>
  )
}
