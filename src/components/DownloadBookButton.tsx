'use client'

import { useState } from 'react'
import { downloadBookAsPdf } from '../lib/downloadBookPdf'
import type { Chapter } from '../lib/books'

export default function DownloadBookButton({
  book,
  chapters,
}: {
  book: { title: string; description: string }
  chapters: Chapter[]
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await downloadBookAsPdf(book, chapters)
    } catch {
      setError("Couldn't open the print view — try again in a moment.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => void run()}
        disabled={busy}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-noir-surface-container px-6 py-3 font-noir-display text-[16px] font-bold text-noir-on-surface transition-colors hover:border-noir-primary-fixed/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-[20px]">download</span>
        {busy ? 'Preparing…' : 'Download PDF'}
      </button>
      {error && (
        <p role="alert" className="max-w-xs font-noir-mono text-[11px] text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
