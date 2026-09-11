'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import FictionHelper from '../../components/FictionHelper'
import BookTypes from '../../components/BookTypes'
import type { BookTypeId } from '../../data/bookTypes'

export default function BookTypesPageClient({ initialType }: { initialType: BookTypeId }) {
  const [type, setType] = useState<BookTypeId>(initialType)
  const c = useTranslations('Common')
  const h = useTranslations('Header')

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <BookTypes selected={type} onSelect={setType} />
        <div className="px-4 pb-16 text-center sm:px-6">
          <Link
            href={`/action-generator?type=${type}`}
            className="inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95"
          >
            {c('continueTo', { name: h('actionText') })}
          </Link>
        </div>
      </main>
      <Footer />
      <FictionHelper selected={type} />
    </div>
  )
}
