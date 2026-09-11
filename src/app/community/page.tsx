import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import FictionHelper from '../../components/FictionHelper'
import Community from '../../components/Community'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Community')
  const title = t('title')
  const description = t('intro')
  return {
    title,
    description,
    alternates: { canonical: '/community' },
    openGraph: { title, description, url: '/community', images: '/opengraph-image' },
    twitter: { card: 'summary', title, description, images: '/opengraph-image' },
  }
}

export default function CommunityPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Community />
      </main>
      <Footer />
      <FictionHelper selected="comic" />
    </div>
  )
}
