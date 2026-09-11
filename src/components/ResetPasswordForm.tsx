'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '../lib/supabase/client'

type Status = 'checking' | 'ready' | 'noSession' | 'done'

export default function ResetPasswordForm() {
  const t = useTranslations('ResetPasswordForm')
  const [status, setStatus] = useState<Status>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) {
      setStatus('noSession')
      return
    }
    supabase.auth.getUser().then(({ data }) => setStatus(data.user ? 'ready' : 'noSession'))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError(t('tooShort'))
      return
    }
    if (password !== confirm) {
      setError(t('passwordMismatch'))
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()
      if (!supabase) {
        setError(t('unavailable'))
        setSubmitting(false)
        return
      }
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message)
        setSubmitting(false)
        return
      }
      setStatus('done')
    } catch {
      setError(t('genericError'))
      setSubmitting(false)
    }
  }

  if (status === 'checking') return null

  if (status === 'noSession') {
    return (
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-md">
          <div className="animate-pop-in rounded-3xl border-2 border-ink/10 bg-white/70 p-6 text-center shadow-sm sm:p-8">
            <p className="text-2xl" aria-hidden="true">
              ⌛
            </p>
            <h2 className="mt-2 text-xl font-extrabold text-ink">{t('expiredTitle')}</h2>
            <p className="mt-2 text-sm text-ink/70">{t('expiredBody')}</p>
            <Link
              href="/forgot-password"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              {t('requestNewLink')}
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (status === 'done') {
    return (
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-md">
          <div className="animate-pop-in rounded-3xl border-2 border-ink/10 bg-white/70 p-6 text-center shadow-sm sm:p-8">
            <p className="text-2xl" aria-hidden="true">
              ✅
            </p>
            <h2 className="mt-2 text-xl font-extrabold text-ink">{t('doneTitle')}</h2>
            <p className="mt-2 text-sm text-ink/70">{t('doneBody')}</p>
            <Link
              href="/account"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              {t('goToAccount')}
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
              <label htmlFor="reset-password" className="mb-1.5 block text-sm font-bold text-ink/80">
                {t('newPassword')}
              </label>
              <input
                id="reset-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                className="w-full rounded-2xl border-2 border-ink/15 bg-page/80 px-4 py-2.5 text-ink placeholder:text-ink/40 focus:border-primary/50"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="reset-confirm" className="mb-1.5 block text-sm font-bold text-ink/80">
                {t('confirmPassword')}
              </label>
              <input
                id="reset-confirm"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={t('confirmPlaceholder')}
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
        </div>
      </div>
    </section>
  )
}
