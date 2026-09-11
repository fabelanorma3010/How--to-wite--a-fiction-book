'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '../lib/supabase/client'
import { bookTypes, type BookTypeId } from '../data/bookTypes'
import { generateIllustrationIdea } from '../data/generators'
import GenreSwitcher from './GenreSwitcher'
import CopyButton from './CopyButton'
import ReadAloud from './ReadAloud'
import DictateButton from './DictateButton'
import Sticker from './Sticker'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

interface IllustrationGeneratorProps {
  selected: BookTypeId
  onSelect: (id: BookTypeId) => void
}

const actionButtonClass =
  'flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-5 py-2.5 font-bold text-ink transition-colors hover:bg-page disabled:cursor-not-allowed disabled:opacity-60'

export default function IllustrationGenerator({ selected, onSelect }: IllustrationGeneratorProps) {
  const t = useTranslations('Illustration')
  const [idea, setIdea] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageBusy, setImageBusy] = useState(false)
  const [imageError, setImageError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [saveError, setSaveError] = useState('')
  const activeType = bookTypes.find((b) => b.id === selected) ?? bookTypes[0]

  // Generated client-side only, after mount — Math.random() output would
  // otherwise differ between the server-rendered and hydrated client markup.
  useEffect(() => {
    setIdea((prev) => prev || generateIllustrationIdea(selected))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  // Revokes the previous blob: URL (from an upload) whenever it's replaced
  // or the component unmounts. A no-op for data:/https: URLs from the API.
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  const handleGenerate = () => {
    setIdea(generateIllustrationIdea(selected))
    setImageUrl(null)
    setImageError('')
    setSaveState('idle')
  }

  function handleSpeakIdea(transcript: string) {
    setIdea(transcript)
    setImageUrl(null)
    setImageError('')
    setSaveState('idle')
  }

  async function handleGenerateImage() {
    if (imageBusy) return
    setImageBusy(true)
    setImageError('')
    try {
      const res = await fetch('/api/generate-illustration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: idea }),
      })
      const data = await res.json()
      if (!res.ok || typeof data?.image !== 'string') {
        throw new Error(data?.error || t('imageError'))
      }
      setImageUrl(data.image)
      setSaveState('idle')
    } catch (err) {
      setImageError(err instanceof Error ? err.message : t('imageError'))
    } finally {
      setImageBusy(false)
    }
  }

  function handleUploadImage(file: File | null) {
    if (!file) return
    setImageError('')
    setImageUrl(URL.createObjectURL(file))
    setSaveState('idle')
  }

  async function handleSaveToProfile() {
    if (!imageUrl || !userId || saveState === 'saving') return
    setSaveState('saving')
    setSaveError('')
    const supabase = createClient()
    if (!supabase) {
      setSaveState('error')
      setSaveError(t('saveError'))
      return
    }
    try {
      const blob = await (await fetch(imageUrl)).blob()
      const contentType = blob.type || 'image/png'
      const ext = contentType.split('/')[1]?.split('+')[0] || 'png'
      const path = `${userId}/illustration-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('books')
        .upload(path, blob, { contentType })
      if (uploadError) throw uploadError
      const publicUrl = supabase.storage.from('books').getPublicUrl(path).data.publicUrl
      const { error: insertError } = await supabase
        .from('files')
        .insert({ user_id: userId, name: idea.slice(0, 120), url: publicUrl, mime_type: contentType })
      if (insertError) throw insertError
      setSaveState('saved')
    } catch (err) {
      setSaveState('error')
      setSaveError(err instanceof Error ? err.message : t('saveError'))
    }
  }

  return (
    <section id="illustration-generator" className="scroll-mt-[116px] px-4 py-16 sm:px-6 lg:scroll-mt-20">
      <div className="relative mx-auto max-w-3xl rounded-3xl border-2 border-ink/10 bg-white/60 p-6 shadow-sm sm:p-10">
        <Sticker emoji="🎨" className="-top-2 -right-2 rotate-12 sm:-top-4 sm:-right-4" />
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">{t('title')} 🎨</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/70">{t('intro')}</p>
        </div>

        <div className="mt-6">
          <GenreSwitcher selected={selected} onSelect={onSelect} label={t('genreLabel')} />
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-full bg-accent px-8 py-3.5 text-lg font-extrabold text-accent-content shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            {t('generate', { emoji: activeType.emoji })}
          </button>
        </div>

        <div
          key={idea}
          className="animate-pop-in mt-8 rounded-2xl border-2 border-accent/40 bg-accent/10 p-5 sm:p-6"
        >
          <p className="text-lg leading-relaxed font-semibold text-ink">{idea}</p>

          {imageUrl && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- data:/blob: preview, not an optimizable asset */}
              <img
                src={imageUrl}
                alt={idea}
                className="mt-4 max-h-80 w-full rounded-xl border-2 border-ink/10 object-contain"
              />
              <div className="mt-3 flex justify-center">
                {userId ? (
                  <button
                    type="button"
                    onClick={() => void handleSaveToProfile()}
                    disabled={saveState === 'saving' || saveState === 'saved'}
                    className={actionButtonClass}
                  >
                    {saveState === 'saving'
                      ? t('saving')
                      : saveState === 'saved'
                        ? `✅ ${t('saved')}`
                        : `💾 ${t('saveToProfile')}`}
                  </button>
                ) : (
                  <Link href="/login?next=/illustration-generator" className={actionButtonClass}>
                    💾 {t('saveLoginPrompt')}
                  </Link>
                )}
              </div>
              {saveState === 'error' && saveError && (
                <p className="mt-2 text-center text-sm font-semibold text-red-600">{saveError}</p>
              )}
            </>
          )}
          {imageError && <p className="mt-2 text-sm font-semibold text-red-600">{imageError}</p>}

          <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
            <DictateButton onResult={handleSpeakIdea} label={t('speakIdea')} className={actionButtonClass} />
            <ReadAloud text={idea} label={t('readIdea')} className={actionButtonClass} />
            <label className={`${actionButtonClass} cursor-pointer`}>
              📤 {t('upload')}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => handleUploadImage(e.target.files?.[0] ?? null)}
              />
            </label>
            <button type="button" onClick={() => void handleGenerateImage()} disabled={imageBusy} className={actionButtonClass}>
              🖼️ {imageBusy ? t('generatingImage') : t('generateImage')}
            </button>
            <CopyButton text={idea} />
          </div>
        </div>
      </div>
    </section>
  )
}
