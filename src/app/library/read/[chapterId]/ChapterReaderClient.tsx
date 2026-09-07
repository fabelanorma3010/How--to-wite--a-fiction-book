'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Chapter } from '@/lib/books'
import type { BookTypeId } from '@/data/bookTypes'

type ChapterData = Chapter & { bookTitle: string; bookType: BookTypeId | null }
type Sibling = { id: string; chapterNumber: number } | null

export default function ChapterReaderClient({
  chapter,
  prev,
  next,
}: {
  chapter: ChapterData
  prev: Sibling
  next: Sibling
}) {
  const [controlsVisible, setControlsVisible] = useState(true)
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    hideTimeout.current = setTimeout(() => setControlsVisible(false), 3000)
    return () => clearTimeout(hideTimeout.current)
  }, [])

  function handleCanvasClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('button, a, header, #reader-footer')) return
    setControlsVisible((v) => !v)
  }

  const isManga = chapter.bookType === 'manga'
  const pages = isManga ? [...chapter.pages].reverse() : chapter.pages

  return (
    <div className="min-h-screen bg-black text-noir-on-surface" onClick={handleCanvasClick}>
      <header
        className={`fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-noir-background/80 px-[16px] backdrop-blur-xl transition-transform duration-300 ease-in-out md:px-[32px] ${
          controlsVisible ? '' : '-translate-y-full'
        }`}
      >
        <Link
          href={`/library/book/${chapter.bookId}`}
          aria-label="Exit Reader"
          className="flex h-10 w-10 items-center justify-center rounded-full text-noir-on-surface-variant transition-colors hover:text-noir-primary-fixed"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 300" }}>
            arrow_back
          </span>
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="max-w-[200px] truncate font-noir-display text-[20px] text-noir-on-surface md:max-w-xs">
            {chapter.bookTitle}
          </h1>
          <span className="font-noir-mono text-[12px] text-noir-on-surface-variant">
            Chapter {chapter.chapterNumber}
            {chapter.title ? ` · ${chapter.title}` : ''}
          </span>
        </div>
        <span className="h-10 w-10" aria-hidden="true" />
      </header>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[800px] flex-col gap-[4px]">
        {pages.length === 0 ? (
          <p className="py-24 text-center font-noir-mono text-[13px] text-noir-on-surface-variant">
            This chapter has no pages yet.
          </p>
        ) : (
          pages.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src + i} className="h-auto w-full" alt={`Page ${i + 1}`} src={src} loading={i < 2 ? 'eager' : 'lazy'} />
          ))
        )}

        <div className="mx-[16px] mt-[24px] flex flex-col items-center justify-center gap-[8px] border-t border-white/10 py-[48px] md:mx-0">
          <span className="font-noir-display text-[28px] font-extrabold uppercase tracking-tighter text-noir-on-surface">
            {next ? 'Chapter Complete' : 'To Be Continued'}
          </span>
          <div className="mt-[8px] flex gap-[8px]">
            <Link
              href={`/library/book/${chapter.bookId}`}
              className="rounded-[0.125rem] border border-noir-secondary-fixed-dim px-6 py-3 font-noir-display text-[16px] font-bold uppercase text-noir-secondary-fixed-dim transition-colors hover:bg-noir-secondary-fixed-dim/10"
            >
              Back to Book
            </Link>
            {next && (
              <Link
                href={`/library/read/${next.id}`}
                className="rounded-[0.125rem] bg-noir-primary-fixed px-6 py-3 font-noir-display text-[16px] font-extrabold uppercase text-noir-on-primary transition-colors hover:bg-noir-primary-fixed-dim"
              >
                Next Chapter
              </Link>
            )}
          </div>
        </div>
      </main>

      <div
        id="reader-footer"
        className={`fixed bottom-[16px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-white/10 bg-noir-surface-container/90 px-6 py-2 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out ${
          controlsVisible ? '' : 'pointer-events-none translate-y-[150%] opacity-0'
        }`}
      >
        {prev ? (
          <Link
            href={`/library/read/${prev.id}`}
            aria-label="Previous Chapter"
            className="flex h-8 w-8 items-center justify-center text-noir-on-surface-variant transition-colors hover:text-noir-secondary-fixed-dim"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 300" }}>
              skip_previous
            </span>
          </Link>
        ) : (
          <span className="h-8 w-8" aria-hidden="true" />
        )}
        <div className="flex flex-col items-center border-l border-r border-white/10 px-4">
          <span className="mb-1 font-noir-mono text-[10px] leading-none text-noir-on-surface-variant">CHAPTER</span>
          <span className="font-noir-mono text-[12px] text-noir-primary-fixed">{chapter.chapterNumber}</span>
        </div>
        {next ? (
          <Link
            href={`/library/read/${next.id}`}
            aria-label="Next Chapter"
            className="flex h-8 w-8 items-center justify-center text-noir-on-surface-variant transition-colors hover:text-noir-secondary-fixed-dim"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 300" }}>
              skip_next
            </span>
          </Link>
        ) : (
          <span className="h-8 w-8" aria-hidden="true" />
        )}
      </div>
    </div>
  )
}
