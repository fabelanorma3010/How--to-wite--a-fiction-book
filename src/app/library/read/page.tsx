'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const panels = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAQeyGcvIDd0XfPYXjYtQ33hZBFYfZ8GWqxMwk_pyPeZJRuegT5O5MhKVxa5qVALKwgZLsYzskd9yp8F5dnqSXYEb5Nt_qmepdT6Ftsyk2PCFJ9HizcXIodFDgKkQ9HmrJEAhgl60hzE3dLX6p5rvK9xhI37hFggjzDW-_2wg5cdS_S_dj8B0Qi98UiDbFsdwO8R9j8Gt5WMmTkrhJQ-jF8jwM5uVE8oo7huke9yc4nLQkWNCf9csJcbA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuARDGnAW4V180jTXUuLuTFLHcXLItMHzDY5_QA4gMt36Z6L1554H2RP9omdRbGOwNIafAUC5SGGZBsbV80ms0fIze0rF8qF4J5jfeHM-Ffi0mVOxc3c8dbCjf5BxESpLhoVQT-ylUw2MKlp-aGx6rALuCO4uTZQYiMrJcKmgP0X4T3ALosNI9jpRAZWi9wkWatghy3Gv-ivHgHt5aYPG8nuz6hpa9s5594L0nGRQgfv6f9rUOFGC_CaXQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCDvLJt1cuX_gX3blC8C2xV53GaKxtbdH4swn0yvtb1vNAcx6Satu_NysY269VVgqOD2eztXh8CUz8N3k_GBA4TB1ebb5DELOup_iEvb-A8CKtqioiPwATmxo-LaUAH4hEej6MVU2AREXfiQObIKY81gRSgZjeCEjX7ySQ-nNmaXARXBYtR6HLn6nGhyC8YjB52SE3S7bTLHrH0OS2j25h8urgKSMOrUiy6thOsOikpa_-uWOQpjQezIQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCCv-8Jp_Ve_J6GIggI0Rr6MqYuIIi3xKqrHBh25u8ZbUwDUPsHpC3ROubHalEKYQqXnxNO3B9i66XWH6gKrYniGlymHaza8um2Z3b_Gj8dMgX9p6QVXgjKQpTlVy6eU92tl5FyGokgYmOzJjjlknf41j2yvEdwx9PhqP4XLAPyJtCfcoerOi59u4pYoTNFUl59_tXwliZViebByqXzAjxudvRj7lRPBKPPIfQTfCnNVh9kO84_VBNSGw',
]

export default function ComicReaderPage() {
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

  return (
    <div className="min-h-screen bg-black text-noir-on-surface" onClick={handleCanvasClick}>
      <header
        className={`fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-noir-background/80 px-[16px] backdrop-blur-xl transition-transform duration-300 ease-in-out md:px-[32px] ${
          controlsVisible ? '' : '-translate-y-full'
        }`}
      >
        <Link
          href="/library/book"
          aria-label="Exit Reader"
          className="flex h-10 w-10 items-center justify-center rounded-full text-noir-on-surface-variant transition-colors hover:text-noir-primary-fixed"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 300" }}>
            arrow_back
          </span>
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="max-w-[200px] truncate font-noir-display text-[20px] text-noir-on-surface md:max-w-xs">
            Neon Genesis
          </h1>
          <span className="font-noir-mono text-[12px] text-noir-on-surface-variant">Chapter 42</span>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full text-noir-on-surface-variant">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 300" }}>
            settings
          </span>
        </span>
      </header>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[800px] flex-col gap-[4px]">
        {panels.map((src, i) => (
          <Image
            key={i}
            className="h-auto w-full object-cover"
            alt={`Panel ${i + 1}`}
            src={src}
            width={800}
            height={1200}
            sizes="800px"
            priority={i === 0}
          />
        ))}
        <div className="mx-[16px] mt-[24px] flex flex-col items-center justify-center gap-[8px] border-t border-white/10 py-[48px] md:mx-0">
          <span className="font-noir-display text-[28px] font-extrabold uppercase tracking-tighter text-noir-on-surface">
            To Be Continued
          </span>
          <div className="mt-[8px] flex gap-[8px]">
            <button
              type="button"
              className="rounded-[0.125rem] border border-noir-secondary-fixed-dim px-6 py-3 font-noir-display text-[16px] font-bold uppercase text-noir-secondary-fixed-dim transition-colors hover:bg-noir-secondary-fixed-dim/10"
            >
              Share
            </button>
            <Link
              href="/library/book"
              className="rounded-[0.125rem] bg-noir-primary-fixed px-6 py-3 font-noir-display text-[16px] font-extrabold uppercase text-noir-on-primary transition-colors hover:bg-noir-primary-fixed-dim"
            >
              Next Chapter
            </Link>
          </div>
        </div>
      </main>

      <div
        id="reader-footer"
        className={`fixed bottom-[16px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-white/10 bg-noir-surface-container/90 px-6 py-2 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out ${
          controlsVisible ? '' : 'pointer-events-none translate-y-[150%] opacity-0'
        }`}
      >
        <button
          type="button"
          aria-label="Previous Chapter"
          className="flex h-8 w-8 items-center justify-center text-noir-on-surface-variant transition-colors hover:text-noir-secondary-fixed-dim"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 300" }}>
            skip_previous
          </span>
        </button>
        <div className="flex flex-col items-center border-l border-r border-white/10 px-4">
          <span className="mb-1 font-noir-mono text-[10px] leading-none text-noir-on-surface-variant">
            PROGRESS
          </span>
          <span className="font-noir-mono text-[12px] text-noir-primary-fixed">100%</span>
        </div>
        <button
          type="button"
          aria-label="Next Chapter"
          className="flex h-8 w-8 items-center justify-center text-noir-on-surface-variant transition-colors hover:text-noir-secondary-fixed-dim"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 300" }}>
            skip_next
          </span>
        </button>
      </div>
    </div>
  )
}
