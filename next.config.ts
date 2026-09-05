import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs/config'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage — avatars and member-uploaded book covers.
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' },
      // Digital Library demo covers (design-preview data, see src/app/library/layout.tsx).
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // supabase/seed.sql's placeholder member avatars.
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
  async headers() {
    return [
      {
        // The only file in public/ — unlike hashed _next/static/* assets,
        // Vercel doesn't auto-attach a long-lived cache header to it.
        source: '/favicon.svg',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
    ]
  },
}

// Source map upload only activates once SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN
// are set (a real Sentry project + token, not the public DSN above) — without
// them this safely no-ops rather than failing the build. See README
// "Error monitoring — Sentry".
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  silent: true,
  errorHandler: (err) => console.warn('[Sentry build plugin]', err),
})
