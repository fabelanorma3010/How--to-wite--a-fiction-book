import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('AboutPage')
  const title = t('metaTitle')
  const description = t('metaDescription')
  return {
    title,
    description,
    alternates: { canonical: '/about' },
    openGraph: { title, description, url: '/about', images: '/opengraph-image' },
    twitter: { card: 'summary', title, description, images: '/opengraph-image' },
  }
}

export default async function AboutPage() {
  const t = await getTranslations('AboutPage')

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
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

        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-3xl rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-10">
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t('whyTitle')}</h2>
            <p className="mt-4 text-ink/80">{t('whyBody')}</p>
          </div>
        </section>

        <section className="px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-3xl rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-10">
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t('storyTitle')}</h2>
            <p className="mt-4 text-ink/80">{t('storyBody')}</p>
            <p className="mt-4 text-lg font-extrabold text-primary-content">{t('godLovesYou')}</p>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-3xl rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-6 text-center shadow-sm sm:p-10">
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t('ctaTitle')}</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink/80">{t('ctaBody')}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/#quiz"
                className="rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95"
              >
                {t('ctaQuiz')}
              </a>
              <a
                href="/#book-types"
                className="rounded-full border-2 border-ink/15 bg-white/70 px-6 py-3 font-bold text-ink transition-colors hover:bg-white active:scale-95"
              >
                {t('ctaBookTypes')}
              </a>
              <a
                href="/#notebook"
                className="rounded-full border-2 border-ink/15 bg-white/70 px-6 py-3 font-bold text-ink transition-colors hover:bg-white active:scale-95"
              >
                {t('ctaNotebook')}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
