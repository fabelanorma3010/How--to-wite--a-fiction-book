import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ArtGenerator from '../../components/ArtGenerator'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ArtGenerator')
  const title = `${t('title')} — Storyburst`
  const description = t('lead')
  return {
    title,
    description,
    alternates: { canonical: '/art-generator' },
    openGraph: { title, description, url: '/art-generator', images: '/opengraph-image' },
    twitter: { card: 'summary', title, description, images: '/opengraph-image' },
  }
}

export default function ArtGeneratorPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <ArtGenerator />
      </main>
      <Footer />
    </div>
  )
}
