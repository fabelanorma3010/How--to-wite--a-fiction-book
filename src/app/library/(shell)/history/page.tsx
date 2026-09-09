import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'History' }

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-3xl px-[16px] py-[24px] md:px-[32px] md:py-[48px]">
      <h1 className="mb-[24px] font-noir-display text-[28px] font-bold text-noir-on-surface md:text-[48px]">
        History
      </h1>
      <div className="flex flex-col items-center gap-4 py-[48px] text-center">
        <span className="material-symbols-outlined text-6xl text-noir-on-surface-variant">history</span>
        <h2 className="font-noir-display text-[20px] font-bold text-noir-on-surface">No reading history yet</h2>
        <p className="max-w-md font-noir-mono text-[13px] text-noir-on-surface-variant">
          Browse the library to find something to read.
        </p>
        <Link
          href="/library"
          className="mt-2 inline-flex items-center gap-2 rounded-[0.5rem] bg-noir-primary-fixed px-6 py-3 font-noir-display text-[16px] font-extrabold text-noir-on-primary-fixed transition-colors hover:bg-noir-primary-fixed-dim"
        >
          Browse Discover
        </Link>
      </div>
    </div>
  )
}
