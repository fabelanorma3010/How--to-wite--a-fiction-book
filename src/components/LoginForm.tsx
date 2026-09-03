'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '../lib/supabase/client'
import GoogleButton from './GoogleButton'

function safeNext(raw: string | null): string {
  return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = safeNext(searchParams.get('next'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(searchParams.get('error'))
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const supabase = createClient()
      if (!supabase) {
        setError('Log in is unavailable right now.')
        setSubmitting(false)
        return
      }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) {
        setError(
          error.message === 'Email not confirmed'
            ? 'Please confirm your email first — check your inbox for the link.'
            : error.message,
        )
        setSubmitting(false)
        return
      }
      router.push(next)
      router.refresh()
    } catch {
      setError('Something went wrong signing you in.')
      setSubmitting(false)
    }
  }

  return (
    <section className="px-4 pb-16 sm:px-6">
      <div className="mx-auto max-w-md">
        <div className="animate-pop-in rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8">
          <GoogleButton next={next} />

          <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-ink/40">
            <span className="h-px flex-1 bg-ink/10" />
            or
            <span className="h-px flex-1 bg-ink/10" />
          </div>

          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-bold text-ink/80">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border-2 border-ink/15 bg-base/80 px-4 py-2.5 text-ink placeholder:text-ink/40 focus:border-primary/50"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-bold text-ink/80">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full rounded-2xl border-2 border-ink/15 bg-base/80 px-4 py-2.5 text-ink placeholder:text-ink/40 focus:border-primary/50"
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
                {submitting ? 'Logging in…' : 'Log In 🔑'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-ink/60">
            New here?{' '}
            <Link href="/signup" className="font-bold text-ink underline underline-offset-2">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
