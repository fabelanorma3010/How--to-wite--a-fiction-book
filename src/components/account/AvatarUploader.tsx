'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

export default function AvatarUploader({ userId, avatarUrl }: { userId: string; avatarUrl: string | null }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(avatarUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    if (!ACCEPTED.includes(file.type)) {
      setError('Please choose a PNG, JPEG, WebP, or GIF image.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('That image is too large — 5MB max.')
      return
    }

    setUploading(true)
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    const supabase = createClient()
    if (!supabase) {
      setError('Uploads are unavailable right now.')
      setUploading(false)
      return
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${userId}/avatar-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(path)

    const { error: updateError } = await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', userId)
    if (updateError) {
      setError(updateError.message)
      setUploading(false)
      return
    }

    await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })

    setUploading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-ink/10 bg-base">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Your avatar" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink/30">?</div>
        )}
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-full border-2 border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-base/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? 'Uploading…' : 'Upload photo'}
        </button>
        <p className="mt-1 text-xs text-ink/50">PNG, JPEG, WebP or GIF. 5MB max.</p>
        {error && (
          <p role="alert" className="mt-1 text-xs font-semibold text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
