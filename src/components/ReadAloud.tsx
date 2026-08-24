'use client'

import { useEffect, useState } from 'react'

interface ReadAloudProps {
  text: string
  label?: string
  className?: string
}

export default function ReadAloud({ text, label = 'Read Aloud', className = '' }: ReadAloudProps) {
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

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
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    synth.speak(utterance)
    setSpeaking(true)
  }

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={!speaking && !text.trim()}
      aria-pressed={speaking}
      className={className}
    >
      {speaking ? '⏹️ Stop' : `🔊 ${label}`}
    </button>
  )
}
