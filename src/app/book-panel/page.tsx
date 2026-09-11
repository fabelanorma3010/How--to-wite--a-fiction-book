import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import FictionHelper from '../../components/FictionHelper'
import QuizGate from '../../components/QuizGate'
import PanelBuilder from '../../components/PanelBuilder'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('PanelBuilder')
  const title = `${t('title')} — Storyburst`
  const description = t('lead')
  return {
    title,
    description,
    alternates: { canonical: '/book-panel' },
    openGraph: { title, description, url: '/book-panel', images: '/opengraph-image' },
    twitter: { card: 'summary', title, description, images: '/opengraph-image' },
  }
}

export default async function BookPanelPage() {
  const c = await getTranslations('Common')
  const h = await getTranslations('Header')

  return (
    <QuizGate>
      <div className="min-h-screen">
        <Header />
        <main>
          <PanelBuilder />
          <div className="px-4 pb-16 text-center sm:px-6">
            <Link
              href="/notebook"
              className="inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              {c('continueTo', { name: h('notebook') })}
            </Link>
          </div>
        </main>
        <Footer />
        <FictionHelper selected="comic" />
      </div>
    </QuizGate>
  )
}
