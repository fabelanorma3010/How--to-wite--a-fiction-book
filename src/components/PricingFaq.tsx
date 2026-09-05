'use client'

import { useState } from 'react'

const faqs = [
  {
    question: 'Will the Free tier always be free?',
    answer:
      "Yes. Everything on the Free tier today — the quiz, generators, notebook, AI helper, writing tools, and publishing guide — stays free. Membership adds extras on top; nothing you can already use will move behind a paywall.",
  },
  {
    question: 'Can I sign up for Membership yet?',
    answer:
      "Not quite — billing is still being built. Once it launches you'll be able to upgrade from your account page. Everything listed under Membership is free to use in the meantime.",
  },
  {
    question: 'Monthly or annual?',
    answer:
      "Both, once Membership is live. Annual works out to about two months free versus paying monthly, and you'll be able to switch between them anytime.",
  },
  {
    question: 'Do I need to make an account?',
    answer:
      'Not for the tools — the quiz, generators, notebook, AI helper, and writing tools all work the moment you land on the page. A free account (email and password, or "Continue with Google") lets you post to the community wall, sync your notebook across devices, and set up a public creator profile.',
  },
  {
    question: "What happens to my notebook if I don't have an account?",
    answer:
      "Your notebook saves itself directly in your browser as you type — no account needed. That also means it's tied to this browser on this device: clearing your browser data will clear it too, and it won't follow you to a different device. Sign in and it syncs to your account instead.",
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
