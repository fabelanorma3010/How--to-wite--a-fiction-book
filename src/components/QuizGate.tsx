'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { loadStoredAgeGate } from '../lib/quizGate'

interface QuizGateProps {
  children: React.ReactNode
}

type Status = 'checking' | 'allowed' | 'underage'

// Requires a finished quiz before showing the tool pages that follow it —
// an unfinished visitor is sent back to the quiz, and a reader flagged
// under 13 sees a short notice instead of the tool.
export default function QuizGate({ children }: QuizGateProps) {
  const t = useTranslations('Quiz')
  const router = useRouter()
  const [status, setStatus] = useState<Status>('checking')

  useEffect(() => {
    const stored = loadStoredAgeGate()
    if (!stored?.completed) {
      router.replace('/quiz')
      return
    }
    if (stored.age < 13) {
      setStatus('underage')
      return
    }
    setStatus('allowed')
  }, [router])

  if (status === 'checking') return null

  if (status === 'underage') {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <p className="text-xl font-extrabold text-ink sm:text-2xl">{t('underageHeading')}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink/70">{t('underageBody')}</p>
      </div>
    )
  }

  return <>{children}</>
}
