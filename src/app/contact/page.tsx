import type { Metadata } from 'next'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ContactForm from '../../components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact — Storyburst',
  description:
    'Get in touch with Storyburst — questions about the writing tools, feedback on the site, or just want to share what comic, manga, or story you\'re working on.',
}

export default function ContactPage() {
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
              💌 We'd love to hear from you
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              Get in{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
          </div>
        </section>

        <section className="px-4 sm:px-6">
          <div className="mx-auto grid max-w-3xl gap-4 pb-4 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-ink/10 bg-white/70 p-5">
              <p className="font-bold text-ink">⏱️ What to expect</p>
              <p className="mt-1.5 text-sm text-ink/70">
                This is a one-person project, so replies come straight from me — not a support
                team. I read every message; I just can't promise a fast turnaround.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-ink/10 bg-white/70 p-5">
              <p className="font-bold text-ink">🐛 Bug or idea?</p>
              <p className="mt-1.5 text-sm text-ink/70">
                Either is welcome — for bugs, mention what you were doing and what you expected
                instead. For ideas, a sentence on why it'd help you is plenty.
              </p>
            </div>
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </div>
  )
}
