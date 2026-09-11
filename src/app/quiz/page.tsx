import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import QuizPageClient from './QuizPageClient'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Quiz')
  const title = `${t('sectionTitle')} — Storyburst`
  const description = t('sectionIntro')
  return {
    title,
    description,
    alternates: { canonical: '/quiz' },
    openGraph: { title, description, url: '/quiz', images: '/opengraph-image' },
    twitter: { card: 'summary', title, description, images: '/opengraph-image' },
  }
}

export default function QuizPage() {
  return <QuizPageClient />
}
