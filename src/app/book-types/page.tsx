import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import BookTypesPageClient from './BookTypesPageClient'
import { bookTypeIds, type BookTypeId } from '../../data/bookTypes'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('BookTypes')
  const title = `${t('sectionTitle')} — Storyburst`
  const description = t('sectionIntro')
  return {
    title,
    description,
    alternates: { canonical: '/book-types' },
    openGraph: { title, description, url: '/book-types', images: '/opengraph-image' },
    twitter: { card: 'summary', title, description, images: '/opengraph-image' },
  }
}

function isBookTypeId(value: string): value is BookTypeId {
  return (bookTypeIds as string[]).includes(value)
}

export default async function BookTypesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const initialType: BookTypeId = type && isBookTypeId(type) ? type : 'comic'
  return <BookTypesPageClient initialType={initialType} />
}
