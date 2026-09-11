'use client'

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

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <BookQuiz onSelect={handleSelect} />
      </main>
      <Footer />
      <FictionHelper selected="comic" />
    </div>
  )
}
