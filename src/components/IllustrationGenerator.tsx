import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { bookTypes, type BookTypeId } from '../data/bookTypes'
import { generateIllustrationIdea } from '../data/generators'
import GenreSwitcher from './GenreSwitcher'
import CopyButton from './CopyButton'
import ReadAloud from './ReadAloud'
import DictateButton from './DictateButton'
import Sticker from './Sticker'

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
  const activeType = bookTypes.find((b) => b.id === selected) ?? bookTypes[0]

  // Generated client-side only, after mount — Math.random() output would
  // otherwise differ between the server-rendered and hydrated client markup.
  useEffect(() => {
    setIdea((prev) => prev || generateIllustrationIdea(selected))
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }

  function handleSpeakIdea(transcript: string) {
    setIdea(transcript)
    setImageUrl(null)
    setImageError('')
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
            // eslint-disable-next-line @next/next/no-img-element -- data:/blob: preview, not an optimizable asset
            <img
              src={imageUrl}
              alt={idea}
              className="mt-4 max-h-80 w-full rounded-xl border-2 border-ink/10 object-contain"
            />
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
