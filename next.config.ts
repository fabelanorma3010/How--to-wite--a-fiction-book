import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

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
      {
        // Site-wide: nothing here is meant to be framed by another site, so
        // block clickjacking outright. X-Frame-Options is the legacy header
        // still honored by some crawlers/older clients; frame-ancestors is
        // the modern equivalent. Scoped to framing only — no script/style
        // allowlisting — so this can't break any existing page.
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
