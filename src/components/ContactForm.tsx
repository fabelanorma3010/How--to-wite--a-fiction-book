'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Sticker from './Sticker'

const CONTACT_EMAIL = 'fabelanorma3010@gmail.com'

export default function ContactForm() {
  const t = useTranslations('Contact')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const subject = t('emailSubject', { name })
    const body = `${message}\n\n— ${name} (${email})`
    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    window.location.href = mailtoUrl
    setSent(true)
  }

  return (
    <section id="contact" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">{t('title')} 👋</h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink/70">{t('intro')}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="animate-pop-in relative rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8"
        >
          <Sticker emoji="👋" className="-top-2 -left-2 -rotate-12 sm:-top-4 sm:-left-4" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="mb-1.5 block text-sm font-bold text-ink/80">
                {t('name')}
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                className="w-full rounded-2xl border-2 border-ink/15 bg-base/80 px-4 py-2.5 text-ink placeholder:text-ink/40 focus:border-primary/50"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-1.5 block text-sm font-bold text-ink/80">
                {t('email')}
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border-2 border-ink/15 bg-base/80 px-4 py-2.5 text-ink placeholder:text-ink/40 focus:border-primary/50"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="contact-message" className="mb-1.5 block text-sm font-bold text-ink/80">
              {t('message')}
            </label>
            <textarea
              id="contact-message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('messagePlaceholder')}
              className="w-full resize-y rounded-2xl border-2 border-ink/15 bg-base/80 px-4 py-2.5 text-ink placeholder:text-ink/40 focus:border-primary/50"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              className="rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              {t('send')} 💌
            </button>
            {sent && (
              <p className="font-semibold text-secondary-content/80" role="status">
                {t('sent')}
              </p>
            )}
          </div>

          <p className="mt-4 text-xs text-ink/50">{t('disclaimer')}</p>
        </form>
      </div>
    </section>
  )
}
