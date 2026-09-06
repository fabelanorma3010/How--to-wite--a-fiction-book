import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import PricingFaq from '../../components/PricingFaq'
import PricingTiers from '../../components/PricingTiers'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('PricingPage')
  const title = t('metaTitle')
  const description = t('metaDescription')
  return {
    title,
    description,
    alternates: { canonical: '/pricing' },
    openGraph: { title, description, url: '/pricing', images: '/opengraph-image' },
    twitter: { card: 'summary', title, description, images: '/opengraph-image' },
  }
}

export default async function PricingPage() {
  const t = await getTranslations('PricingPage')

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="relative overflow-hidden px-4 pb-4 pt-14 sm:px-6 sm:pt-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-secondary/30 blur-2xl sm:h-72 sm:w-72"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 top-20 h-48 w-48 rounded-full bg-accent/30 blur-2xl sm:h-64 sm:w-64"
          />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <span className="animate-pop-in rounded-full border-2 border-primary/40 bg-white/70 px-4 py-1.5 text-sm font-bold text-primary-content shadow-sm">
              {t('badge')}
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              {t.rich('heading', {
                highlight: (chunks) => (
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    {chunks}
                  </span>
                ),
              })}
            </h1>
            <p className="max-w-2xl text-balance text-lg text-ink/70">{t('intro')}</p>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6">
          <PricingTiers />
        </section>

        <section className="px-4 pb-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">{t('faqTitle')}</h2>
          </div>
          <PricingFaq />
        </section>
      </main>
      <Footer />
    </div>
  )
}
