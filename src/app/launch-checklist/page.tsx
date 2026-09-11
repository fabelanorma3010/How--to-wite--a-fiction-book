import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import FictionHelper from '../../components/FictionHelper'
import LaunchChecklist from '../../components/LaunchChecklist'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('LaunchChecklist')
  const title = `${t('title')} — Storyburst`
  const description = t('intro')
  return {
    title,
    description,
    alternates: { canonical: '/launch-checklist' },
    openGraph: { title, description, url: '/launch-checklist', images: '/opengraph-image' },
    twitter: { card: 'summary', title, description, images: '/opengraph-image' },
  }
}

export default async function LaunchChecklistPage() {
  const c = await getTranslations('Common')

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <LaunchChecklist />
        <div className="px-4 pb-16 text-center sm:px-6">
          <Link
            href="/account"
            className="inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95"
          >
            {c('continueToAccount')}
          </Link>
        </div>
      </main>
      <Footer />
      <FictionHelper selected="comic" />
    </div>
  )
}
