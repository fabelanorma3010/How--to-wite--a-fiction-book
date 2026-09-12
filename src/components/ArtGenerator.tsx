'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ART_CATEGORIES, type ArtCategory, drawArt, randomCategory, randomSeed } from '../lib/artGenerators'

const BLUR_LEVELS = [
  { value: 0, key: 'none' },
  { value: 2, key: 'light' },
  { value: 4, key: 'medium' },
  { value: 7, key: 'heavy' },
] as const

const chipClass = (active: boolean) =>
  `rounded-full border-2 px-3 py-1.5 text-sm font-bold transition-colors ${
    active ? 'border-primary bg-primary/20 text-ink' : 'border-ink/15 bg-white text-ink/70 hover:bg-page'
  }`

export default function ArtGenerator() {
  const t = useTranslations('ArtGenerator')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [categoryChoice, setCategoryChoice] = useState<ArtCategory | 'random'>('random')
  const [currentCategory, setCurrentCategory] = useState<ArtCategory>('shapes')
  const [seed, setSeed] = useState(0)
  const [blur, setBlur] = useState<number>(0)
  const [ready, setReady] = useState(false)

  // Randomize only after mount so server and client render the same markup.
  useEffect(() => {
    setCurrentCategory(randomCategory())
    setSeed(randomSeed())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready || !canvasRef.current) return
    drawArt(canvasRef.current, currentCategory, seed, blur)
  }, [ready, currentCategory, seed, blur])

  function pickCategory(next: ArtCategory | 'random') {
    setCategoryChoice(next)
    setCurrentCategory(next === 'random' ? randomCategory() : next)
    setSeed(randomSeed())
  }

  function generateAnother() {
    setCurrentCategory(categoryChoice === 'random' ? randomCategory() : categoryChoice)
    setSeed(randomSeed())
  }

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `storyburst-${currentCategory}-${seed}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">{t('title')} 🎨</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/70">{t('lead')}</p>
          <p className="mt-1.5 text-xs font-semibold text-ink/40">{t('noAiNote')}</p>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-ink/50">{t('styleLabel')}</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => pickCategory('random')}
              aria-pressed={categoryChoice === 'random'}
              className={chipClass(categoryChoice === 'random')}
            >
              🎲 {t('surpriseMe')}
            </button>
            {ART_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => pickCategory(cat)}
                aria-pressed={categoryChoice === cat}
                className={chipClass(categoryChoice === cat)}
              >
                {t(`category.${cat}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-ink/50">{t('blurLabel')}</p>
          <div className="flex flex-wrap gap-1.5">
            {BLUR_LEVELS.map(({ value, key }) => (
              <button
                key={key}
                type="button"
                onClick={() => setBlur(value)}
                aria-pressed={blur === value}
                className={chipClass(blur === value)}
              >
                {t(`blur.${key}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={256}
            height={256}
            className="h-64 w-64 rounded-2xl border-2 border-ink/10 bg-white shadow-sm sm:h-72 sm:w-72"
          />
          {ready && <p className="mt-3 text-sm font-semibold text-ink/50">{t(`category.${currentCategory}`)}</p>}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={generateAnother}
            className="rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95"
          >
            ✨ {t('generateButton')}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-full border-2 border-ink/15 bg-white px-6 py-3 font-bold text-ink transition-colors hover:bg-page"
          >
            ⬇️ {t('downloadButton')}
          </button>
        </div>
      </div>
    </section>
  )
}
