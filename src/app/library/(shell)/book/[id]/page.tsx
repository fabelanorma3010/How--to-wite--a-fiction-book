import type { Metadata } from 'next'
import Link from 'next/link'
import { getBookById, getBookChapters } from '@/lib/books'
import { getPublicProfileById } from '@/lib/publicProfile'
import { isBookSaved } from '@/lib/savedBooks'
import { getCurrentUser } from '@/lib/user'
import { bookFormatEmoji } from '@/data/bookTypes'
import ReadAloud from '@/components/ReadAloud'
import ShimmerNextImage from '@/components/ShimmerNextImage'
import SaveToLibraryButton from '@/components/SaveToLibraryButton'
import DownloadBookButton from '@/components/DownloadBookButton'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const book = await getBookById(id)
  return { title: book?.title ?? 'Book' }
}

export default async function RealBookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const book = await getBookById(id)

  if (!book) {
    return (
      <div className="mx-auto max-w-2xl px-[16px] py-[64px] text-center md:px-[32px]">
        <p className="font-noir-display text-[20px] text-noir-on-surface">This book isn&apos;t available.</p>
        <Link href="/library" className="mt-4 inline-block text-noir-secondary-fixed-dim underline">
          Back to Discover
        </Link>
      </div>
    )
  }

  const [chapters, author, currentUser] = await Promise.all([
    getBookChapters(book.id),
    getPublicProfileById(book.userId),
    getCurrentUser(),
  ])
  const saved = await isBookSaved(book.id, currentUser?.id ?? null)

  return (
    <div className="relative pb-[48px]">
      <div className="pt-[24px] md:pt-[32px]">
        <div className="mx-auto max-w-7xl px-[16px] md:px-[32px]">
          <div className="grid grid-cols-1 items-start gap-[48px] md:grid-cols-12">
            <div className="flex flex-col items-center md:col-span-4 md:items-start">
              <div className="relative flex aspect-[2/3] w-2/3 items-center justify-center overflow-hidden rounded-[0.5rem] border border-white/10 bg-noir-surface-container shadow-[0_20px_50px_rgba(0,0,0,0.7)] md:w-full">
                {book.coverUrl ? (
                  <ShimmerNextImage
                    alt={`${book.title} cover`}
                    src={book.coverUrl}
                    fill
                    priority
                    sizes="(min-width: 768px) 33vw, 66vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-6xl">{bookFormatEmoji(book.bookType)}</span>
                )}
              </div>
            </div>

            <div className="flex flex-col pt-4 md:col-span-8 md:pt-0">
              {book.bookType && (
                <div className="mb-[8px] flex flex-wrap gap-2">
                  <span className="rounded-[0.25rem] border border-white/10 bg-noir-surface-container px-3 py-1 font-noir-mono text-[12px] uppercase tracking-wider text-noir-on-surface-variant">
                    {book.bookType === 'chapterbook' ? '📗 Chapter book' : `${bookFormatEmoji(book.bookType)} ${book.bookType}`}
                  </span>
                </div>
              )}

              <h1 className="noir-text-gradient mb-2 font-noir-display text-[28px] font-extrabold md:text-[48px]">
                {book.title}
              </h1>
              {author && (
                <Link
                  href={`/u/${author.username}`}
                  className="mb-6 font-noir-display text-[20px] text-noir-on-surface-variant hover:text-noir-secondary-fixed-dim"
                >
                  By {author.name}
                </Link>
              )}

              {book.description && (
                <div className="mb-[48px]">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h3 className="font-noir-display text-[20px] font-semibold text-noir-on-surface">Description</h3>
                    <ReadAloud
                      text={book.description}
                      label="Read description"
                      className="rounded-[0.25rem] border border-white/10 bg-noir-surface-container px-3 py-1 font-noir-mono text-[11px] uppercase tracking-wider text-noir-on-surface-variant transition-colors hover:border-noir-secondary-fixed-dim/50 hover:text-noir-secondary-fixed-dim disabled:cursor-not-allowed disabled:opacity-40"
                    />
                  </div>
                  <p className="max-w-3xl font-noir-display text-[16px] leading-relaxed text-noir-on-surface-variant">
                    {book.description}
                  </p>
                </div>
              )}

              <div className="mt-auto flex flex-col gap-4 sm:flex-row">
                {chapters.length > 0 ? (
                  <Link
                    href={`/library/read/${chapters[0].id}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-noir-primary-fixed px-8 py-4 font-noir-display text-[20px] font-bold text-noir-on-primary-fixed shadow-[0_0_20px_rgba(255,225,109,0.2)] transition-colors hover:bg-noir-primary-fixed-dim active:scale-95 sm:flex-none"
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      menu_book
                    </span>
                    Read Chapter 1
                  </Link>
                ) : book.fileUrl ? (
                  <a
                    href={book.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-noir-primary-fixed px-8 py-4 font-noir-display text-[20px] font-bold text-noir-on-primary-fixed shadow-[0_0_20px_rgba(255,225,109,0.2)] transition-colors hover:bg-noir-primary-fixed-dim active:scale-95 sm:flex-none"
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      menu_book
                    </span>
                    Read the full book
                  </a>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <SaveToLibraryButton viewerId={currentUser?.id ?? null} bookId={book.id} initialSaved={saved} />
                <DownloadBookButton book={{ title: book.title, description: book.description }} chapters={chapters} />
              </div>
            </div>
          </div>

          <div className="my-[48px] h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="mb-6 font-noir-display text-[28px] font-bold text-noir-on-surface">Chapters</h2>
              {chapters.length === 0 ? (
                <p className="font-noir-mono text-[13px] text-noir-on-surface-variant">
                  No chapters published yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {chapters.map((chapter) => (
                    <Link
                      href={`/library/read/${chapter.id}`}
                      key={chapter.id}
                      className="group relative flex items-center justify-between overflow-hidden rounded-[0.5rem] border border-transparent bg-noir-surface-container p-4 transition-colors hover:border-white/5 hover:bg-noir-surface-bright"
                    >
                      <div className="z-10 flex items-center gap-4">
                        <span className="w-16 font-noir-mono text-[12px] text-noir-on-surface-variant">
                          CH {chapter.chapterNumber}
                        </span>
                        <span className="font-noir-display text-[16px] text-noir-on-surface transition-colors group-hover:text-noir-primary-fixed">
                          {chapter.title || `Chapter ${chapter.chapterNumber}`}
                        </span>
                      </div>
                      <span className="z-10 font-noir-mono text-[12px] text-noir-on-surface-variant">
                        {chapter.body
                          ? `${chapter.body.trim().split(/\s+/).length} words`
                          : `${chapter.pages.length} pages`}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {author && (
              <div className="lg:col-span-1">
                <div className="h-full rounded-[0.75rem] border border-white/5 bg-noir-surface-container-low p-6">
                  <h3 className="mb-6 font-noir-mono text-[12px] uppercase tracking-wider text-noir-on-surface-variant">
                    About the Creator
                  </h3>
                  <div className="mb-4 flex items-center gap-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full bg-noir-surface-bright">
                      {author.avatarUrl ? (
                        <ShimmerNextImage
                          alt={author.name}
                          src={author.avatarUrl}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-bold text-noir-on-surface-variant">
                          {author.name[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-noir-display text-[20px] font-semibold text-noir-on-surface">
                        {author.name}
                      </h4>
                      <p className="font-noir-display text-[14px] text-noir-on-surface-variant">
                        @{author.username}
                      </p>
                    </div>
                  </div>
                  {author.bio && (
                    <p className="mb-6 font-noir-display text-[14px] text-noir-on-surface-variant">{author.bio}</p>
                  )}
                  <Link
                    href={`/u/${author.username}`}
                    className="block w-full rounded-[0.375rem] border border-white/10 py-3 text-center font-noir-mono text-[12px] text-noir-on-surface transition-colors hover:bg-white/5"
                  >
                    View Creator Profile
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
