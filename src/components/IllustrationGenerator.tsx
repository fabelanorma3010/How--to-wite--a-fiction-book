import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { bookTypes, type BookTypeId } from '../data/bookTypes'
import { generateIllustrationIdea } from '../data/generators'
import { createClient } from '../lib/supabase/client'
import GenreSwitcher from './GenreSwitcher'
import CopyButton from './CopyButton'
import Sticker from './Sticker'

interface IllustrationGeneratorProps {
  selected: BookTypeId
  onSelect: (id: BookTypeId) => void
}

type ImageStatus = 'idle' | 'loading' | 'done' | 'error'

export default function IllustrationGenerator({ selected, onSelect }: IllustrationGeneratorProps) {
  const t = useTranslations('Illustration')
  const [idea, setIdea] = useState<string>('')
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [imageStatus, setImageStatus] = useState<ImageStatus>('idle')
  const [imageUrl, setImageUrl] = useState('')
  const [imageError, setImageError] = useState('')
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
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)))
  }, [])

  const handleGenerate = () => {
    setIdea(generateIllustrationIdea(selected))
    setImageStatus('idle')
    setImageUrl('')
    setImageError('')
  }

  async function handleGenerateImage() {
    setImageStatus('loading')
    setImageError('')
    try {
      const res = await fetch('/api/generate-illustration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: idea }),
      })
      const data = await res.json()
      if (!res.ok || typeof data?.image !== 'string') {
        throw new Error(data?.error || t('imageGenericError'))
      }
      setImageUrl(data.image)
      setImageStatus('done')
    } catch (err) {
      setImageError(err instanceof Error ? err.message : t('imageGenericError'))
      setImageStatus('error')
    }
  }

  return (
    <section id="illustration-generator" className="px-4 py-16 sm:px-6">
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
          <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
            {signedIn === true ? (
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={imageStatus === 'loading'}
                className="flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-5 py-2.5 font-bold text-ink transition-colors hover:bg-base disabled:cursor-not-allowed disabled:opacity-60"
              >
                🖼️ {imageStatus === 'loading' ? t('generatingImage') : t('generateImage')}
              </button>
            ) : (
              <button
                type="button"
                disabled
                title={t('signInToGenerate')}
                className="flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-5 py-2.5 font-bold text-ink opacity-60 cursor-not-allowed"
              >
                🖼️ {t('signInToGenerate')}
              </button>
            )}
            <CopyButton text={idea} />
          </div>

          {imageStatus === 'error' && (
            <p role="alert" className="mt-4 text-sm font-semibold text-red-600">
              {imageError}
            </p>
          )}
          {imageStatus === 'done' && imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={idea}
              className="mt-4 w-full rounded-2xl border-2 border-ink/10 object-cover"
            />
          )}
        </div>
      </div>
    </section>
  )
}
