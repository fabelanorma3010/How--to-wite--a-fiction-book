'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Chapter, BookFormat } from '@/lib/books'
import { parseChapterBody } from '@/lib/parseChapterBody'
import { getBookFormatTheme, textureOverlayStyle } from '@/data/bookFormatThemes'
import { decodeCaptionType } from '@/lib/captionType'

type ChapterData = Chapter & { bookTitle: string; bookType: BookFormat | null }
type Sibling = { id: string; chapterNumber: number } | null

const CHAPTERBOOK_THEME = getBookFormatTheme('chapterbook')


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
  const [turnDir, setTurnDir] = useState<'next' | 'prev'>('next')
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isText = Boolean(chapter.body)
  const isManga = chapter.bookType === 'manga'
  const theme = isText ? CHAPTERBOOK_THEME : getBookFormatTheme(chapter.bookType)

  useEffect(() => {
    hideTimeout.current = setTimeout(() => setControlsVisible(false), 3000)
    return () => clearTimeout(hideTimeout.current)
  }, [])

  function handleCanvasClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('button, a, header, #reader-footer')) return
    setControlsVisible((v) => !v)
  }

  const pages = isManga ? [...chapter.pages].reverse() : chapter.pages
  const captions = isManga ? [...chapter.pageCaptions].reverse() : chapter.pageCaptions
  const decodedCaption = captions[pageIndex] ? decodeCaptionType(captions[pageIndex]) : null
  // 'caption' and 'thought' are explicit choices from the Panel Builder and always render
  // as that type; 'speech' (including every un-prefixed caption from before those existed)
  // keeps the original per-format behavior — a bottom bar for 'big' formats, else a bubble.
  const showBar = decodedCaption?.type === 'caption' || (decodedCaption?.type === 'speech' && theme.captionStyle === 'big')
  const showThought = decodedCaption?.type === 'thought'
  // One extra "slide" past the real pages for the Chapter Complete / To Be
  // Continued card, so "next" walks through the whole chapter in one motion.
  const totalSlides = pages.length + 1
  const onEndCard = pageIndex >= pages.length

  function goNext() {
    // Manga's page order is already reversed above, so "next" still means a
    // higher index — but the physical page-turn sweeps the opposite way.
    setTurnDir(isManga ? 'prev' : 'next')
    if (pageIndex < totalSlides - 1) {
      setPageIndex((i) => i + 1)
    } else if (next) {
      router.push(`/library/read/${next.id}`)
    }
  }

  function goPrev() {
    setTurnDir(isManga ? 'next' : 'prev')
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
        <main
          className="relative z-10 mx-auto min-h-screen w-full max-w-[720px] px-[20px] pb-[64px] pt-[104px] sm:px-[32px]"
          style={{ background: theme.pageBg, color: theme.ink }}
        >
          {chapter.title && (
            <h2 className="mb-8 text-[30px] font-semibold" style={{ fontFamily: theme.displayFont }}>
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
                className="my-8 w-full rounded-[2px]"
                style={{ border: `1px solid ${theme.ink}22` }}
              />
            ) : (
              <p
                key={i}
                className="mb-6 whitespace-pre-wrap text-[18px] leading-[1.85]"
                style={{ fontFamily: theme.bodyFont }}
              >
                {block.text}
              </p>
            ),
          )}

          <div className="mt-[24px] py-[48px]" style={{ borderTop: `1px solid ${theme.ink}22` }}>
            {endCard}
          </div>
        </main>
      ) : (
        <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1000px] items-center justify-center px-[16px] py-[104px] sm:px-[32px]">
          {pages.length === 0 ? (
            <p className="py-24 text-center font-noir-mono text-[13px] text-noir-on-surface-variant">
              This chapter has no pages yet.
            </p>
          ) : onEndCard ? (
            endCard
          ) : (
            <div className="w-full" style={{ perspective: '1800px' }}>
              <div
                key={pageIndex}
                className={`relative mx-auto w-full max-w-[820px] overflow-hidden ${
                  turnDir === 'prev' ? 'animate-page-turn-prev' : 'animate-page-turn-next'
                }`}
                style={{
                  background: theme.pageBg,
                  border: theme.pageBorder,
                  borderRadius: theme.pageRadius,
                  boxShadow: theme.pageShadow,
                  padding: '14px',
                  transformOrigin: 'left center',
                }}
              >
                <div className="relative w-full overflow-hidden" style={{ borderRadius: theme.pageRadius }}>
                  {showBar ? (
                    <div className="flex flex-col">
                      <div className="relative w-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pages[pageIndex]}
                          alt={`Page ${pageIndex + 1}`}
                          className="max-h-[60vh] w-full object-cover"
                        />
                        {theme.illustTexture !== 'flat' && (
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0"
                            style={textureOverlayStyle(theme.illustTexture, theme.ink)}
                          />
                        )}
                      </div>
                      <div
                        className="px-6 py-5 text-center text-[20px] font-bold"
                        style={{
                          background: theme.accentSoft,
                          color: theme.ink,
                          fontFamily: theme.displayFont,
                          borderTop: `2px solid ${theme.ink}22`,
                        }}
                      >
                        {decodedCaption?.text}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pages[pageIndex]}
                        alt={`Page ${pageIndex + 1}`}
                        className="max-h-[80vh] w-full object-contain"
                        style={theme.grayscale ? { filter: 'grayscale(1) contrast(1.05)' } : undefined}
                      />
                      {theme.illustTexture !== 'flat' && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0"
                          style={textureOverlayStyle(theme.illustTexture, theme.ink)}
                        />
                      )}
                      {decodedCaption && showThought && (
                        <div
                          className="absolute left-4 top-4 max-w-[75%]"
                          style={{
                            background: '#fff',
                            border: `2px solid ${theme.ink}`,
                            borderRadius: '46% 54% 58% 42% / 58% 48% 52% 42%',
                            padding: '12px 16px',
                            boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
                          }}
                        >
                          <p className="text-sm font-bold" style={{ fontFamily: theme.bodyFont, color: '#141414' }}>
                            {decodedCaption.text}
                          </p>
                          <span aria-hidden="true" className="absolute left-5 top-full mt-1 flex flex-col items-start gap-1">
                            <span className="block h-3 w-3 rounded-full" style={{ background: '#fff', border: `1.5px solid ${theme.ink}` }} />
                            <span className="ml-1.5 block h-1.5 w-1.5 rounded-full" style={{ background: '#fff', border: `1.5px solid ${theme.ink}` }} />
                          </span>
                        </div>
                      )}
                      {decodedCaption && !showThought && decodedCaption.text && (
                        <div
                          className="absolute left-4 top-4 max-w-[75%]"
                          style={{
                            background: '#fff',
                            border: `2px solid ${theme.ink}`,
                            borderRadius: theme.captionStyle === 'manga' ? '3px' : '18px',
                            padding: '10px 14px',
                            boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
                          }}
                        >
                          <p className="text-sm font-bold" style={{ fontFamily: theme.bodyFont, color: '#141414' }}>
                            {decodedCaption.text}
                          </p>
                          <span
                            aria-hidden="true"
                            className="absolute -bottom-[7px] left-5 h-3.5 w-3.5 rotate-45"
                            style={{
                              background: '#fff',
                              borderRight: `2px solid ${theme.ink}`,
                              borderBottom: `2px solid ${theme.ink}`,
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
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
