'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import FictionHelper from '../../components/FictionHelper'
import BookQuiz from '../../components/BookQuiz'
import type { BookTypeId } from '../../data/bookTypes'

export default function QuizPageClient() {
  const router = useRouter()

  function handleSelect(type: BookTypeId) {
    router.push(`/book-types?type=${type}`)
  }

  const handleUnderage = useCallback(() => {
    router.push('/kids')
  }, [router])

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <BookQuiz onSelect={handleSelect} onUnderage={handleUnderage} />
      </main>
      <Footer />
      <FictionHelper selected="comic" />
    </div>
  )
}
