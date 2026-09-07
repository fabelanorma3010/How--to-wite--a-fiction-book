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
  const [error, setError] = useState('')

  if (!viewerId || viewerId === profileId) return null

  async function toggle() {
    if (!viewerId || busy) return
    setBusy(true)
    setError('')
    const supabase = createClient()
    if (!supabase) {
      setError(t('followUnavailable'))
      setBusy(false)
      return
    }
    const next = !following
    setFollowing(next)
    try {
      const { error: dbError } = next
        ? await supabase.from('follows').insert({ follower_id: viewerId, followed_id: profileId })
        : await supabase.from('follows').delete().eq('follower_id', viewerId).eq('followed_id', profileId)
      if (dbError) throw dbError
    } catch (err) {
      setFollowing(!next)
      setError(err instanceof Error ? err.message : t('followGenericError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
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
      {error && (
        <p role="alert" className="max-w-xs text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
