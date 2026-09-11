import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ActionGeneratorPageClient from './ActionGeneratorPageClient'
import { bookTypeIds, type BookTypeId } from '../../data/bookTypes'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ActionText')
  const title = `${t('title')} — Storyburst`
  const description = t('intro')
  return {
    title,
    description,
    alternates: { canonical: '/action-generator' },
    openGraph: { title, description, url: '/action-generator', images: '/opengraph-image' },
    twitter: { card: 'summary', title, description, images: '/opengraph-image' },
  }
}

function isBookTypeId(value: string): value is BookTypeId {
  return (bookTypeIds as string[]).includes(value)
}

export default async function ActionGeneratorPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const initialType: BookTypeId = type && isBookTypeId(type) ? type : 'comic'
  return <ActionGeneratorPageClient initialType={initialType} />
}
