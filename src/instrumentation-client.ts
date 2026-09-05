import * as Sentry from '@sentry/nextjs'

// Browser error monitoring. A no-op with no NEXT_PUBLIC_SENTRY_DSN set — see
// README "Error monitoring — Sentry" for how to configure it. Unlike Umami /
// Speed Insights, this isn't gated behind the cookie consent banner: it exists
// to catch and fix bugs, not to analyze visitor behavior, and doesn't set
// cookies or track anyone across sessions.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
if (dsn) {
  Sentry.init({ dsn, tracesSampleRate: 0.2 })
}

// Lets Sentry trace App Router client-side navigations.
export const onRouterTransitionStart = dsn ? Sentry.captureRouterTransitionStart : undefined
