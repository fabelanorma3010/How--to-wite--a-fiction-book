'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUpForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords don\'t match.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Something went wrong creating your account.')
        setSubmitting(false)
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      setError('Something went wrong creating your account.')
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
