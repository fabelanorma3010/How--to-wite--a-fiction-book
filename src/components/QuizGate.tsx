'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStoredAgeGate } from '../lib/quizGate'

interface QuizGateProps {
  children: React.ReactNode
}

// Requires a finished quiz before showing the tool pages that follow it —
// an unfinished visitor is sent back to the quiz, and a reader flagged
// under 13 is sent to Kids Corner instead of the main tools.
export default function QuizGate({ children }: QuizGateProps) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const stored = loadStoredAgeGate()
    if (!stored?.completed) {
      router.replace('/quiz')
      return
    }
    if (stored.age < 13) {
      router.replace('/kids')
      return
    }
    setAllowed(true)
  }, [router])

  if (!allowed) return null
  return <>{children}</>
}
