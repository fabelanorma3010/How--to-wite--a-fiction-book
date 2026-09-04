'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import GoogleButton from '@/components/GoogleButton'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const supabase = createClient()
      if (!supabase) {
        setError('Sign-in is unavailable right now.')
        setSubmitting(false)
        return
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setSubmitting(false)
        return
      }
      router.push('/admin')
      router.refresh()
    } catch {
      setError('Sign-in is unavailable right now.')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center">
      <h1 className="mb-1 text-2xl font-extrabold text-ink">Admin sign in</h1>
      <p className="mb-6 text-sm text-ink/60">Restricted to Storyburst administrators.</p>

      <div className="rounded-2xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm">
        <GoogleButton next="/admin" />

        <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-ink/40">
          <span className="h-px flex-1 bg-ink/10" />
          or
          <span className="h-px flex-1 bg-ink/10" />
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-email" className="mb-1.5 block text-sm font-bold text-ink/80">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border-2 border-ink/15 bg-base/80 px-4 py-2.5 text-ink focus:border-primary/50"
          />

          <label htmlFor="admin-password" className="mb-1.5 mt-4 block text-sm font-bold text-ink/80">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border-2 border-ink/15 bg-base/80 px-4 py-2.5 text-ink focus:border-primary/50"
          />

          {error && (
            <p role="alert" className="mt-4 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-ink/40">
        Not an admin?{' '}
        <a href="/login" className="font-semibold underline underline-offset-2">
          Sign in to the main site
        </a>
      </p>
    </div>
  )
}
