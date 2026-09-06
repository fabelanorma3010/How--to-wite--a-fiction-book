'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { PRICES } from '../data/pricing'
import { createClient } from '../lib/supabase/client'

type Cadence = keyof typeof PRICES

export default function PricingTiers() {
  const t = useTranslations('PricingTiers')
  const [cadence, setCadence] = useState<Cadence>('annual')
  // Assume signed in until proven otherwise, so a signed-in member never sees
  // a flash of "sign up first" — the safer default is the existing
  // Coming-soon state everyone already sees today.
  const [signedIn, setSignedIn] = useState(true)
  const price = PRICES[cadence]

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)))
  }, [])

  const freeFeatures = t.raw('freeFeatures') as string[]
  const memberFeatures = t.raw('memberFeatures') as string[]

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex justify-center">
        <div
          className="inline-flex rounded-full border-2 border-ink/15 bg-white/70 p-1"
          role="group"
          aria-label={t('billingPeriod')}
        >
          <button
            type="button"
            onClick={() => setCadence('monthly')}
            aria-pressed={cadence === 'monthly'}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              cadence === 'monthly' ? 'bg-primary text-primary-content shadow-sm' : 'text-ink/60 hover:text-ink'
            }`}
          >
            {t('monthly')}
          </button>
          <button
            type="button"
            onClick={() => setCadence('annual')}
            aria-pressed={cadence === 'annual'}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              cadence === 'annual' ? 'bg-primary text-primary-content shadow-sm' : 'text-ink/60 hover:text-ink'
            }`}
          >
            {t('annual')} <span className="text-xs font-black text-accent-content">{t('save17')}</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-extrabold text-ink">{t('freeTitle')}</h2>
          <p className="mt-1 text-sm text-ink/60">{t('freeSubtitle')}</p>
          <p className="mt-4">
            <span className="text-4xl font-extrabold text-ink">$0</span>
            <span className="ml-1 text-sm font-semibold text-ink/50">{t('forever')}</span>
          </p>
          <p className="mt-1 text-xs font-semibold text-ink/45">{t('noStrings')}</p>
          <ul className="mt-6 flex-1 space-y-3">
            {freeFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-ink/80">
                <span aria-hidden="true" className="mt-0.5 text-secondary-content">
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>
          <a
            href="/#quiz"
            className="mt-8 rounded-full border-2 border-ink/15 bg-white px-6 py-3 text-center font-bold text-ink shadow-sm transition-transform hover:scale-105 hover:bg-base active:scale-95"
          >
            {t('freeCta')}
          </a>
        </div>

        <div className="relative flex flex-col rounded-3xl border-2 border-primary bg-white p-6 shadow-lg sm:scale-[1.03] sm:p-8">
          <span className="mb-3 w-fit rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-content">
            {t('launchingSoon')}
          </span>
          <h2 className="text-xl font-extrabold text-ink">{t('memberTitle')}</h2>
          <p className="mt-1 text-sm text-ink/60">{t('memberSubtitle')}</p>
          <p className="mt-4 text-sm font-black uppercase tracking-wide text-accent-content">
            {t('firstMonthFree')}
          </p>
          <p className="mt-1">
            <span className="text-4xl font-extrabold text-ink">{price.amount}</span>
            <span className="ml-1 text-sm font-semibold text-ink/50">{t(price.unit)}</span>
          </p>
          <p className="mt-1 text-xs font-semibold text-ink/45">{t(`${cadence}Note`)}</p>
          <ul className="mt-6 flex-1 space-y-3">
            {memberFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-ink/80">
                <span aria-hidden="true" className="mt-0.5 text-primary-content">
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>
          {signedIn ? (
            <button
              type="button"
              disabled
              className="mt-8 cursor-not-allowed rounded-full bg-primary/40 px-6 py-3 text-center font-bold text-primary-content"
            >
              {t('comingSoon')}
            </button>
          ) : (
            <Link
              href="/signup"
              className="mt-8 rounded-full bg-primary px-6 py-3 text-center font-bold text-primary-content shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              {t('signUpFirst')}
            </Link>
          )}
          <p className="mt-2 text-center text-xs text-ink/45">{t('freeWhileBuilding')}</p>
        </div>
      </div>
    </div>
  )
}
