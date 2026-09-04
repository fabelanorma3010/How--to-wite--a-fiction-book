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
}

export default nextConfig
