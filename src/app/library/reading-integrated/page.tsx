'use client'

import Link from 'next/link'

const panels = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAQeyGcvIDd0XfPYXjYtQ33hZBFYfZ8GWqxMwk_pyPeZJRuegT5O5MhKVxa5qVALKwgZLsYzskd9yp8F5dnqSXYEb5Nt_qmepdT6Ftsyk2PCFJ9HizcXIodFDgKkQ9HmrJEAhgl60hzE3dLX6p5rvK9xhI37hFggjzDW-_2wg5cdS_S_dj8B0Qi98UiDbFsdwO8R9j8Gt5WMmTkrhJQ-jF8jwM5uVE8oo7huke9yc4nLQkWNCf9csJcbA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuARDGnAW4V180jTXUuLuTFLHcXLItMHzDY5_QA4gMt36Z6L1554H2RP9omdRbGOwNIafAUC5SGGZBsbV80ms0fIze0rF8qF4J5jfeHM-Ffi0mVOxc3c8dbCjf5BxESpLhoVQT-ylUw2MKlp-aGx6rALuCO4uTZQYiMrJcKmgP0X4T3ALosNI9jpRAZWi9wkWatghy3Gv-ivHgHt5aYPG8nuz6hpa9s5594L0nGRQgfv6f9rUOFGC_CaXQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCDvLJt1cuX_gX3blC8C2xV53GaKxtbdH4swn0yvtb1vNAcx6Satu_NysY269VVgqOD2eztXh8CUz8N3k_GBA4TB1ebb5DELOup_iEvb-A8CKtqioiPwATmxo-LaUAH4hEej6MVU2AREXfiQObIKY81gRSgZjeCEjX7ySQ-nNmaXARXBYtR6HLn6nGhyC8YjB52SE3S7bTLHrH0OS2j25h8urgKSMOrUiy6thOsOikpa_-uWOQpjQezIQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCCv-8Jp_Ve_J6GIggI0Rr6MqYuIIi3xKqrHBh25u8ZbUwDUPsHpC3ROubHalEKYQqXnxNO3B9i66XWH6gKrYniGlymHaza8um2Z3b_Gj8dMgX9p6QVXgjKQpTlVy6eU92tl5FyGokgYmOzJjjlknf41j2yvEdwx9PhqP4XLAPyJtCfcoerOi59u4pYoTNFUl59_tXwliZViebByqXzAjxudvRj7lRPBKPPIfQTfCnNVh9kO84_VBNSGw',
]

export default function ReadingIntegratedPage() {
  return (
    <div className="min-h-screen bg-black pb-24 pt-16 text-noir-on-surface">
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-noir-background/80 px-[16px] backdrop-blur-xl md:px-[32px]">
        <button type="button" className="text-noir-primary-fixed" aria-label="Menu (not wired up in this demo)">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="font-noir-display text-[24px] font-extrabold uppercase tracking-tighter text-noir-primary-fixed">
          NOIR
        </span>
        <button type="button" className="text-noir-primary-fixed" aria-label="Search (not wired up in this demo)">
          <span className="material-symbols-outlined">search</span>
        </button>
      </header>

      <p className="mb-4 border-b border-white/10 bg-noir-surface-container-low px-[16px] py-2 text-center font-noir-mono text-[10px] uppercase tracking-wider text-noir-on-surface-variant">
        Original Stitch layout — &quot;Reading View, Integrated Nav&quot; · see also{' '}
        <Link href="/library/read" className="text-noir-secondary-fixed-dim underline">
          the minimal-chrome Reading View
        </Link>
      </p>

      <main className="mx-auto flex w-full max-w-[800px] flex-col gap-[4px]">
        {panels.map((src, i) => (
          <img key={i} className="h-auto w-full object-cover" alt={`Panel ${i + 1}`} src={src} />
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

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-white/10 bg-noir-background/80 pb-safe backdrop-blur-xl">
        <Link href="/library" className="flex flex-col items-center justify-center gap-1 border-t-2 border-noir-primary-fixed pt-1 text-noir-primary-fixed">
          <span className="material-symbols-outlined">home</span>
          <span className="font-noir-mono text-[11px]">Home</span>
        </Link>
        <Link href="/library/my-library" className="flex flex-col items-center justify-center gap-1 pt-1 text-noir-on-surface-variant transition-colors hover:text-noir-secondary-fixed-dim">
          <span className="material-symbols-outlined">auto_stories</span>
          <span className="font-noir-mono text-[11px]">Library</span>
        </Link>
        <span className="flex flex-col items-center justify-center gap-1 pt-1 text-noir-on-surface-variant/40">
          <span className="material-symbols-outlined">notifications</span>
          <span className="font-noir-mono text-[11px]">Updates</span>
        </span>
        <Link href="/library/profile" className="flex flex-col items-center justify-center gap-1 pt-1 text-noir-on-surface-variant transition-colors hover:text-noir-secondary-fixed-dim">
          <span className="material-symbols-outlined">person</span>
          <span className="font-noir-mono text-[11px]">Profile</span>
        </Link>
      </nav>
    </div>
  )
}
