import { useState } from 'react'
import type { AuthUser } from '../lib/auth'
import { MAX_NAME_LENGTH } from '../lib/community'

interface AuthPanelProps {
  user: AuthUser | null
  onUserChange: (user: AuthUser | null) => void
}

type Mode = 'signup' | 'login'

export default function AuthPanel({ user, onUserChange }: AuthPanelProps) {
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'signup' ? { email, password, displayName } : { email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      onUserChange(data.user)
      setPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      onUserChange(null)
      setLoggingOut(false)
    }
  }

  if (user) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-primary/30 bg-primary/10 px-4 py-3">
        <p className="font-bold text-ink">
          <span aria-hidden="true">👋</span> Posting as {user.displayName}
        </p>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-full border-2 border-ink/15 bg-white/70 px-3 py-1.5 text-sm font-bold text-ink transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loggingOut ? 'Logging out…' : 'Log Out'}
        </button>
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-2xl border-2 border-ink/10 bg-base/70 p-4 sm:p-5">
      <div className="mb-3 flex gap-2" role="group" aria-label="Sign up or log in">
        <button
          type="button"
          aria-pressed={mode === 'signup'}
          onClick={() => setMode('signup')}
          className={`rounded-full px-3 py-1.5 text-sm font-bold transition-colors ${
            mode === 'signup' ? 'bg-primary text-primary-content' : 'text-ink/60 hover:text-ink'
          }`}
        >
          Sign Up
        </button>
        <button
          type="button"
          aria-pressed={mode === 'login'}
          onClick={() => setMode('login')}
          className={`rounded-full px-3 py-1.5 text-sm font-bold transition-colors ${
            mode === 'login' ? 'bg-primary text-primary-content' : 'text-ink/60 hover:text-ink'
          }`}
        >
          Log In
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        {mode === 'signup' && (
          <div className="sm:col-span-2">
            <label htmlFor="auth-name" className="mb-1 block text-sm font-bold text-ink/80">
              Display name
            </label>
            <input
              id="auth-name"
              type="text"
              required
              maxLength={MAX_NAME_LENGTH}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Storyteller123"
              className="w-full rounded-2xl border-2 border-ink/15 bg-white/80 px-4 py-2 text-ink placeholder:text-ink/40 focus:border-primary/50"
            />
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className="mb-1 block text-sm font-bold text-ink/80">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-2xl border-2 border-ink/15 bg-white/80 px-4 py-2 text-ink placeholder:text-ink/40 focus:border-primary/50"
          />
        </div>

        <div>
          <label htmlFor="auth-password" className="mb-1 block text-sm font-bold text-ink/80">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={mode === 'signup' ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
            className="w-full rounded-2xl border-2 border-ink/15 bg-white/80 px-4 py-2 text-ink placeholder:text-ink/40 focus:border-primary/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-primary px-6 py-2.5 font-bold text-primary-content shadow-md transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Log In'}
          </button>
          {error && (
            <p className="font-bold text-ink" role="alert">
              <span aria-hidden="true">⚠️</span> {error}
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
