import type { Metadata } from 'next'
import Link from 'next/link'
import ShimmerNextImage from '../../../../components/ShimmerNextImage'
import { getCurrentUser } from '../../../../lib/user'
import { getFollowedUpdates } from '../../../../lib/books'
import { bookFormatEmoji } from '../../../../data/bookTypes'

export const metadata: Metadata = { title: 'Updates' }

// Reads the session, so it can't be statically rendered like its sibling
// (shell) routes.
export const dynamic = 'force-dynamic'

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'short' })
  if (seconds < 60) return rtf.format(-seconds, 'second')
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return rtf.format(-minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (hours < 24) return rtf.format(-hours, 'hour')
  const days = Math.round(hours / 24)
  if (days < 30) return rtf.format(-days, 'day')
  return rtf.format(-Math.round(days / 30), 'month')
}

export default async function UpdatesPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-[16px] py-[24px] md:px-[32px] md:py-[48px]">
        <div className="noir-glass-panel flex flex-col items-center gap-4 rounded-[0.75rem] border border-white/5 p-8 text-center">
          <span className="material-symbols-outlined text-[40px] text-noir-primary-container">
            notifications_active
          </span>
          <div>
            <h1 className="font-noir-display text-[24px] font-bold text-noir-on-surface">Updates</h1>
            <p className="mt-1 font-noir-mono text-[12px] text-noir-on-surface-variant">
              Sign in to see new chapters from writers you follow.
            </p>
          </div>
          <Link
            href="/login?next=/library/updates"
            className="rounded-full bg-noir-primary-fixed px-6 py-2.5 font-noir-display text-[14px] font-semibold text-noir-on-primary-fixed transition-transform hover:scale-105 active:scale-95"
          >
            Log in
          </Link>
        </div>
      </div>
    )
  }

  const updates = await getFollowedUpdates(user.id)

  return (
    <div className="mx-auto max-w-3xl px-[16px] py-[24px] md:px-[32px] md:py-[48px]">
      <h1 className="mb-[24px] font-noir-display text-[28px] font-bold text-noir-on-surface md:text-[48px]">
        Updates
      </h1>

      {updates.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-[48px] text-center">
          <span className="material-symbols-outlined text-6xl text-noir-on-surface-variant">
            notifications_active
          </span>
          <h2 className="font-noir-display text-[20px] font-bold text-noir-on-surface">No updates yet</h2>
          <p className="max-w-md font-noir-mono text-[13px] text-noir-on-surface-variant">
            Follow some writers and their new chapters will show up here.
          </p>
          <Link
            href="/library"
            className="mt-2 inline-flex items-center gap-2 rounded-[0.5rem] bg-noir-primary-fixed px-6 py-3 font-noir-display text-[16px] font-extrabold text-noir-on-primary-fixed transition-colors hover:bg-noir-primary-fixed-dim"
          >
            Browse Discover
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {updates.map((update) => (
            <Link
              href={`/library/read/${update.chapterId}`}
              key={update.chapterId}
              className="group flex items-center gap-4 rounded-[0.5rem] border border-transparent bg-noir-surface-container-low p-3 transition-colors hover:border-white/10 hover:bg-noir-surface-container"
            >
              <div className="relative flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-noir-surface-container">
                {update.coverUrl ? (
                  <ShimmerNextImage
                    alt={update.bookTitle}
                    src={update.coverUrl}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xl opacity-60">{bookFormatEmoji(update.bookType)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-noir-display text-[16px] text-noir-on-surface transition-colors group-hover:text-noir-primary">
                  {update.bookTitle}
                </h3>
                <span className="font-noir-mono text-[12px] text-noir-on-surface-variant">
                  Ch. {update.chapterNumber}
                  {update.chapterTitle ? `: ${update.chapterTitle}` : ''} · {update.authorName}
                </span>
              </div>
              <span className="shrink-0 font-noir-mono text-[12px] text-noir-on-surface-variant">
                {timeAgo(update.publishedAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
