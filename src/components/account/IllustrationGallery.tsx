'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { SavedFile } from '@/lib/files'

export default function IllustrationGallery({ files }: { files: SavedFile[] }) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)

  if (files.length === 0) return null

  async function handleDelete(id: string) {
    setBusyId(id)
    const supabase = createClient()
    await supabase?.from('files').delete().eq('id', id)
    setBusyId(null)
    router.refresh()
  }

  return (
    <div className="rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-extrabold text-ink">Your illustrations</h2>
      <p className="mt-1 text-sm text-ink/60">Pictures you made or uploaded with the Illustration tool.</p>
      <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {files.map((file) => (
          <li key={file.id} className="group relative overflow-hidden rounded-xl border-2 border-ink/10 bg-page">
            {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded asset in Supabase Storage, not a local/optimizable one */}
            <img src={file.url} alt={file.name} className="aspect-square w-full object-cover" />
            <button
              type="button"
              disabled={busyId === file.id}
              onClick={() => void handleDelete(file.id)}
              aria-label={`Remove ${file.name}`}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white opacity-0 transition-opacity hover:bg-black/80 focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-50"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
