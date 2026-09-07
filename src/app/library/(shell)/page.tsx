import type { Metadata } from 'next'
import Link from 'next/link'
import ShimmerNextImage from '../../../components/ShimmerNextImage'
import { getRecentPublicBooks } from '../../../lib/books'
import { bookTypeEmoji } from '../../../data/bookTypes'

export const metadata: Metadata = { title: 'Discover' }
export const dynamic = 'force-dynamic'

export default async function LibraryDiscoverPage() {
  const books = await getRecentPublicBooks(13)
  const [hero, ...rest] = books

  if (!hero) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-[16px] text-center md:px-[32px]">
        <span className="material-symbols-outlined text-6xl text-noir-on-surface-variant">auto_stories</span>
        <h1 className="font-noir-display text-[28px] font-bold text-noir-on-surface">No books published yet</h1>
        <p className="font-noir-mono text-[13px] text-noir-on-surface-variant">
          Once members upload a finished book from their account page, it&apos;ll show up here for everyone to
          discover.
        </p>
        <Link
          href="/account"
          className="mt-2 inline-flex items-center gap-2 rounded-[0.5rem] bg-noir-primary-fixed px-6 py-3 font-noir-display text-[16px] font-extrabold text-noir-on-primary-fixed transition-colors hover:bg-noir-primary-fixed-dim"
        >
          Publish your book
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden pb-[48px]">
      <div className="pt-[24px] md:pt-[32px]">
        <section className="mb-[48px] w-full">
          <div className="flex gap-4 overflow-x-auto px-[16px] pb-4 hide-scrollbar md:px-[32px]">
            <div className="group relative h-[480px] w-full shrink-0 overflow-hidden rounded-[0.75rem] border border-white/10 bg-noir-surface-container-low md:w-[85%] lg:w-[70%]">
              {hero.coverUrl ? (
                <ShimmerNextImage
                  alt={`${hero.title} cover`}
                  src={hero.coverUrl}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover opacity-70 mix-blend-lighten transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-8xl opacity-40">
                  {bookTypeEmoji(hero.bookType ?? '')}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 flex w-full flex-col justify-end p-[24px]">
                <div className="mb-3 flex gap-2">
                  <span className="rounded-[0.25rem] bg-noir-primary-fixed px-2 py-1 font-noir-mono text-[12px] uppercase tracking-wider text-noir-on-primary-fixed">
                    New
                  </span>
                </div>
                <h2 className="mb-2 font-noir-display text-[28px] font-extrabold uppercase leading-none tracking-tight text-noir-on-surface md:text-[48px]">
                  {hero.title}
                </h2>
                <p className="mb-6 max-w-2xl font-noir-reading text-[16px] text-noir-on-surface-variant">
                  By {hero.authorName}
                </p>
                <div>
                  <Link
                    href={`/library/book/${hero.id}`}
                    className="inline-flex items-center gap-2 rounded-[0.5rem] bg-noir-primary-fixed px-6 py-3 font-noir-display text-[16px] font-extrabold text-noir-on-primary-fixed transition-colors hover:bg-noir-primary-fixed-dim active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_arrow
                    </span>
                    View Book
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {rest.length > 0 && (
          <section className="mb-[48px] pl-[16px] md:pl-[32px]">
            <div className="mb-[8px] flex items-center justify-between pr-[16px] md:pr-[32px]">
              <h3 className="flex items-center gap-2 font-noir-display text-[20px] font-bold uppercase text-noir-on-surface md:text-[32px]">
                <span className="material-symbols-outlined text-noir-primary-fixed">auto_stories</span>
                Recently Published
              </h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 pr-[16px] hide-scrollbar md:pr-[32px]">
              {rest.map((book) => (
                <Link
                  href={`/library/book/${book.id}`}
                  key={book.id}
                  className="group flex w-40 shrink-0 flex-col gap-3 md:w-52"
                >
                  <div className="relative flex aspect-[2/3] w-full items-center justify-center overflow-hidden rounded-[0.5rem] border border-white/10 bg-noir-surface-container shadow-lg shadow-black/50 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-noir-primary-fixed">
                    {book.coverUrl ? (
                      <ShimmerNextImage
                        alt={book.title}
                        src={book.coverUrl}
                        fill
                        sizes="(min-width: 768px) 208px, 160px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-4xl opacity-60">{bookTypeEmoji(book.bookType ?? '')}</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                  </div>
                  <div>
                    <h4 className="line-clamp-1 font-noir-display text-[16px] font-semibold text-noir-on-surface group-hover:text-noir-primary-fixed">
                      {book.title}
                    </h4>
                    <p className="mt-1 font-noir-mono text-[11px] text-noir-on-surface-variant">
                      By {book.authorName}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
