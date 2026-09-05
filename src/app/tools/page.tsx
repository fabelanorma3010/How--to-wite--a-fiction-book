import type { Metadata } from 'next'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import WritingTools from '../../components/WritingTools'

const title = 'Writing Tools — Storyburst'
const description =
  'Free AI writing tools: summarize a long article or meeting notes, get a critique of your draft, or turn messy notes into a clear structure. Paste text or upload a file.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/tools' },
  openGraph: { title, description, url: '/tools', images: '/opengraph-image' },
  twitter: { card: 'summary', title, description, images: '/opengraph-image' },
}

export default function ToolsPage() {
  return (
    <div className="min-h-screen">
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
              ✨ Free AI writing tools
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              Writing{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Tools
              </span>
            </h1>
            <p className="max-w-xl text-lg font-semibold text-ink/70">
              Summarize, critique, and tidy up your writing — paste text or upload a file, get a
              result back in seconds.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6">
          <WritingTools />
        </section>
      </main>
      <Footer />
    </div>
  )
}
