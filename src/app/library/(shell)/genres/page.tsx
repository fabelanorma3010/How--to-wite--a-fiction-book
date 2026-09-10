import type { Metadata } from 'next'
import Link from 'next/link'
import { bookTypes } from '../../../../data/bookTypes'

export const metadata: Metadata = { title: 'Genres' }

const LABELS: Record<string, string> = {
  comic: 'Comic',
  manga: 'Manga',
  cartoon: 'Cartoon',
  childrens: "Children's",
}

export default function GenresPage() {
  return (
    <div className="mx-auto max-w-7xl px-[16px] py-[24px] md:px-[32px] md:py-[48px]">
      <h1 className="mb-[24px] font-noir-display text-[28px] font-bold text-noir-on-surface md:text-[48px]">
        Genres
      </h1>
      <div className="grid grid-cols-2 gap-[16px] sm:grid-cols-4">
        {bookTypes.map((type) => (
          <Link
            href={`/library?type=${type.id}`}
            key={type.id}
            className="group flex flex-col items-center justify-center gap-3 rounded-[0.75rem] border border-white/10 bg-noir-surface-container-low p-6 text-center transition-colors hover:border-noir-primary-container hover:bg-noir-surface-container"
          >
            <span aria-hidden="true" className="text-[32px] transition-transform group-hover:scale-110">
              {type.emoji}
            </span>
            <span className="font-noir-display text-[15px] font-semibold text-noir-on-surface">
              {LABELS[type.id]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
