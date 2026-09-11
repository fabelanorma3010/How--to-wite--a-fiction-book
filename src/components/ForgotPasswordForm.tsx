'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '../lib/supabase/client'

export default function ForgotPasswordForm() {
  const t = useTranslations('ForgotPasswordForm')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const supabase = createClient()
      if (!supabase) {
        setError(t('unavailable'))
        setSubmitting(false)
        return
      }
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
      if (error) {
        setError(error.message)
        setSubmitting(false)
        return
      }
      setSent(true)
      setSubmitting(false)
    } catch {
      setError(t('genericError'))
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-md">
          <div className="animate-pop-in rounded-3xl border-2 border-ink/10 bg-white/70 p-6 text-center shadow-sm sm:p-8">
            <p className="text-2xl" aria-hidden="true">
              📬
            </p>
            <h2 className="mt-2 text-xl font-extrabold text-ink">{t('checkEmailTitle')}</h2>
            <p className="mt-2 text-sm text-ink/70">
              {t.rich('checkEmailBody', {
                email: () => <span className="font-bold">{email.trim()}</span>,
              })}
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              {t('goToLogin')}
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 pb-16 sm:px-6">
      <div className="mx-auto max-w-md">
        <div className="animate-pop-in rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8">
          <p className="text-sm text-ink/70">{t('intro')}</p>

          <form onSubmit={handleSubmit} className="mt-5">
            <div>
              <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-bold text-ink/80">
                {t('email')}
              </label>
              <input
                id="forgot-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border-2 border-ink/15 bg-page/80 px-4 py-2.5 text-ink placeholder:text-ink/40 focus:border-primary/50"
              />
            </div>

            {error && (
              <p role="alert" className="mt-4 text-sm font-semibold text-red-600">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {submitting ? t('submitting') : t('submit')}
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-ink/60">
            {t.rich('backToLogin', {
              login: (chunks) => (
                <Link href="/login" className="font-bold text-ink underline underline-offset-2">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </div>
    </section>
  )
}
