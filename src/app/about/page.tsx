import type { Metadata } from 'next'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export const metadata: Metadata = {
  title: 'About — Storyburst',
  description:
    'The story behind Storyburst: a free toolkit built to help anyone start writing comics, manga, cartoons, and children\'s books, one page at a time.',
}

export default function AboutPage() {
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
              ✨ One wild imagination to another
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              About{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Storyburst
              </span>
            </h1>
            <p className="max-w-2xl text-balance text-lg text-ink/70">
              I have a wild imagination — and I have a feeling you do too. I made Storyburst so
              anyone can write and share a story in their own creative, wonderful way. Who knows,
              you might even find your best friend or your soulmate here. 😄
            </p>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-3xl rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-10">
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">Why I Built This</h2>
            <p className="mt-4 text-ink/80">
              Storyburst started as a simple wish: give people a reason to sit down and actually
              start writing. Not a blank page and a deadline — a quiz to find your format, quick
              generators when you're stuck, a notebook that saves itself, and a clear path from
              first draft to a finished book. Write what your heart desires, in whatever genre
              speaks to you.
            </p>
          </div>
        </section>

        <section className="px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-3xl rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-10">
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">My Story</h2>
            <p className="mt-4 text-ink/80">
              Life hasn&apos;t always been easy for me. I had a rocky childhood, and a rough road
              since. Instead of letting that turn me into someone bitter, I turned it into
              storytelling — I took the sadness and the anger and reshaped them into something
              creative instead. That&apos;s the whole idea behind this place: whatever you&apos;re
              carrying, fiction can be where you put it down and make something new out of it.
            </p>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-3xl rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-6 text-center shadow-sm sm:p-10">
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">Start Your Own Story</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink/80">
              Read, get inspired, and then go write the story only you could tell.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/#quiz"
                className="rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95"
              >
                Take the Quiz 🎯
              </a>
              <a
                href="/#book-types"
                className="rounded-full border-2 border-ink/15 bg-white/70 px-6 py-3 font-bold text-ink transition-colors hover:bg-white active:scale-95"
              >
                Browse Book Types
              </a>
              <a
                href="/#notebook"
                className="rounded-full border-2 border-ink/15 bg-white/70 px-6 py-3 font-bold text-ink transition-colors hover:bg-white active:scale-95"
              >
                Open Your Notebook
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
