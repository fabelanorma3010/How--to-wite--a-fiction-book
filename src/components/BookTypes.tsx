'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { bookTypes, type BookTypeId } from '../data/bookTypes'
import Sticker from './Sticker'

interface BookTypesProps {
  selected: BookTypeId
  onSelect: (id: BookTypeId) => void
}

export default function BookTypes({ selected, onSelect }: BookTypesProps) {
  const t = useTranslations('BookTypes')
  const active = bookTypes.find((b) => b.id === selected) ?? bookTypes[0]
  const tips = t.raw(`types.${active.id}.tips`) as string[]

  return (
    <section id="book-types" className="scroll-mt-[116px] px-4 py-16 sm:px-6 lg:scroll-mt-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">{t('sectionTitle')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink/70">{t('sectionIntro')}</p>
        </div>

        <div
          role="tablist"
          aria-label={t('sectionTitle')}
          className="mb-6 flex flex-wrap justify-center gap-2 sm:gap-3"
        >
          {bookTypes.map((type) => {
            const isActive = type.id === selected
            return (
              <button
                key={type.id}
                role="tab"
                id={`tab-${type.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${type.id}`}
                onClick={() => onSelect(type.id)}
                className={`flex items-center gap-2 rounded-full border-2 px-4 py-2.5 font-bold transition-all sm:px-5 sm:py-3 ${
                  isActive
                    ? 'border-primary bg-primary text-primary-content shadow-md scale-105'
                    : 'border-ink/15 bg-white/70 text-ink/70 hover:border-primary/50 hover:text-ink'
                }`}
              >
                <span aria-hidden="true" className="text-lg sm:text-xl">
                  {type.emoji}
                </span>
                {t(`types.${type.id}.name`)}
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={`panel-${active.id}`}
          aria-labelledby={`tab-${active.id}`}
          key={active.id}
          className="animate-pop-in relative rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8"
        >
          <Sticker emoji="📌" className="-top-2 -right-2 rotate-12 sm:-top-4 sm:-right-4" />
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
            <h3 className="text-2xl font-extrabold text-ink">
              <span aria-hidden="true">{active.emoji}</span> {t(`types.${active.id}.name`)}
            </h3>
            <p className="font-semibold text-secondary-content/80">{t(`types.${active.id}.tagline`)}</p>
          </div>

          <p className="mt-4 text-ink/80">{t(`types.${active.id}.blurb`)}</p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {tips.map((tip, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-2xl bg-page/80 p-4 text-sm text-ink/80 sm:text-base"
              >
                <span aria-hidden="true" className="font-extrabold text-accent-content/70">
                  {i + 1}.
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>

          <Link
            href={`/write/${active.id}`}
            className="mt-6 inline-flex items-center gap-1.5 font-bold text-ink underline underline-offset-2"
          >
            {t('readGuide', { name: t(`types.${active.id}.name`) })}
          </Link>
        </div>
      </div>
    </section>
  )
}
