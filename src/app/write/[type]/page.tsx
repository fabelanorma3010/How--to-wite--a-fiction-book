import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { bookTypes } from '../../../data/bookTypes'

export function generateStaticParams() {
  return bookTypes.map((type) => ({ type: type.id }))
}

function findType(type: string) {
  return bookTypes.find((t) => t.id === type)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>
}): Promise<Metadata> {
  const { type } = await params
  const active = findType(type)
  if (!active) return { title: 'Storyburst' }

  const title = `How to Write a ${active.name} — Storyburst`
  const description = `${active.tagline} A free, practical guide to writing a ${active.name.toLowerCase()}: ${active.tips[0].toLowerCase()}`

  return {
    title,
    description,
    alternates: { canonical: `/write/${active.id}` },
    openGraph: { title, description, url: `/write/${active.id}`, type: 'article', images: '/opengraph-image' },
    twitter: { card: 'summary', title, description, images: '/opengraph-image' },
  }
}

export default async function WriteGuidePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  const active = findType(type)
  if (!active) notFound()

  const others = bookTypes.filter((t) => t.id !== active.id)

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
              <span aria-hidden="true">{active.emoji}</span> Free writing guide
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              How to Write a{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {active.name}
              </span>
            </h1>
            <p className="max-w-xl text-lg font-semibold text-ink/70">{active.tagline}</p>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-3xl rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-10">
            <p className="text-lg leading-relaxed text-ink/80">{active.blurb}</p>

            <h2 className="mt-8 text-2xl font-extrabold text-ink">
              {active.tips.length} tips for writing a {active.name.toLowerCase()}
            </h2>
            <ul className="mt-4 grid gap-3">
              {active.tips.map((tip, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-2xl bg-base/80 p-4 text-ink/80"
                >
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
                Try the {active.name} tools 🎯
              </a>
              <a
                href="/#quiz"
                className="rounded-full border-2 border-ink/15 bg-white/70 px-6 py-3 font-bold text-ink transition-colors hover:bg-white active:scale-95"
              >
                Not sure it's the right fit? Take the quiz
              </a>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-center text-lg font-extrabold text-ink">
              Writing something else?
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {others.map((type) => (
                <Link
                  key={type.id}
                  href={`/write/${type.id}`}
                  className="flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white/70 px-5 py-2.5 font-bold text-ink/80 transition-colors hover:border-primary/50 hover:text-ink"
                >
                  <span aria-hidden="true">{type.emoji}</span> How to write {type.name.toLowerCase()}
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
