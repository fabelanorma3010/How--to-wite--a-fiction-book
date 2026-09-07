'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Chapter, BookFormat } from '@/lib/books'
import { parseChapterBody } from '@/lib/parseChapterBody'

type ChapterData = Chapter & { bookTitle: string; bookType: BookFormat | null }
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
  const router = useRouter()
  const [controlsVisible, setControlsVisible] = useState(true)
  const [pageIndex, setPageIndex] = useState(0)
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isText = Boolean(chapter.body)

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
  // One extra "slide" past the real pages for the Chapter Complete / To Be
  // Continued card, so "next" walks through the whole chapter in one motion.
  const totalSlides = pages.length + 1
  const onEndCard = pageIndex >= pages.length

  function goNext() {
    if (pageIndex < totalSlides - 1) {
      setPageIndex((i) => i + 1)
    } else if (next) {
      router.push(`/library/read/${next.id}`)
    }
  }

  function goPrev() {
    if (pageIndex > 0) {
      setPageIndex((i) => i - 1)
    } else if (prev) {
      router.push(`/library/read/${prev.id}`)
    }
  }

  useEffect(() => {
    if (isText || pages.length === 0) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pages.length, next, prev, isText])

  const endCard = (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-[8px] px-[16px] text-center">
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
  )

  return (
    <div
      className={`min-h-screen ${isText ? 'bg-noir-surface text-noir-on-surface' : 'bg-black text-noir-on-surface'}`}
      onClick={handleCanvasClick}
    >
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

      {isText ? (
        <main className="relative z-10 mx-auto min-h-screen w-full max-w-[680px] px-[24px] pb-[64px] pt-[104px]">
          {chapter.title && (
            <h2 className="mb-8 font-noir-display text-[28px] font-extrabold text-noir-on-surface">
              {chapter.title}
            </h2>
          )}
          {parseChapterBody(chapter.body ?? '').map((block, i) =>
            block.kind === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={block.src}
                alt={block.alt}
                className="my-8 w-full rounded-[0.5rem] border border-white/10"
              />
            ) : (
              <p
                key={i}
                className="mb-6 whitespace-pre-wrap font-noir-reading text-[18px] leading-[1.8] text-noir-on-surface"
              >
                {block.text}
              </p>
            ),
          )}

          <div className="mt-[24px] border-t border-white/10 py-[48px]">{endCard}</div>
        </main>
      ) : (
        <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[900px] items-center justify-center">
          {pages.length === 0 ? (
            <p className="py-24 text-center font-noir-mono text-[13px] text-noir-on-surface-variant">
              This chapter has no pages yet.
            </p>
          ) : onEndCard ? (
            endCard
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={pageIndex}
              src={pages[pageIndex]}
              alt={`Page ${pageIndex + 1}`}
              className="max-h-screen w-full object-contain"
            />
          )}
        </main>
      )}

      <div
        id="reader-footer"
        className={`fixed bottom-[16px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-white/10 bg-noir-surface-container/90 px-6 py-2 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out ${
          controlsVisible ? '' : 'pointer-events-none translate-y-[150%] opacity-0'
        }`}
      >
        {isText ? (
          <>
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
              <span className="mb-1 font-noir-mono text-[10px] leading-none text-noir-on-surface-variant">
                CHAPTER
              </span>
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
          </>
        ) : (
          pages.length > 0 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                disabled={pageIndex === 0 && !prev}
                aria-label="Previous Page"
                className="flex h-8 w-8 items-center justify-center text-noir-on-surface-variant transition-colors hover:text-noir-secondary-fixed-dim disabled:opacity-30"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 300" }}>
                  chevron_left
                </span>
              </button>
              <div className="flex flex-col items-center border-l border-r border-white/10 px-4">
                <span className="mb-1 font-noir-mono text-[10px] leading-none text-noir-on-surface-variant">
                  PAGE
                </span>
                <span className="font-noir-mono text-[12px] text-noir-primary-fixed">
                  {onEndCard ? pages.length : pageIndex + 1} / {pages.length}
                </span>
              </div>
              <button
                type="button"
                onClick={goNext}
                disabled={onEndCard && !next}
                aria-label="Next Page"
                className="flex h-8 w-8 items-center justify-center text-noir-on-surface-variant transition-colors hover:text-noir-secondary-fixed-dim disabled:opacity-30"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 300" }}>
                  chevron_right
                </span>
              </button>
            </>
          )
        )}
      </div>
    </div>
  )
}
