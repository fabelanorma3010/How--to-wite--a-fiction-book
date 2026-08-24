import type { Metadata } from 'next'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SignUpForm from '../../components/SignUpForm'

export const metadata: Metadata = {
  title: 'Sign Up — Storyburst',
  description: 'Create a free Storyburst account.',
}

export default function SignUpPage() {
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
            className="pointer-events-none absolute -right-10 top-20 h-48 w-48 rounded-full bg-accent/30 blur-2xl sm:h-64 sm:w-64"
          />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <span className="animate-pop-in rounded-full border-2 border-primary/40 bg-white/70 px-4 py-1.5 text-sm font-bold text-primary-content shadow-sm">
              ✨ Free forever
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              Create Your{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Account
              </span>
            </h1>
            <p className="max-w-xl text-ink/70">
              Free, always. Sign up to have a Storyburst account of your own.
            </p>
          </div>
        </section>

        <SignUpForm />
      </main>
      <Footer />
    </div>
  )
}
