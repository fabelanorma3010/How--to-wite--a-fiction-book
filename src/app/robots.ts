import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.fiction-book-builder.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private/personalized (account), staff-only (admin), API routes, and
      // the /library design preview (sample data, not a real catalog) — kept
      // in sync with each page's own `robots` metadata.
      disallow: ['/admin', '/account', '/library', '/api'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
