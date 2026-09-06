import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { bookTypes, bookTypeEmoji, type BookTypeId } from '../../../data/bookTypes'

export function generateStaticParams() {
  return bookTypes.map((type) => ({ type: type.id }))
}

function isBookTypeId(value: string): value is BookTypeId {
  return bookTypes.some((t) => t.id === value)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>
}): Promise<Metadata> {
  const { type } = await params
  if (!isBookTypeId(type)) return { title: 'Storyburst' }

  const bt = await getTranslations('BookTypes')
  const wg = await getTranslations('WriteGuide')
  const name = bt(`types.${type}.name`)
  const title = wg('metaTitle', { name })
  const description = wg('metaDescription', {
    name,
    tagline: bt(`types.${type}.tagline`),
  })

  return {
    title,
    description,
    alternates: { canonical: `/write/${type}` },
    openGraph: { title, description, url: `/write/${type}`, type: 'article', images: '/opengraph-image' },
    twitter: { card: 'summary', title, description, images: '/opengraph-image' },
  }
}

export default async function WriteGuidePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  if (!isBookTypeId(type)) notFound()

  const bt = await getTranslations('BookTypes')
  const wg = await getTranslations('WriteGuide')
  const tips = bt.raw(`types.${type}.tips`) as string[]
  const name = bt(`types.${type}.name`)
  const others = bookTypes.filter((t) => t.id !== type)

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
            className="pointer-events-none absolute -right-10 top-20 h-48 w-48 rounded-full bg-primary/30 blur-2xl sm:h-64 sm:w-64"
          />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
            <span className="animate-pop-in rounded-full border-2 border-primary/40 bg-white/70 px-4 py-1.5 text-sm font-bold text-primary-content shadow-sm">
              <span aria-hidden="true">{bookTypeEmoji(type)}</span> {wg('badge')}
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              {wg.rich('heading', {
                name,
                highlight: (chunks) => (
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    {chunks}
                  </span>
                ),
              })}
            </h1>
            <p className="max-w-xl text-lg font-semibold text-ink/70">{bt(`types.${type}.tagline`)}</p>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-3xl rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-10">
            <p className="text-lg leading-relaxed text-ink/80">{bt(`types.${type}.blurb`)}</p>

            <h2 className="mt-8 text-2xl font-extrabold text-ink">
              {wg('tipsHeading', { count: tips.length, name })}
            </h2>
            <ul className="mt-4 grid gap-3">
              {tips.map((tip, i) => (
                <li key={i} className="flex gap-3 rounded-2xl bg-base/80 p-4 text-ink/80">
                  <span aria-hidden="true" className="font-extrabold text-accent-content/70">
                    {i + 1}.
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="/#book-types"
                className="rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95"
              >
                {wg('tryTools', { name })}
              </a>
              <a
                href="/#quiz"
                className="rounded-full border-2 border-ink/15 bg-white/70 px-6 py-3 font-bold text-ink transition-colors hover:bg-white active:scale-95"
              >
                {wg('takeQuiz')}
              </a>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-center text-lg font-extrabold text-ink">{wg('somethingElse')}</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {others.map((other) => (
                <Link
                  key={other.id}
                  href={`/write/${other.id}`}
                  className="flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white/70 px-5 py-2.5 font-bold text-ink/80 transition-colors hover:border-primary/50 hover:text-ink"
                >
                  <span aria-hidden="true">{other.emoji}</span>{' '}
                  {wg('howToWrite', { name: bt(`types.${other.id}.name`) })}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
