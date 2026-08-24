'use client'

import { useState } from 'react'

const faqs = [
  {
    question: 'Will Storyburst always be free?',
    answer:
      "The quiz, generators, notebook, and publishing guide — everything on the Free tier today — stays free. If paid tiers ever launch for real, they'll add extras on top; nothing you can already use will move behind a paywall.",
  },
  {
    question: 'Do I need to make an account?',
    answer:
      "No. There's no sign-up anywhere on the site. Everything works the moment you land on the page.",
  },
  {
    question: "What happens to my notebook if I don't have an account?",
    answer:
      "Your notebook saves itself directly in your browser as you type — no account needed. That also means it's tied to this browser on this device: clearing your browser data will clear it too, and it won't follow you to a different device.",
  },
  {
    question: 'Are the Supporter and Studio tiers real?',
    answer:
      "Not yet — they're placeholder content showing what a future paid tier could look like. Nothing on this page is charging anyone anything right now.",
  },
]

export default function PricingFaq() {
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
            {isOpen && (
              <p className="animate-pop-in px-5 pb-4 text-ink/70">{faq.answer}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
