'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { bookTypes, type BookTypeId } from '../data/bookTypes'
import { MAX_CONTENT_LENGTH, type CommunityPost } from '../lib/community'
import Sticker from './Sticker'

interface AuthUser {
  id: string
  name: string
  email: string
}

type Status = 'loading' | 'ready' | 'error'

export default function Community() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined)
  const [bookType, setBookType] = useState<BookTypeId>('comic')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    loadPosts()
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadPosts() {
    setStatus('loading')
    try {
      const res = await fetch('/api/community')
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      setPosts(Array.isArray(data.posts) ? data.posts : [])
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || submitting || !user) return

    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookType, content: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not post.')
      setPosts((prev) => [data.post, ...prev])
      setContent('')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not post.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="community" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Storyburst Community 💬</h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink/70">
            Share a line, a prompt, or an idea you're proud of — and see what other writers
            and artists are working on right now.
          </p>
        </div>

        <div className="animate-pop-in relative rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8">
          <Sticker emoji="💬" className="-top-2 -right-2 rotate-12 sm:-top-4 sm:-right-4" />

          {user === undefined ? null : user ? (
            <form onSubmit={handleSubmit}>
              <p className="mb-4 text-center font-bold text-ink/70">
                <span aria-hidden="true">👋</span> Posting as {user.name}
              </p>
              <div
                role="group"
                aria-label="Book type for your post"
                className="flex flex-wrap items-center justify-center gap-2"
              >
                {bookTypes.map((type) => {
                  const isActive = type.id === bookType
                  return (
                    <button
                      key={type.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setBookType(type.id)}
                      className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-bold transition-all ${
                        isActive
                          ? 'border-secondary bg-secondary text-secondary-content'
                          : 'border-ink/15 bg-white/70 text-ink/60 hover:border-secondary/50 hover:text-ink'
                      }`}
                    >
                      <span aria-hidden="true">{type.emoji}</span>
                      {type.name}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4">
                <label htmlFor="community-content" className="mb-1.5 block text-sm font-bold text-ink/80">
                  What are you working on?
                </label>
                <textarea
                  id="community-content"
                  required
                  rows={3}
                  maxLength={MAX_CONTENT_LENGTH}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share a line of dialogue, a plot twist, or an idea you're proud of..."
                  className="w-full resize-y rounded-2xl border-2 border-ink/15 bg-base/80 p-4 text-ink placeholder:text-ink/40 focus:border-primary/50"
                />
                <p className="mt-1 text-right text-xs text-ink/40">
                  {content.length}/{MAX_CONTENT_LENGTH}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={!content.trim() || submitting}
                  className="rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? 'Sharing…' : 'Share with the Community 💬'}
                </button>
                {submitError && (
                  <p className="font-bold text-ink" role="alert">
                    ⚠️ {submitError}
                  </p>
                )}
              </div>
            </form>
          ) : (
            <p className="text-center font-semibold text-ink/70">
              <Link href="/login" className="font-bold text-ink underline underline-offset-2">
                Log in
              </Link>{' '}
              or{' '}
              <Link href="/signup" className="font-bold text-ink underline underline-offset-2">
                sign up
              </Link>{' '}
              to share with the community.
            </p>
          )}
        </div>

        <div className="mt-8 space-y-4">
          {status === 'loading' && (
            <p className="text-center font-semibold text-ink/50">Loading community posts…</p>
          )}

          {status === 'error' && (
            <div className="rounded-2xl border-2 border-ink/10 bg-white/60 p-6 text-center">
              <p className="font-semibold text-ink/60">⚠️ Couldn't load the community wall right now.</p>
              <button
                type="button"
                onClick={loadPosts}
                className="mt-3 rounded-full border-2 border-ink/15 bg-white/70 px-4 py-2 font-bold text-ink transition-colors hover:bg-white"
              >
                Try Again
              </button>
            </div>
          )}

          {status === 'ready' && posts.length === 0 && (
            <p className="text-center font-semibold text-ink/50">No posts yet — be the first to share! ✨</p>
          )}

          {status === 'ready' &&
            posts.map((post) => {
              const type = bookTypes.find((t) => t.id === post.bookType)
              return (
                <div key={post.id} className="animate-pop-in rounded-2xl border-2 border-ink/10 bg-white/70 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-wide text-ink/40">
                    <span>
                      <span aria-hidden="true">{type?.emoji}</span> {post.name}
                      {type ? ` · ${type.name}` : ''}
                    </span>
                    <span>{formatRelativeTime(post.createdAt)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-ink/90">{post.content}</p>
                </div>
              )
            })}
        </div>
      </div>
    </section>
  )
}

function formatRelativeTime(iso: string) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}
