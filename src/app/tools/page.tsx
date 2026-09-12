import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import JsonLd from '../../components/JsonLd'
import WritingTools from '../../components/WritingTools'
import { TOOL_IDS } from '../../data/writingTools'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.fiction-book-builder.com'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ToolsPage')
  const title = t('metaTitle')
  const description = t('metaDescription')
  return {
    title,
    description,
    alternates: { canonical: '/tools' },
    openGraph: { title, description, url: '/tools', images: '/opengraph-image' },
    twitter: { card: 'summary', title, description, images: '/opengraph-image' },
  }
}

export default async function ToolsPage() {
  const t = await getTranslations('ToolsPage')
  const wt = await getTranslations('WritingTools')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteUrl}/tools#webpage`,
    url: `${siteUrl}/tools`,
    name: t('metaTitle'),
    description: t('metaDescription'),
    isPartOf: { '@id': `${siteUrl}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: TOOL_IDS.map((id, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: wt(`tools.${id}.label`),
        description: wt(`tools.${id}.blurb`),
      })),
    },
  }

  return (
    <div className="min-h-screen">
      <JsonLd data={jsonLd} />
      <Header />
      <main>
        <section className="relative overflow-hidden px-4 pb-4 pt-14 sm:px-6 sm:pt-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/30 blur-2xl sm:h-72 sm:w-72"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 top-20 h-48 w-48 rounded-full bg-secondary/30 blur-2xl sm:h-64 sm:w-64"
          />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
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
            <p className="max-w-xl text-lg font-semibold text-ink/70">{t('intro')}</p>
          </div>
        </section>

        <section className="px-4 pb-8 sm:px-6">
          <WritingTools />
        </section>

        <section className="px-4 pb-8 sm:px-6">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 rounded-3xl border-2 border-ink/10 bg-white/70 px-6 py-10 text-center shadow-sm">
            <span aria-hidden="true" className="text-4xl">
              🎨
            </span>
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t('artGeneratorHeading')}</h2>
            <p className="max-w-md font-semibold text-ink/70">{t('artGeneratorBody')}</p>
            <Link
              href="/art-generator"
              className="mt-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              {t('artGeneratorButton')}
            </Link>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 rounded-3xl border-2 border-primary/20 bg-primary/5 px-6 py-10 text-center">
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t('signupCtaHeading')}</h2>
            <p className="max-w-md font-semibold text-ink/70">{t('signupCtaBody')}</p>
            <Link
              href="/signup"
              className="mt-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              {t('signupCtaButton')}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
