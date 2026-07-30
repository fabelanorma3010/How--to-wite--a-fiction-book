import Sticker from './Sticker'

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 sm:pt-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-secondary/30 blur-2xl sm:h-72 sm:w-72"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-20 h-48 w-48 rounded-full bg-accent/30 blur-2xl sm:h-64 sm:w-64"
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <Sticker emoji="✨" className="-top-8 right-2 rotate-12 sm:-top-10 sm:right-8" />
        <span className="animate-pop-in rounded-full border-2 border-primary/40 bg-white/70 px-4 py-1.5 text-sm font-bold text-primary-content shadow-sm">
          ✨ Your creative launchpad for illustrated storytelling
        </span>

        <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
          How to Write & Publish a{' '}
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Fiction Book
          </span>
        </h1>

        <p className="max-w-2xl text-balance text-lg text-ink/70 sm:text-xl">
          Comics, manga, cartoons, and children's books — get genre tips, punch up your
          script with a fun action-text generator, spark illustration ideas, and follow a
          clear path to publishing your finished book.
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#quiz"
            className="rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95"
          >
            Take the Quiz 🎯
          </a>
          <a
            href="#book-types"
            className="rounded-full border-2 border-ink/15 bg-white/70 px-6 py-3 font-bold text-ink transition-colors hover:bg-white active:scale-95"
          >
            Browse Book Types
          </a>
          <a
            href="#publish"
            className="rounded-full border-2 border-ink/15 bg-white/70 px-6 py-3 font-bold text-ink transition-colors hover:bg-white active:scale-95"
          >
            See Publishing Steps
          </a>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 text-2xl sm:gap-4 sm:text-3xl" aria-hidden="true">
          <span className="wiggle-hover inline-block">💥</span>
          <span className="wiggle-hover inline-block">🌸</span>
          <span className="wiggle-hover inline-block">🎈</span>
          <span className="wiggle-hover inline-block">🧸</span>
          <span className="wiggle-hover inline-block">📚</span>
        </div>
      </div>
    </section>
  )
}
