'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ShimmerNextImage from '../../../../components/ShimmerNextImage'
import { bookFormatEmoji } from '../../../../data/bookTypes'
import type { SavedBook } from '../../../../lib/savedBooks'

function useBookSearch() {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q')
    if (q) setQuery(q)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (query.trim()) params.set('q', query.trim())
    else params.delete('q')
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname)
  }, [query])

  return [query, setQuery] as const
}

export default function MyLibraryClient({ savedBooks }: { savedBooks: SavedBook[] }) {
  const [query, setQuery] = useBookSearch()

  const q = query.trim().toLowerCase()
  const filtered = useMemo(
    () => (q ? savedBooks.filter((book) => book.title.toLowerCase().includes(q)) : savedBooks),
    [savedBooks, q],
  )

  return (
    <div className="mx-auto max-w-7xl px-[16px] py-[24px] md:px-[32px] md:py-[48px]">
      <h1 className="mb-[24px] font-noir-display text-[28px] font-bold text-noir-on-surface md:text-[48px]">
        My Library
      </h1>

      {savedBooks.length > 0 && (
        <div className="mb-[24px]">
          <div className="relative max-w-md">
            <span
              aria-hidden="true"
              className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-noir-on-surface-variant"
            >
              search
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your saved books…"
              aria-label="Search your saved books by title"
              className="w-full rounded-[0.5rem] border border-noir-outline-variant/40 bg-noir-surface-container-low py-2.5 pl-10 pr-9 font-noir-display text-[14px] text-noir-on-surface placeholder:text-noir-on-surface-variant/60 focus:border-noir-primary-container focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-noir-on-surface-variant transition-colors hover:bg-white/5 hover:text-noir-on-surface"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {savedBooks.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-[48px] text-center">
          <span className="material-symbols-outlined text-6xl text-noir-on-surface-variant">bookmark</span>
          <h2 className="font-noir-display text-[20px] font-bold text-noir-on-surface">Nothing saved yet</h2>
          <p className="max-w-md font-noir-mono text-[13px] text-noir-on-surface-variant">
            Tap &ldquo;Add to Library&rdquo; on any book to save it here for later.
          </p>
          <Link
            href="/library"
            className="mt-2 inline-flex items-center gap-2 rounded-[0.5rem] bg-noir-primary-fixed px-6 py-3 font-noir-display text-[16px] font-extrabold text-noir-on-primary-fixed transition-colors hover:bg-noir-primary-fixed-dim"
          >
            Browse Discover
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className="animate-slide-in py-[48px] text-center font-noir-mono text-[13px] text-noir-on-surface-variant">
          No books match &ldquo;{query.trim()}&rdquo;.
        </p>
      ) : (
        <div className="animate-slide-in grid grid-cols-2 gap-[16px] md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-[24px]">
          {filtered.map((book) => (
            <Link
              href={`/library/book/${book.id}`}
              key={book.id}
              className="group relative flex flex-col overflow-hidden rounded-[0.125rem] border border-white/10 bg-noir-surface-container-low transition-colors duration-300 hover:border-noir-primary-container"
            >
              <div className="relative flex aspect-[2/3] w-full items-center justify-center bg-noir-surface-container">
                {book.coverUrl ? (
                  <ShimmerNextImage
                    alt={book.title}
                    src={book.coverUrl}
                    fill
                    sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <span className="text-4xl opacity-60">{bookFormatEmoji(book.bookType)}</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                <div className="absolute bottom-0 left-0 flex w-full flex-col justify-end p-3">
                  <h3 className="line-clamp-2 font-noir-display text-[16px] font-semibold leading-tight text-noir-on-surface">
                    {book.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
