'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'

export default function SignUpForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }
    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue.')
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()
      if (!supabase) {
        setError('Sign-up is unavailable right now.')
        setSubmitting(false)
        return
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim(), agreed_to_terms: 'true' } },
      })
      if (error) {
        setError(error.message)
        setSubmitting(false)
        return
      }
      if (data.session) {
        router.push('/')
        router.refresh()
        return
      }
      // Email confirmation is on — no session yet.
      setCheckEmail(true)
      setSubmitting(false)
    } catch {
      setError('Something went wrong creating your account.')
      setSubmitting(false)
    }
  }

  if (checkEmail) {
    return (
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-md">
          <div className="animate-pop-in rounded-3xl border-2 border-ink/10 bg-white/70 p-6 text-center shadow-sm sm:p-8">
            <p className="text-2xl" aria-hidden="true">
              📬
            </p>
            <h2 className="mt-2 text-xl font-extrabold text-ink">Check your email</h2>
            <p className="mt-2 text-sm text-ink/70">
              We sent a confirmation link to <span className="font-bold">{email.trim()}</span>. Click it
              to finish setting up your account, then log in.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              Go to log in
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 pb-16 sm:px-6">
      <div className="mx-auto max-w-md">
        <form
          onSubmit={handleSubmit}
          className="animate-pop-in rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8"
        >
          <div>
            <label htmlFor="signup-name" className="mb-1.5 block text-sm font-bold text-ink/80">
              Name
            </label>
            <input
              id="signup-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl border-2 border-ink/15 bg-base/80 px-4 py-2.5 text-ink placeholder:text-ink/40 focus:border-primary/50"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="signup-email" className="mb-1.5 block text-sm font-bold text-ink/80">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border-2 border-ink/15 bg-base/80 px-4 py-2.5 text-ink placeholder:text-ink/40 focus:border-primary/50"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="signup-password" className="mb-1.5 block text-sm font-bold text-ink/80">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-2xl border-2 border-ink/15 bg-base/80 px-4 py-2.5 text-ink placeholder:text-ink/40 focus:border-primary/50"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="signup-confirm" className="mb-1.5 block text-sm font-bold text-ink/80">
              Confirm password
            </label>
            <input
              id="signup-confirm"
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type it again"
              className="w-full rounded-2xl border-2 border-ink/15 bg-base/80 px-4 py-2.5 text-ink placeholder:text-ink/40 focus:border-primary/50"
            />
          </div>

          <label className="mt-5 flex items-start gap-2.5 text-sm text-ink/70">
            <input
              type="checkbox"
              required
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-ink/30 accent-primary"
            />
            <span>
              I agree to the{' '}
              <Link href="/terms" target="_blank" className="font-bold text-ink underline underline-offset-2">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" target="_blank" className="font-bold text-ink underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          {error && (
            <p role="alert" className="mt-4 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={submitting || !agreed}
              className="rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {submitting ? 'Creating account…' : 'Create Account ✨'}
            </button>
          </div>

          <p className="mt-6 text-sm text-ink/60">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-ink underline underline-offset-2">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </section>
  )
}
