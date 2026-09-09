import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import KidsCorner from '../../components/KidsCorner'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('KidsCorner')
  const title = t('metaTitle')
  const description = t('metaDescription')
  return {
    title,
    description,
    alternates: { canonical: '/kids' },
    openGraph: { title, description, url: '/kids', images: '/opengraph-image' },
    twitter: { card: 'summary', title, description, images: '/opengraph-image' },
  }
}

export default function KidsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <KidsCorner />
      <Footer />
    </div>
  )
}
