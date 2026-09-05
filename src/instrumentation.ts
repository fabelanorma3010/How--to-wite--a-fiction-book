import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

// Server + edge error monitoring. A no-op with no NEXT_PUBLIC_SENTRY_DSN set —
// see README "Error monitoring — Sentry" for how to configure it.
export async function register() {
  if (!dsn) return

  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({ dsn, tracesSampleRate: 0.2 })
  }
}

// Reports errors from React Server Components / server-side data fetching
// that Next.js's own instrumentation hook surfaces. Only wired up once Sentry
// is actually configured.
export const onRequestError = dsn ? Sentry.captureRequestError : undefined
