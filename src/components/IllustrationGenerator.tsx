import { useEffect, useState } from 'react'
import { bookTypes, type BookTypeId } from '../data/bookTypes'
import { generateIllustrationIdea } from '../data/generators'
import GenreSwitcher from './GenreSwitcher'
import CopyButton from './CopyButton'

interface IllustrationGeneratorProps {
  selected: BookTypeId
  onSelect: (id: BookTypeId) => void
}

type ImageStatus = 'idle' | 'loading' | 'error' | 'done'

export default function IllustrationGenerator({ selected, onSelect }: IllustrationGeneratorProps) {
  const [idea, setIdea] = useState<string>('')
  const [imageStatus, setImageStatus] = useState<ImageStatus>('idle')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const activeType = bookTypes.find((b) => b.id === selected) ?? bookTypes[0]

  // Generated client-side only, after mount — Math.random() output would
  // otherwise differ between the server-rendered and hydrated client markup.
  useEffect(() => {
    setIdea((prev) => prev || generateIllustrationIdea(selected))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenerate = () => {
    setIdea(generateIllustrationIdea(selected))
    setImageStatus('idle')
    setImageUrl(null)
    setImageError(null)
  }

  const handleGenerateImage = async () => {
    setImageStatus('loading')
    setImageError(null)
    try {
      const res = await fetch('/api/generate-illustration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: idea }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Something went wrong generating the image.')
      }
      setImageUrl(data.image)
      setImageStatus('done')
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Something went wrong.')
      setImageStatus('error')
    }
  }

  return (
    <section id="illustration-generator" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-3xl border-2 border-ink/10 bg-white/60 p-6 shadow-sm sm:p-10">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
            Creative Illustration Idea Generator 🎨
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/70">
            Need a spark for your next panel or page? Generate a full illustration
            prompt — subject, action, setting, detail, and color palette — for your
            artist (or yourself). Or skip straight to a generated image.
          </p>
        </div>

        <div className="mt-6">
          <GenreSwitcher selected={selected} onSelect={onSelect} label="Choose genre for illustration idea" />
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-full bg-accent px-8 py-3.5 text-lg font-extrabold text-accent-content shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            Generate {activeType.emoji} Illustration Idea
          </button>
        </div>

        <div
          key={idea}
          className="animate-pop-in mt-8 rounded-2xl border-2 border-accent/40 bg-accent/10 p-5 sm:p-6"
        >
          <p className="text-lg leading-relaxed font-semibold text-ink">{idea}</p>
          <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={imageStatus === 'loading'}
              className="flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-5 py-2.5 font-bold text-ink transition-colors hover:bg-base disabled:cursor-not-allowed disabled:opacity-60"
            >
              {imageStatus === 'loading' ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink"
                  />
                  Generating…
                </>
              ) : (
                <>🖼️ Turn into Image</>
              )}
            </button>
            <CopyButton text={idea} />
          </div>

          {imageStatus === 'error' && (
            <p role="alert" className="mt-4 text-sm font-semibold text-red-600">
              {imageError}
            </p>
          )}

          {imageStatus === 'done' && imageUrl && (
            <div className="animate-pop-in mt-5 overflow-hidden rounded-xl border-2 border-ink/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt={idea} className="w-full" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
