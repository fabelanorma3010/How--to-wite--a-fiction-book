'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

interface SpeechRecognitionResultLike {
  transcript: string
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

interface DictateButtonProps {
  onResult: (transcript: string) => void
  label?: string
  className?: string
}

export default function DictateButton({ onResult, label, className = '' }: DictateButtonProps) {
  const t = useTranslations('Dictate')
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    setSupported(getSpeechRecognitionCtor() !== null)
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  function handleToggle() {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const SpeechRecognitionCtor = getSpeechRecognitionCtor()
    if (!SpeechRecognitionCtor) return

    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = typeof navigator !== 'undefined' ? navigator.language : 'en-US'
    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i]?.[0]?.transcript ?? ''
      }
      if (transcript.trim()) onResult(transcript.trim())
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  if (!supported) return null

  return (
    <button type="button" onClick={handleToggle} aria-pressed={listening} className={className}>
      {listening ? `⏹️ ${t('stop')}` : `🎤 ${label ?? t('dictate')}`}
    </button>
  )
}
