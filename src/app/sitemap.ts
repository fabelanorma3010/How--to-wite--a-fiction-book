import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { bookTypes } from '../data/bookTypes'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.fiction-book-builder.com'

const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1 },
  { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${siteUrl}/pricing`, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${siteUrl}/contact`, changeFrequency: 'yearly', priority: 0.3 },
  { url: `${siteUrl}/signup`, changeFrequency: 'yearly', priority: 0.5 },
  { url: `${siteUrl}/login`, changeFrequency: 'yearly', priority: 0.2 },
  { url: `${siteUrl}/privacy`, changeFrequency: 'yearly', priority: 0.1 },
  { url: `${siteUrl}/terms`, changeFrequency: 'yearly', priority: 0.1 },
  ...bookTypes.map(
    (type): MetadataRoute.Sitemap[number] => ({
      url: `${siteUrl}/write/${type.id}`,
      changeFrequency: 'monthly',
      priority: 0.8,
    }),
  ),
]

/**
 * A plain anon-key client (no cookies) — sitemap generation isn't tied to any
 * one visitor's session, and reading with the anon role naturally lists only
 * the public_profile_cards rows an anonymous crawler could actually see.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return staticRoutes

  const supabase = createClient(url, anonKey, { auth: { persistSession: false } })
  const { data } = await supabase
    .from('public_profile_cards')
    .select('username, created_at')
    .order('created_at', { ascending: false })
    .limit(5000)

  const profileRoutes: MetadataRoute.Sitemap = (data ?? []).map((row) => ({
    url: `${siteUrl}/u/${row.username}`,
    lastModified: row.created_at,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...profileRoutes]
}
