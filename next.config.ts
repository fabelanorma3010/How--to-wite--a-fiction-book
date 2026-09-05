import type { NextConfig } from 'next'

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

export default nextConfig
