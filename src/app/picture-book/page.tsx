import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import FictionHelper from '../../components/FictionHelper'
import QuizGate from '../../components/QuizGate'
import PictureBookMaker from '../../components/PictureBookMaker'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('PictureBook')
  const title = `${t('title')} — Storyburst`
  const description = t('intro')
  return {
    title,
    description,
    alternates: { canonical: '/picture-book' },
    openGraph: { title, description, url: '/picture-book', images: '/opengraph-image' },
    twitter: { card: 'summary', title, description, images: '/opengraph-image' },
  }
}

export default async function PictureBookPage() {
  const c = await getTranslations('Common')
  const h = await getTranslations('Header')

  return (
    <QuizGate>
      <div className="min-h-screen">
        <Header />
        <main>
          <PictureBookMaker />
          <div className="px-4 pb-16 text-center sm:px-6">
            <Link
              href="/book-panel"
              className="inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              {c('continueTo', { name: h('bookPanel') })}
            </Link>
          </div>
        </main>
        <Footer />
        <FictionHelper selected="childrens" />
      </div>
    </QuizGate>
  )
}
