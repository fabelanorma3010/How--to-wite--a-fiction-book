'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface FaqEntry {
  question: string
  answer: string
}

export default function PricingFaq() {
  const t = useTranslations('PricingFaq')
  const faqs = t.raw('items') as FaqEntry[]
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="mx-auto max-w-3xl">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i
        return (
          <div
            key={faq.question}
            className="mb-3 overflow-hidden rounded-2xl border-2 border-ink/10 bg-white/70 shadow-sm"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold text-ink"
            >
              {faq.question}
              <span
                aria-hidden="true"
                className={`shrink-0 text-xl text-ink/50 transition-transform ${isOpen ? 'rotate-45' : ''}`}
              >
                +
              </span>
            </button>
            {isOpen && <p className="animate-pop-in px-5 pb-4 text-ink/70">{faq.answer}</p>}
          </div>
        )
      })}
    </div>
  )
}
