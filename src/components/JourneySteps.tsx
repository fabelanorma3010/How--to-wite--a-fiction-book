import Link from 'next/link'
import { useTranslations } from 'next-intl'
import Sticker from './Sticker'

const STEPS = [
  { emoji: '🎯', href: '/quiz' },
  { emoji: '💡', href: '/action-generator' },
  { emoji: '✍️', href: '/notebook' },
  { emoji: '📚', href: '/account' },
] as const

export default function JourneySteps() {
  const t = useTranslations('JourneySteps')

  return (
    <section className="px-4 pb-16 sm:px-6">
      <div className="relative mx-auto max-w-5xl">
        <Sticker emoji="🧭" className="-top-2 -right-2 rotate-12 sm:-top-4 sm:-right-4" />
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t('title')}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink/70 sm:text-base">{t('intro')}</p>
        </div>

        <ol className="grid gap-4 sm:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.href}>
              <Link
                href={step.href}
                className="block h-full rounded-2xl border-2 border-ink/10 bg-white/70 p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-white"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-primary-content">
                    {i + 1}
                  </span>
                  <span aria-hidden="true" className="text-2xl">
                    {step.emoji}
                  </span>
                </span>
                <h3 className="mt-3 text-base font-extrabold text-ink">{t(`steps.${i}.title`)}</h3>
                <p className="mt-1 text-sm text-ink/60">{t(`steps.${i}.description`)}</p>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
