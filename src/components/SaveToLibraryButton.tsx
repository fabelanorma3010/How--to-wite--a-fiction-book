'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase/client'

export default function SaveToLibraryButton({
  viewerId,
  bookId,
  initialSaved,
}: {
  viewerId: string | null
  bookId: string
  initialSaved: boolean
}) {
  const [saved, setSaved] = useState(initialSaved)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!viewerId) return null

  async function toggle() {
    if (!viewerId || busy) return
    setBusy(true)
    setError('')
    const supabase = createClient()
    if (!supabase) {
      setError('Saving is unavailable right now.')
      setBusy(false)
      return
    }
    const next = !saved
    setSaved(next)
    try {
      const { error: dbError } = next
        ? await supabase.from('saved_books').insert({ user_id: viewerId, book_id: bookId })
        : await supabase.from('saved_books').delete().eq('user_id', viewerId).eq('book_id', bookId)
      if (dbError) throw dbError
    } catch (err) {
      setSaved(!next)
      setError(err instanceof Error ? err.message : "Couldn't update that — try again in a moment.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={busy}
        aria-pressed={saved}
        className={`flex items-center gap-2 rounded-full border px-6 py-3 font-noir-display text-[16px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          saved
            ? 'border-noir-primary-fixed bg-noir-primary-fixed/10 text-noir-primary-fixed'
            : 'border-white/10 bg-noir-surface-container text-noir-on-surface hover:border-noir-primary-fixed/50'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: `'FILL' ${saved ? 1 : 0}` }}>
          bookmark
        </span>
        {saved ? 'Saved to Library' : 'Add to Library'}
      </button>
      {error && (
        <p role="alert" className="max-w-xs font-noir-mono text-[11px] text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
