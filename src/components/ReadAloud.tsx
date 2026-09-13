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

  function handleVoiceChange(uri: string) {
    setVoiceURI(uri)
    window.localStorage.setItem(VOICE_STORAGE_KEY, uri)
  }

  function handlePresetChange(next: FunPreset) {
    setPreset(next)
    window.localStorage.setItem(PRESET_STORAGE_KEY, next)
  }

  function handleToggle() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const synth = window.speechSynthesis

    if (speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }

    if (!text.trim()) return

    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
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

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={handleToggle}
        disabled={!speaking && !text.trim()}
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
      {voices.length > 1 && (
        <select
          aria-label={t('voiceLabel')}
          value={voiceURI}
          onChange={(e) => handleVoiceChange(e.target.value)}
          className="rounded-full border-2 border-ink/15 bg-white/80 px-2 py-1 text-xs font-semibold text-ink/70"
        >
          <option value="">{t('defaultVoice')}</option>
          {voices.map((voice) => (
            <option key={voice.voiceURI} value={voice.voiceURI}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      )}
    </span>
  )
}
