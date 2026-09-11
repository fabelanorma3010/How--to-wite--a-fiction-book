import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import IllustrationGeneratorPageClient from './IllustrationGeneratorPageClient'
import { bookTypeIds, type BookTypeId } from '../../data/bookTypes'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Illustration')
  const title = `${t('title')} — Storyburst`
  const description = t('intro')
  return {
    title,
    description,
    alternates: { canonical: '/illustration-generator' },
    openGraph: { title, description, url: '/illustration-generator', images: '/opengraph-image' },
    twitter: { card: 'summary', title, description, images: '/opengraph-image' },
  }
}

function isBookTypeId(value: string): value is BookTypeId {
  return (bookTypeIds as string[]).includes(value)
}

export default async function IllustrationGeneratorPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const initialType: BookTypeId = type && isBookTypeId(type) ? type : 'comic'
  return <IllustrationGeneratorPageClient initialType={initialType} />
}
