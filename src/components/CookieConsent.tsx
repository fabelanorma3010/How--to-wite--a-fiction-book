'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { SpeedInsights } from '@vercel/speed-insights/next'

const CONSENT_KEY = 'storyburst-cookie-consent'
type Consent = 'accepted' | 'declined'

const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
const umamiScriptSrc = process.env.NEXT_PUBLIC_UMAMI_SRC ?? 'https://cloud.umami.is/script.js'

function isConsent(value: string | null): value is Consent {
  return value === 'accepted' || value === 'declined'
}

// Sign-in cookies are strictly necessary and load regardless of this choice —
// Umami and Speed Insights (both cookie-free) only run once accepted, so
// "Decline" actually means nothing extra loads. See src/app/privacy/page.tsx,
// "Cookies & analytics".
export default function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(CONSENT_KEY)
    if (isConsent(stored)) setConsent(stored)
    setReady(true)
  }, [])

  function decide(value: Consent) {
    window.localStorage.setItem(CONSENT_KEY, value)
    setConsent(value)
  }

  return (
    <>
      {consent === 'accepted' && umamiWebsiteId && (
        <Script src={umamiScriptSrc} data-website-id={umamiWebsiteId} strategy="afterInteractive" />
      )}
      {consent === 'accepted' && <SpeedInsights />}

      {ready && consent === null && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6" role="dialog" aria-label="Cookie notice">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border-2 border-ink/10 bg-white p-5 shadow-xl sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-ink/80">
              We use a few essential cookies to keep you signed in — those aren&apos;t affected by
              this choice. Accepting also turns on privacy-focused, cookie-free analytics and
              performance monitoring so we can see how the site is used and how fast it runs. Read
              our{' '}
              <Link href="/privacy" className="font-bold text-ink underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => decide('declined')}
                className="rounded-full border-2 border-ink/15 bg-white px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-base"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => decide('accepted')}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-content shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
