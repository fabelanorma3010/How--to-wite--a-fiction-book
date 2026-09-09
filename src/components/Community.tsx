'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { bookTypes, type BookTypeId } from '../data/bookTypes'
import {
  MAX_CONTENT_LENGTH,
  MAX_COMMENT_LENGTH,
  REPORT_REASONS,
  type CommunityPost,
  type PostComment,
  type ReportReason,
} from '../lib/community'
import { addComment, createPost, deleteComment, submitReport, toggleLike } from '../lib/communityActions'
import { createClient } from '../lib/supabase/client'
import Sticker from './Sticker'

interface AuthUser {
  id: string
  name: string
}

type Status = 'loading' | 'ready' | 'error'
type LikeState = { count: number; likedByMe: boolean }

const VALID_TYPES = new Set<string>(bookTypes.map((t) => t.id))

interface PostRow {
  id: string
  title: string | null
  body: string
  category: string | null
  published_at: string
  user_id: string
}

interface CommentRow {
  id: string
  post_id: string
  user_id: string
  body: string
  created_at: string
}

function toPost(row: PostRow, authorName: string): CommunityPost {
  return {
    id: row.id,
    authorId: row.user_id,
    authorName,
    bookType: (row.category && VALID_TYPES.has(row.category) ? row.category : 'comic') as BookTypeId,
    title: row.title,
    content: row.body,
    createdAt: row.published_at,
  }
}

export default function Community() {
  const t = useTranslations('Community')
  const bt = useTranslations('BookTypes')
  const locale = useLocale()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [likesByPost, setLikesByPost] = useState<Record<string, LikeState>>({})
  const [commentsByPost, setCommentsByPost] = useState<Record<string, PostComment[]>>({})
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState<Status>('loading')
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined)
  const [bookType, setBookType] = useState<BookTypeId>('comic')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    loadPosts()

    const supabase = createClient()
    if (!supabase) {
      setUser(null)
      return
    }
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user
      if (!u) {
        setUser(null)
        return
      }
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>
      const name = (meta.name as string) || (meta.full_name as string) || u.email || 'A writer'
      setUser({ id: u.id, name })
    })
    return () => sub.subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reads still go straight to Supabase from the browser (the feed loading
  // was never the part that broke); only the writes below go through Server
  // Actions in ../lib/communityActions, so a mutation runs server-side under
  // the caller's own session instead of directly from the client.
  async function loadPosts() {
    setStatus('loading')
    const supabase = createClient()
    if (!supabase) {
      setStatus('error')
      return
    }
    try {
      const { data: rows, error } = await supabase
        .from('posts')
        .select('id, title, body, category, published_at, user_id')
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .limit(50)
      if (error) throw error

      const currentUserId = (await supabase.auth.getUser()).data.user?.id ?? null
      const postRows = (rows ?? []) as PostRow[]
      const postIds = postRows.map((r) => r.id)

      const [likesRes, commentsRes] = await Promise.all([
        postIds.length
          ? supabase.from('post_likes').select('post_id, user_id').in('post_id', postIds)
          : Promise.resolve({ data: [] as { post_id: string; user_id: string }[] }),
        postIds.length
          ? supabase
              .from('post_comments')
              .select('id, post_id, user_id, body, created_at')
              .in('post_id', postIds)
              .order('created_at', { ascending: true })
          : Promise.resolve({ data: [] as CommentRow[] }),
      ])

      const likeRows = likesRes.data ?? []
      const commentRows = (commentsRes.data ?? []) as CommentRow[]

      const authorIds = new Set(postRows.map((r) => r.user_id))
      commentRows.forEach((c) => authorIds.add(c.user_id))
      const names = new Map<string, string>()
      if (authorIds.size) {
        const { data: profiles } = await supabase
          .from('public_profiles')
          .select('id, name')
          .in('id', [...authorIds])
        profiles?.forEach((p) => names.set(p.id as string, (p.name as string) ?? 'A writer'))
      }

      const nextLikes: Record<string, LikeState> = {}
      postIds.forEach((id) => (nextLikes[id] = { count: 0, likedByMe: false }))
      likeRows.forEach((row) => {
        const entry = nextLikes[row.post_id] ?? { count: 0, likedByMe: false }
        entry.count += 1
        if (currentUserId && row.user_id === currentUserId) entry.likedByMe = true
        nextLikes[row.post_id] = entry
      })

      const nextComments: Record<string, PostComment[]> = {}
      postIds.forEach((id) => (nextComments[id] = []))
      commentRows.forEach((row) => {
        const list = nextComments[row.post_id] ?? []
        list.push({
          id: row.id,
          postId: row.post_id,
          authorId: row.user_id,
          authorName: names.get(row.user_id) ?? 'A writer',
          body: row.body,
          createdAt: row.created_at,
        })
        nextComments[row.post_id] = list
      })

      setPosts(postRows.map((r) => toPost(r, names.get(r.user_id) ?? 'A writer')))
      setLikesByPost(nextLikes)
      setCommentsByPost(nextComments)
      setStatus('ready')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Community feed failed to load:', error)
      setStatus('error')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedContent = content.trim()
    if (!trimmedContent || submitting || !user) return

    setSubmitting(true)
    setSubmitError('')
    try {
      const result = await createPost({ title: title.trim() || null, body: trimmedContent, bookType })
      if ('error' in result) throw new Error(result.error)

      const newPost = toPost(result.post, user.name)
      setPosts((prev) => [newPost, ...prev])
      setLikesByPost((prev) => ({ ...prev, [newPost.id]: { count: 0, likedByMe: false } }))
      setCommentsByPost((prev) => ({ ...prev, [newPost.id]: [] }))
      setTitle('')
      setContent('')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Community post failed:', error)
      setSubmitError(error instanceof Error ? error.message : t('couldNotPost'))
    } finally {
      setSubmitting(false)
    }
  }

  function handleLikeToggled(postId: string, liked: boolean) {
    setLikesByPost((prev) => {
      const entry = prev[postId] ?? { count: 0, likedByMe: false }
      return { ...prev, [postId]: { count: entry.count + (liked ? 1 : -1), likedByMe: liked } }
    })
  }

  function handleCommentAdded(postId: string, comment: PostComment) {
    setCommentsByPost((prev) => ({ ...prev, [postId]: [...(prev[postId] ?? []), comment] }))
  }

  function handleCommentDeleted(postId: string, commentId: string) {
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (prev[postId] ?? []).filter((c) => c.id !== commentId),
    }))
  }

  return (
    <section id="community" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">{t('title')} 💬</h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink/70">{t('intro')}</p>
        </div>

        <div className="animate-pop-in relative rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8">
          <Sticker emoji="💬" className="-top-2 -right-2 rotate-12 sm:-top-4 sm:-right-4" />

          {user === undefined ? null : user ? (
            <form onSubmit={handleSubmit}>
              <p className="mb-4 text-center font-bold text-ink/70">
                <span aria-hidden="true">👋</span> {t('postingAs', { name: user.name })}
              </p>
              <div
                role="group"
                aria-label={t('bookTypeLabel')}
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
                      {bt(`types.${type.id}.name`)}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4">
                <label htmlFor="community-title" className="mb-1.5 block text-sm font-bold text-ink/80">
                  {t('titleField')} <span className="font-normal text-ink/40">{t('optional')}</span>
                </label>
                <input
                  id="community-title"
                  type="text"
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('titlePlaceholder')}
                  className="w-full rounded-2xl border-2 border-ink/15 bg-page/80 px-4 py-2.5 text-ink placeholder:text-ink/40 focus:border-primary/50"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="community-content" className="mb-1.5 block text-sm font-bold text-ink/80">
                  {t('contentField')}
                </label>
                <textarea
                  id="community-content"
                  required
                  rows={3}
                  maxLength={MAX_CONTENT_LENGTH}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('contentPlaceholder')}
                  className="w-full resize-y rounded-2xl border-2 border-ink/15 bg-page/80 p-4 text-ink placeholder:text-ink/40 focus:border-primary/50"
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
                  {submitting ? t('sharing') : `${t('share')} 💬`}
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
              {t.rich('loginPrompt', {
                login: (chunks) => (
                  <Link href="/login" className="font-bold text-ink underline underline-offset-2">
                    {chunks}
                  </Link>
                ),
                signup: (chunks) => (
                  <Link href="/signup" className="font-bold text-ink underline underline-offset-2">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          )}
        </div>

        <div className="mt-8 space-y-4">
          {status === 'loading' && (
            <p className="text-center font-semibold text-ink/50">{t('loading')}</p>
          )}

          {status === 'error' && (
            <div className="rounded-2xl border-2 border-ink/10 bg-white/60 p-6 text-center">
              <p className="font-semibold text-ink/60">⚠️ {t('loadError')}</p>
              <button
                type="button"
                onClick={loadPosts}
                className="mt-3 rounded-full border-2 border-ink/15 bg-white/70 px-4 py-2 font-bold text-ink transition-colors hover:bg-white"
              >
                {t('tryAgain')}
              </button>
            </div>
          )}

          {status === 'ready' && posts.length === 0 && (
            <p className="text-center font-semibold text-ink/50">{t('empty')}</p>
          )}

          {status === 'ready' &&
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                user={user}
                locale={locale}
                likeState={likesByPost[post.id] ?? { count: 0, likedByMe: false }}
                comments={commentsByPost[post.id] ?? []}
                expanded={Boolean(expandedPosts[post.id])}
                onToggleExpanded={() => setExpandedPosts((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                onLikeToggled={(liked) => handleLikeToggled(post.id, liked)}
                onCommentAdded={(comment) => handleCommentAdded(post.id, comment)}
                onCommentDeleted={(commentId) => handleCommentDeleted(post.id, commentId)}
              />
            ))}
        </div>
      </div>
    </section>
  )
}

function PostCard({
  post,
  user,
  locale,
  likeState,
  comments,
  expanded,
  onToggleExpanded,
  onLikeToggled,
  onCommentAdded,
  onCommentDeleted,
}: {
  post: CommunityPost
  user: AuthUser | null | undefined
  locale: string
  likeState: LikeState
  comments: PostComment[]
  expanded: boolean
  onToggleExpanded: () => void
  onLikeToggled: (liked: boolean) => void
  onCommentAdded: (comment: PostComment) => void
  onCommentDeleted: (commentId: string) => void
}) {
  const t = useTranslations('Community')
  const bt = useTranslations('BookTypes')
  const type = bookTypes.find((b) => b.id === post.bookType)
  const isOwnPost = user?.id === post.authorId

  const [likeBusy, setLikeBusy] = useState(false)
  const [likeError, setLikeError] = useState('')
  const [commentBody, setCommentBody] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [commentError, setCommentError] = useState('')

  const [reportOpen, setReportOpen] = useState(false)
  const [reportTargetCommentId, setReportTargetCommentId] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState<ReportReason>('spam')
  const [reportDetail, setReportDetail] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportError, setReportError] = useState('')
  const [reportSent, setReportSent] = useState(false)

  async function handleToggleLike() {
    if (!user || likeBusy) return
    setLikeBusy(true)
    setLikeError('')
    const nextLiked = !likeState.likedByMe
    onLikeToggled(nextLiked)
    try {
      const result = await toggleLike(post.id, nextLiked)
      if ('error' in result) throw new Error(result.error)
    } catch (error) {
      onLikeToggled(!nextLiked)
      // eslint-disable-next-line no-console
      console.error('Community like failed:', error)
      setLikeError(error instanceof Error ? error.message : t('couldNotLike'))
    } finally {
      setLikeBusy(false)
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    const body = commentBody.trim()
    if (!body || !user || commentSubmitting) return
    setCommentSubmitting(true)
    setCommentError('')
    try {
      const result = await addComment(post.id, body)
      if ('error' in result) throw new Error(result.error)
      onCommentAdded({
        id: result.comment.id,
        postId: result.comment.post_id,
        authorId: result.comment.user_id,
        authorName: user.name,
        body: result.comment.body,
        createdAt: result.comment.created_at,
      })
      setCommentBody('')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Community comment failed:', error)
      setCommentError(error instanceof Error ? error.message : t('couldNotComment'))
    } finally {
      setCommentSubmitting(false)
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm(t('deleteCommentConfirm'))) return
    onCommentDeleted(commentId)
    try {
      const result = await deleteComment(commentId)
      if ('error' in result) throw new Error(result.error)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Community comment delete failed:', error)
    }
  }

  function openReport(commentId: string | null) {
    setReportTargetCommentId(commentId)
    setReportReason('spam')
    setReportDetail('')
    setReportError('')
    setReportSent(false)
    setReportOpen(true)
  }

  async function handleSubmitReport(e: React.FormEvent) {
    e.preventDefault()
    if (!user || reportSubmitting) return
    setReportSubmitting(true)
    setReportError('')
    try {
      const result = await submitReport({
        postId: reportTargetCommentId ? null : post.id,
        commentId: reportTargetCommentId,
        reason: reportReason,
        detail: reportDetail.trim() || null,
      })
      if ('error' in result) throw new Error(result.error)
      setReportSent(true)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Community report failed:', error)
      setReportError(t('reportError'))
    } finally {
      setReportSubmitting(false)
    }
  }

  return (
    <div className="animate-pop-in rounded-2xl border-2 border-ink/10 bg-white/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-wide text-ink/40">
        <span>
          <span aria-hidden="true">{type?.emoji}</span> {post.authorName}
          {type ? ` · ${bt(`types.${type.id}.name`)}` : ''}
        </span>
        <span>{formatRelativeTime(post.createdAt, locale)}</span>
      </div>
      {post.title && <h3 className="mt-2 font-extrabold text-ink">{post.title}</h3>}
      <p className="mt-2 whitespace-pre-wrap text-ink/90">{post.content}</p>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
        <button
          type="button"
          onClick={() => void handleToggleLike()}
          disabled={!user || likeBusy}
          aria-pressed={likeState.likedByMe}
          className={`flex items-center gap-1.5 font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            likeState.likedByMe ? 'text-primary-content' : 'text-ink/50 hover:text-ink'
          }`}
        >
          <span aria-hidden="true">{likeState.likedByMe ? '❤️' : '🤍'}</span>
          {t('likeCount', { count: likeState.count })}
        </button>

        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex items-center gap-1.5 font-bold text-ink/50 transition-colors hover:text-ink"
        >
          <span aria-hidden="true">💬</span>
          {t('commentCount', { count: comments.length })}
        </button>

        {user && !isOwnPost && (
          <button
            type="button"
            onClick={() => openReport(null)}
            className="font-bold text-ink/40 transition-colors hover:text-ink/70"
          >
            {t('report')}
          </button>
        )}

        {likeError && (
          <p role="alert" className="w-full text-xs font-semibold text-red-600">
            {likeError}
          </p>
        )}
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t-2 border-ink/10 pt-3">
          {comments.length === 0 && <p className="text-xs font-semibold text-ink/40">{t('noComments')}</p>}
          {comments.map((comment) => {
            const canDelete = user && (user.id === comment.authorId || user.id === post.authorId)
            const canReport = user && user.id !== comment.authorId
            return (
              <div key={comment.id} className="rounded-xl bg-page/60 p-3">
                <div className="flex items-center justify-between gap-2 text-xs font-bold text-ink/50">
                  <span>
                    {comment.authorName} · {formatRelativeTime(comment.createdAt, locale)}
                  </span>
                  <span className="flex gap-2">
                    {canReport && (
                      <button
                        type="button"
                        onClick={() => openReport(comment.id)}
                        className="font-bold text-ink/30 hover:text-ink/60"
                      >
                        {t('report')}
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => void handleDeleteComment(comment.id)}
                        className="font-bold text-ink/30 hover:text-red-600"
                      >
                        {t('deleteComment')}
                      </button>
                    )}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink/90">{comment.body}</p>
              </div>
            )
          })}

          {user ? (
            <form onSubmit={handleAddComment} className="flex items-start gap-2">
              <textarea
                rows={1}
                maxLength={MAX_COMMENT_LENGTH}
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder={t('commentPlaceholder')}
                className="w-full resize-y rounded-xl border-2 border-ink/15 bg-white/80 px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-primary/50"
              />
              <button
                type="submit"
                disabled={!commentBody.trim() || commentSubmitting}
                className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-content disabled:cursor-not-allowed disabled:opacity-40"
              >
                {commentSubmitting ? t('postingComment') : t('postComment')}
              </button>
            </form>
          ) : (
            <p className="text-xs font-semibold text-ink/40">{t('signInToComment')}</p>
          )}
          {commentError && (
            <p role="alert" className="text-xs font-semibold text-red-600">
              {commentError}
            </p>
          )}
        </div>
      )}

      {reportOpen && (
        <div className="mt-4 rounded-xl border-2 border-ink/10 bg-page/60 p-4">
          {reportSent ? (
            <p className="text-sm font-bold text-ink/70">{t('reportSent')}</p>
          ) : (
            <form onSubmit={handleSubmitReport}>
              <p className="mb-2 text-sm font-extrabold text-ink">
                {reportTargetCommentId ? t('reportComment') : t('reportPost')}
              </p>
              <label className="mb-1 block text-xs font-bold text-ink/60">{t('reportReasonLabel')}</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value as ReportReason)}
                className="w-full rounded-lg border-2 border-ink/15 bg-white px-3 py-1.5 text-sm text-ink focus:border-primary/50"
              >
                {REPORT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {t(`reportReason_${reason}`)}
                  </option>
                ))}
              </select>
              <textarea
                rows={2}
                value={reportDetail}
                onChange={(e) => setReportDetail(e.target.value)}
                placeholder={t('reportDetailPlaceholder')}
                className="mt-2 w-full resize-y rounded-lg border-2 border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-primary/50"
              />
              {reportError && (
                <p role="alert" className="mt-2 text-xs font-semibold text-red-600">
                  {reportError}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={reportSubmitting}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-content disabled:opacity-60"
                >
                  {reportSubmitting ? t('reportSubmitting') : t('reportSubmit')}
                </button>
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="rounded-full px-4 py-2 text-sm font-bold text-ink/60 hover:bg-ink/10"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

function formatRelativeTime(iso: string, locale: string) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' })
  if (seconds < 60) return rtf.format(-seconds, 'second')
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return rtf.format(-minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (hours < 24) return rtf.format(-hours, 'hour')
  const days = Math.round(hours / 24)
  return rtf.format(-days, 'day')
}
