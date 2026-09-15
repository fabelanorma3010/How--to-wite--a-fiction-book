'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

const VOICE_STORAGE_KEY = 'storyburst-read-aloud-voice'
const PRESET_STORAGE_KEY = 'storyburst-read-aloud-preset'

type FunPreset = 'normal' | 'oldMan' | 'youngWoman' | 'clown'
const PRESET_ORDER: FunPreset[] = ['normal', 'oldMan', 'youngWoman', 'clown']
const PRESET_EMOJI: Record<FunPreset, string> = { normal: '🔊', oldMan: '👴', youngWoman: '👩', clown: '🤡' }
// Real system voices can't be swapped for a "character" — only their pitch
// and rate can. These are tuned to caricature each one on top of whatever
// voice is already selected.
const PRESET_SETTINGS: Record<FunPreset, { pitch: number; rate: number }> = {
  normal: { pitch: 1, rate: 1 },
  oldMan: { pitch: 0.55, rate: 0.82 },
  youngWoman: { pitch: 1.6, rate: 1.05 },
  clown: { pitch: 1.85, rate: 1.35 },
}

function isFunPreset(value: string): value is FunPreset {
  return (PRESET_ORDER as string[]).includes(value)
}

// Same 9 languages the /api/writing-tools translate mode accepts (Storyburst's
// own UI languages) — keeps the picker in sync with what the backend supports.
const TRANSLATE_LANGUAGE_CODES = ['en', 'de', 'es', 'fr', 'hi', 'it', 'ja', 'pt', 'zh'] as const

interface ReadAloudProps {
  text: string
  label?: string
  className?: string
}

export default function ReadAloud({ text, label, className = '' }: ReadAloudProps) {
  const t = useTranslations('ReadAloud')
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(true)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceURI, setVoiceURI] = useState('')
  const [preset, setPreset] = useState<FunPreset>('normal')
  const [targetLang, setTargetLang] = useState('')
  // Keyed by source text, then by language — so switching to another panel's
  // text and back doesn't throw away a translation already paid for with an
  // API call. Never trimmed: a book-length session might revisit a few dozen
  // captions, which is nothing to keep a handful of short strings for each.
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({})
  const [translateStatus, setTranslateStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [translateError, setTranslateError] = useState('')

  useEffect(() => {
    const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window
    setSupported(hasSpeech)
    if (!hasSpeech) return

    const synth = window.speechSynthesis
    const refreshVoices = () => {
      if (typeof synth.getVoices === 'function') setVoices(synth.getVoices())
    }
    refreshVoices()
    // Chrome loads its voice list asynchronously — an empty list on the first
    // call isn't "no voices," it just hasn't arrived yet.
    synth.addEventListener?.('voiceschanged', refreshVoices)

    const savedVoice = window.localStorage.getItem(VOICE_STORAGE_KEY)
    if (savedVoice) setVoiceURI(savedVoice)
    const savedPreset = window.localStorage.getItem(PRESET_STORAGE_KEY)
    if (savedPreset && isFunPreset(savedPreset)) setPreset(savedPreset)

    return () => {
      synth.removeEventListener?.('voiceschanged', refreshVoices)
      synth.cancel()
    }
  }, [])

  // Clear any stale error/spinner when switching to different text — but
  // keep the translation cache itself, keyed by text above, so it survives
  // the switch instead of forcing a re-translate on every panel visit.
  useEffect(() => {
    setTranslateError('')
    setTranslateStatus('idle')
  }, [text])

  const activeText = targetLang && translations[text]?.[targetLang] ? translations[text][targetLang] : text

  function handleVoiceChange(uri: string) {
    setVoiceURI(uri)
    window.localStorage.setItem(VOICE_STORAGE_KEY, uri)
  }

  function handlePresetChange(next: FunPreset) {
    setPreset(next)
    window.localStorage.setItem(PRESET_STORAGE_KEY, next)
  }

  async function runTranslate(lang: string) {
    setTranslateStatus('loading')
    setTranslateError('')
    try {
      const res = await fetch('/api/writing-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode: 'translate', targetLang: lang }),
      })
      const data = await res.json()
      if (!res.ok || typeof data?.result !== 'string') throw new Error(data?.error || t('translateError'))
      setTranslations((prev) => ({ ...prev, [text]: { ...prev[text], [lang]: data.result } }))
      setTranslateStatus('idle')
    } catch (err) {
      setTranslateError(err instanceof Error ? err.message : t('translateError'))
      setTranslateStatus('idle')
    }
  }

  function handleTargetLangChange(lang: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    setSpeaking(false)
    setTargetLang(lang)
    setTranslateError('')

    if (!lang) {
      // Back to the original text — restore whatever voice was actually
      // saved, rather than whichever foreign-language voice was auto-picked.
      setVoiceURI(window.localStorage.getItem(VOICE_STORAGE_KEY) ?? '')
      return
    }
    const match = voices.find((v) => v.lang.toLowerCase().startsWith(lang))
    if (match) setVoiceURI(match.voiceURI)
    if (!translations[text]?.[lang]) void runTranslate(lang)
  }

  function handleToggle() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const synth = window.speechSynthesis

    if (speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }

    if (!activeText.trim()) return

    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(activeText)
    const chosenVoice = voices.find((v) => v.voiceURI === voiceURI)
    if (chosenVoice) utterance.voice = chosenVoice
    utterance.pitch = PRESET_SETTINGS[preset].pitch
    utterance.rate = PRESET_SETTINGS[preset].rate
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    synth.speak(utterance)
    setSpeaking(true)
  }

  if (!supported) return null

  // A voice matching the chosen language is far more useful to list first —
  // but if none exists on this device, fall back to the full list rather
  // than showing an empty picker.
  const languageVoices = targetLang ? voices.filter((v) => v.lang.toLowerCase().startsWith(targetLang)) : voices
  const voiceOptions = languageVoices.length > 0 ? languageVoices : voices

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={handleToggle}
        disabled={!speaking && !activeText.trim()}
        aria-pressed={speaking}
        className={className}
      >
        {speaking ? `⏹️ ${t('stop')}` : `🔊 ${label ?? t('readAloud')}`}
      </button>
      <span className="inline-flex items-center gap-1" role="group" aria-label={t('characterLabel')}>
        {PRESET_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handlePresetChange(key)}
            aria-pressed={preset === key}
            aria-label={t(`preset.${key}`)}
            title={t(`preset.${key}`)}
            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm transition-transform hover:scale-110 ${
              preset === key ? 'border-primary bg-primary/15' : 'border-ink/15 bg-white/70'
            }`}
          >
            {PRESET_EMOJI[key]}
          </button>
        ))}
      </span>
      <select
        aria-label={t('translateLabel')}
        value={targetLang}
        disabled={!text.trim()}
        onChange={(e) => handleTargetLangChange(e.target.value)}
        className="rounded-full border-2 border-ink/15 bg-white/80 px-2 py-1 text-xs font-semibold text-ink/70"
      >
        <option value="">{t('originalLanguage')}</option>
        {TRANSLATE_LANGUAGE_CODES.map((code) => (
          <option key={code} value={code}>
            {t(`language.${code}`)}
          </option>
        ))}
      </select>
      {voiceOptions.length > 1 && (
        <select
          aria-label={t('voiceLabel')}
          value={voiceURI}
          onChange={(e) => handleVoiceChange(e.target.value)}
          className="rounded-full border-2 border-ink/15 bg-white/80 px-2 py-1 text-xs font-semibold text-ink/70"
        >
          <option value="">{t('defaultVoice')}</option>
          {voiceOptions.map((voice) => (
            <option key={voice.voiceURI} value={voice.voiceURI}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      )}
      {targetLang && (
        <span className="mt-1 w-full basis-full">
          {translateStatus === 'loading' && <p className="text-xs font-semibold text-ink/50">{t('translating')}</p>}
          {translateError && (
            <p role="alert" className="text-xs font-semibold text-red-600">
              {translateError}
            </p>
          )}
          {translations[text]?.[targetLang] && (
            <span className="mt-1 block rounded-xl border-2 border-ink/10 bg-white/70 p-3">
              <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wide text-ink/40">
                {t('translatedLabel')}
              </span>
              <span className="block whitespace-pre-wrap text-sm leading-relaxed text-ink/90">
                {translations[text][targetLang]}
              </span>
            </span>
          )}
        </span>
      )}
    </span>
  )
}
