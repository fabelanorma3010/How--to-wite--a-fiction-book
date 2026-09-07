'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '../lib/supabase/client'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
const MAX_IMAGES = 6
const SIGNED_URL_TTL = 3600
const PDF_TYPE = 'application/pdf'

interface NotebookImage {
  id: string
  path: string
  url: string
  contentType: string | null
}

export default function NotebookImages({ userId }: { userId: string | null }) {
  const t = useTranslations('NotebookImages')
  const [images, setImages] = useState<NotebookImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!userId) {
      setImages([])
      return
    }
    let cancelled = false

    async function load() {
      const supabase = createClient()
      if (!supabase) return
      const { data } = await supabase
        .from('notebook_images')
        .select('id, path, content_type')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      if (!data || cancelled) return

      const withUrls = await Promise.all(
        data.map(async (row) => {
          const { data: signed } = await supabase.storage
            .from('notebook-images')
            .createSignedUrl(row.path, SIGNED_URL_TTL)
          return {
            id: row.id as string,
            path: row.path as string,
            contentType: row.content_type as string | null,
            url: signed?.signedUrl ?? '',
          }
        }),
      )
      if (!cancelled) setImages(withUrls.filter((img) => img.url))
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [userId])

  async function handleFiles(files: FileList | null) {
    if (!files || !userId) return
    setError(null)

    const remaining = MAX_IMAGES - images.length
    if (files.length > remaining) setError(t('tooMany', { max: MAX_IMAGES }))

    const supabase = createClient()
    if (!supabase) {
      setError(t('unavailable'))
      return
    }

    for (const file of Array.from(files).slice(0, remaining)) {
      if (!ACCEPTED.includes(file.type)) {
        setError(t('invalidType'))
        continue
      }
      if (file.size > MAX_BYTES) {
        setError(t('tooLarge'))
        continue
      }

      setLoading(true)
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('notebook-images')
        .upload(path, file, { contentType: file.type })
      if (uploadError) {
        setError(uploadError.message)
        setLoading(false)
        continue
      }

      const { data: inserted, error: insertError } = await supabase
        .from('notebook_images')
        .insert({ user_id: userId, path, content_type: file.type })
        .select('id')
        .single()
      if (insertError || !inserted) {
        setError(insertError?.message ?? t('unavailable'))
        setLoading(false)
        continue
      }

      const { data: signed } = await supabase.storage
        .from('notebook-images')
        .createSignedUrl(path, SIGNED_URL_TTL)
      setImages((prev) => [
        ...prev,
        { id: inserted.id as string, path, contentType: file.type, url: signed?.signedUrl ?? '' },
      ])
      setLoading(false)
    }
  }

  async function handleRemove(image: NotebookImage) {
    const supabase = createClient()
    if (!supabase) return
    setImages((prev) => prev.filter((img) => img.id !== image.id))
    await supabase.storage.from('notebook-images').remove([image.path])
    await supabase.from('notebook_images').delete().eq('id', image.id)
  }

  if (!userId) {
    return <p className="mt-4 text-sm text-ink/50">{t('signInPrompt')}</p>
  }

  return (
    <div className="mt-4">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        multiple
        className="hidden"
        onChange={(e) => {
          void handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
      <div className="flex flex-wrap items-center gap-3">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-ink/10 bg-page"
          >
            {image.contentType === PDF_TYPE ? (
              <a
                href={image.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-ink/60 hover:text-ink"
              >
                <span aria-hidden="true" className="text-xl">
                  📄
                </span>
                <span className="text-[0.6rem] font-bold uppercase">PDF</span>
              </a>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => void handleRemove(image)}
              aria-label={t('remove')}
              className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            aria-label={t('addPictures')}
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-ink/20 text-2xl text-ink/40 transition-colors hover:border-primary/50 hover:text-primary-content disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '…' : '+'}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
