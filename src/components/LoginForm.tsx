'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
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
      router.push('/')
      router.refresh()
    } catch {
      setError('Something went wrong signing you in.')
      setSubmitting(false)
    }
  }

  return (
    <section className="px-4 pb-16 sm:px-6">
      <div className="mx-auto max-w-md">
        <form
          onSubmit={handleSubmit}
          className="animate-pop-in rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8"
        >
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-bold text-ink/80">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              required
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

          <p className="mt-6 text-sm text-ink/60">
            New here?{' '}
            <Link href="/signup" className="font-bold text-ink underline underline-offset-2">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </section>
  )
}
