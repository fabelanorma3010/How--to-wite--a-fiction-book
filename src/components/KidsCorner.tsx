'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getHelperReply } from '../data/helper'
import DictateButton from './DictateButton'

const STICKERS = ['🐉', '🚀', '🦄', '🍩', '👑', '🐙', '🌈', '🧙']
const IMAGE_EXAMPLES = [
  'a purple dragon eating a donut on the roof',
  'a unicorn racing a rocket through the clouds',
  'a sneaky octopus stealing pizza',
  'a tiny knight riding a giant frog',
]
const SPARKY_PROMPTS = [
  { key: 'character', prompt: 'Give me a funny character' },
  { key: 'next', prompt: 'What happens next in my story?' },
  { key: 'name', prompt: 'Help me name my dragon' },
  { key: 'ending', prompt: 'Make my ending exciting' },
] as const

interface Message {
  role: 'user' | 'assistant'
  text: string
}

function pick<T>(arr: readonly T[], not?: T): T {
  const options = not !== undefined && arr.length > 1 ? arr.filter((x) => x !== not) : arr
  return options[Math.floor(Math.random() * options.length)]
}

export default function KidsCorner() {
  const t = useTranslations('KidsCorner')
  const funWords = t.raw('funWords') as string[]
  const starterLines = t.raw('starterLines') as string[]

  const [pickedStickers, setPickedStickers] = useState<string[]>([])
  const [usedWords, setUsedWords] = useState<string[]>([])
  const [starter, setStarter] = useState(starterLines[0])

  const welcome = useRef<Message>({ role: 'assistant', text: t('sparkyWelcome') })
  const [messages, setMessages] = useState<Message[]>([welcome.current])
  const [sparkyInput, setSparkyInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [imagePrompt, setImagePrompt] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageBusy, setImageBusy] = useState(false)
  const [imageError, setImageError] = useState('')

  const [timerSeconds, setTimerSeconds] = useState<number | null>(null)
  const [timerDone, setTimerDone] = useState(false)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  useEffect(() => {
    if (timerSeconds === null || timerSeconds <= 0) return
    const id = setTimeout(() => setTimerSeconds((s) => (s ?? 1) - 1), 1000)
    return () => clearTimeout(id)
  }, [timerSeconds])

  useEffect(() => {
    if (timerSeconds === 0) {
      setTimerDone(true)
      try {
        const ctx = new AudioContext()
        const beep = (delay: number) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.frequency.value = 880
          osc.connect(gain)
          gain.connect(ctx.destination)
          gain.gain.setValueAtTime(0.2, ctx.currentTime + delay)
          osc.start(ctx.currentTime + delay)
          osc.stop(ctx.currentTime + delay + 0.18)
        }
        beep(0)
        beep(0.25)
        beep(0.5)
      } catch {
        // Web Audio unavailable — the on-screen "Time's up!" still shows.
      }
    }
  }, [timerSeconds])

  function toggleSticker(emoji: string) {
    setPickedStickers((prev) => (prev.includes(emoji) ? prev.filter((s) => s !== emoji) : [...prev, emoji]))
  }

  function toggleWord(word: string) {
    setUsedWords((prev) => (prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]))
  }

  function anotherStarter() {
    setStarter(pick(starterLines, starter))
  }

  function startTimer() {
    setTimerDone(false)
    setTimerSeconds(10 * 60)
  }

  async function sendToSparky(prompt: string) {
    const trimmed = prompt.trim()
    if (!trimmed || thinking) return
    const next = [...messages, { role: 'user' as const, text: trimmed }]
    setMessages(next)
    setSparkyInput('')
    setThinking(true)
    let reply: string
    try {
      const res = await fetch('/api/fiction-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, genre: 'childrens' }),
      })
      const data = await res.json()
      if (res.status === 429 && typeof data?.error === 'string') {
        reply = data.error
      } else {
        reply = res.ok && typeof data?.reply === 'string' ? data.reply : getHelperReply(trimmed, 'childrens')
      }
    } catch {
      reply = getHelperReply(trimmed, 'childrens')
    }
    setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    setThinking(false)
  }

  async function drawIt() {
    if (!imagePrompt.trim() || imageBusy) return
    setImageBusy(true)
    setImageError('')
    try {
      const res = await fetch('/api/generate-illustration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt.trim() }),
      })
      const data = await res.json()
      if (!res.ok || typeof data?.image !== 'string') {
        throw new Error(data?.error || t('drawError'))
      }
      setImageUrl(data.image)
    } catch (err) {
      setImageError(err instanceof Error ? err.message : t('drawError'))
    } finally {
      setImageBusy(false)
    }
  }

  const mm = timerSeconds !== null ? Math.floor(timerSeconds / 60) : 0
  const ss = timerSeconds !== null ? timerSeconds % 60 : 0

  return (
    <div className="min-h-screen bg-page">
      <section className="relative overflow-hidden px-4 pb-4 pt-14 sm:px-6 sm:pt-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-accent/30 blur-2xl sm:h-72 sm:w-72"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 top-20 h-48 w-48 rounded-full bg-secondary/30 blur-2xl sm:h-64 sm:w-64"
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <span className="rounded-full border-2 border-accent/40 bg-white/70 px-4 py-1.5 text-sm font-bold text-accent-content shadow-sm">
            🧸 {t('badge')}
          </span>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            {t('heading')}
          </h1>
          <p className="max-w-xl text-lg font-semibold text-ink/70">{t('lead')}</p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-6 px-4 pb-16 sm:px-6">
        <section className="rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-extrabold text-ink">{t('stickersHeading')}</h2>
          <p className="mt-1 text-sm text-ink/60">{t('stickersLead')}</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {STICKERS.map((emoji) => {
              const picked = pickedStickers.includes(emoji)
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => toggleSticker(emoji)}
                  aria-pressed={picked}
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-2xl transition-transform hover:scale-110 ${
                    picked ? 'border-accent bg-accent/20 scale-110' : 'border-ink/15 bg-white'
                  }`}
                >
                  {emoji}
                </button>
              )
            })}
          </div>
        </section>

        <section className="rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-extrabold text-ink">{t('wordsHeading')}</h2>
          <p className="mt-1 text-sm text-ink/60">{t('wordsLead')}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {funWords.map((word) => {
              const used = usedWords.includes(word)
              return (
                <button
                  key={word}
                  type="button"
                  onClick={() => toggleWord(word)}
                  aria-pressed={used}
                  className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors ${
                    used ? 'border-primary bg-primary/15 text-ink line-through' : 'border-ink/15 bg-white text-ink/80'
                  }`}
                >
                  {word}
                </button>
              )
            })}
          </div>
        </section>

        <section className="rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-extrabold text-ink">{t('starterHeading')}</h2>
          <p key={starter} className="animate-pop-in mt-3 rounded-2xl bg-page/80 p-4 text-lg font-semibold text-ink">
            {starter}
          </p>
          <button
            type="button"
            onClick={anotherStarter}
            className="mt-3 rounded-full border-2 border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink/70 transition-colors hover:bg-page"
          >
            🔄 {t('starterAnother')}
          </button>
        </section>

        <section className="rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-extrabold text-ink">{t('sparkyHeading')} ✨</h2>
          <p className="mt-1 text-sm text-ink/60">{t('sparkyIntro')}</p>

          <div ref={scrollRef} aria-live="polite" className="mt-4 max-h-64 space-y-2.5 overflow-y-auto rounded-2xl bg-page/60 p-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.role === 'user' ? 'bg-primary text-primary-content' : 'border-2 border-ink/10 bg-white text-ink/90'
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <p className="rounded-2xl border-2 border-ink/10 bg-white px-3.5 py-2.5 text-sm text-ink/50">···</p>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {SPARKY_PROMPTS.map((sp) => (
              <button
                key={sp.key}
                type="button"
                disabled={thinking}
                onClick={() => void sendToSparky(sp.prompt)}
                className="rounded-full border-2 border-ink/15 bg-white px-3 py-1.5 text-xs font-bold text-ink/70 transition-colors hover:border-accent/50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t(`sparkyPrompt.${sp.key}`)}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              void sendToSparky(sparkyInput)
            }}
            className="mt-3 flex items-center gap-2"
          >
            <label htmlFor="sparky-input" className="sr-only">
              {t('sparkyInputPlaceholder')}
            </label>
            <input
              id="sparky-input"
              value={sparkyInput}
              onChange={(e) => setSparkyInput(e.target.value)}
              placeholder={t('sparkyInputPlaceholder')}
              className="min-w-0 flex-1 rounded-full border-2 border-ink/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-primary/50"
            />
            <button
              type="submit"
              disabled={!sparkyInput.trim() || thinking}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-content disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('sparkyAsk')}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-extrabold text-ink">{t('drawHeading')} 🎨</h2>
          <p className="mt-1 text-sm text-ink/60">{t('drawLead')}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder={t('drawPlaceholder')}
              className="min-w-0 flex-1 rounded-full border-2 border-ink/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-primary/50"
            />
            <DictateButton
              onResult={setImagePrompt}
              label={t('drawSpeak')}
              className="shrink-0 rounded-full border-2 border-ink/15 bg-white px-3 py-2.5 text-xs font-bold text-ink/70 hover:bg-page"
            />
            <button
              type="button"
              onClick={() => void drawIt()}
              disabled={imageBusy || !imagePrompt.trim()}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-extrabold text-accent-content disabled:cursor-not-allowed disabled:opacity-50"
            >
              {imageBusy ? t('drawGenerating') : t('drawButton')}
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {IMAGE_EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setImagePrompt(ex)}
                className="rounded-full border border-ink/10 bg-page/70 px-3 py-1 text-xs font-semibold text-ink/60 hover:text-ink"
              >
                {ex}
              </button>
            ))}
          </div>

          {imageError && <p className="mt-2 text-sm font-semibold text-red-600">{imageError}</p>}

          <div className="mt-4 flex aspect-video items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-ink/15 bg-page/50">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={imagePrompt} className="h-full w-full object-contain" />
            ) : (
              <p className="text-sm font-semibold text-ink/40">🖍️ {t('drawEmpty')}</p>
            )}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border-2 border-ink/10 bg-white/70 p-5 text-center">
            <p className="text-2xl">✏️</p>
            <h3 className="mt-1 font-extrabold text-ink">{t('tipTimerTitle')}</h3>
            <p className="mt-1 text-sm text-ink/60">{t('tipTimerBody')}</p>
            {timerSeconds === null ? (
              <button
                type="button"
                onClick={startTimer}
                className="mt-3 rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-content"
              >
                {t('tipTimerStart')}
              </button>
            ) : timerDone ? (
              <p className="mt-3 font-extrabold text-accent-content">{t('tipTimerDone')}</p>
            ) : (
              <p className="mt-3 font-mono text-2xl font-extrabold text-ink">
                {mm}:{ss.toString().padStart(2, '0')}
              </p>
            )}
          </div>
          <div className="rounded-2xl border-2 border-ink/10 bg-white/70 p-5 text-center">
            <p className="text-2xl">🎤</p>
            <h3 className="mt-1 font-extrabold text-ink">{t('tipVoiceTitle')}</h3>
            <p className="mt-1 text-sm text-ink/60">{t('tipVoiceBody')}</p>
          </div>
          <div className="rounded-2xl border-2 border-ink/10 bg-white/70 p-5 text-center">
            <p className="text-2xl">📚</p>
            <h3 className="mt-1 font-extrabold text-ink">{t('tipReadTitle')}</h3>
            <p className="mt-1 text-sm text-ink/60">{t('tipReadBody')}</p>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/notebook"
            className="inline-block rounded-full bg-primary px-8 py-3.5 text-lg font-extrabold text-primary-content shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            {t('ctaButton')}
          </a>
        </div>
      </div>
    </div>
  )
}
