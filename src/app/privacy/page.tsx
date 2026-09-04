import type { Metadata } from 'next'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const title = 'Privacy Policy — Storyburst'
const description = 'What Storyburst collects and how it is used.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/privacy' },
  openGraph: { title, description, url: '/privacy', images: '/opengraph-image' },
  twitter: { card: 'summary', title, description, images: '/opengraph-image' },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-sm font-semibold text-ink/50">Last updated August 24, 2026</p>

          <p className="mt-8 rounded-2xl border-2 border-ink/10 bg-white/60 p-5 text-sm text-ink/70">
            Storyburst is a small personal project. This page describes, honestly and in plain language,
            exactly what data it collects today and where it goes — nothing more.
          </p>

          <div className="mt-10 space-y-8 text-ink/80">
            <section>
              <h2 className="text-xl font-extrabold text-ink">What we collect</h2>
              <p className="mt-2 leading-relaxed">
                If you create an account: your name and email address. Sign-in is handled by our
                authentication provider, Supabase. If you set a password, Supabase stores only a
                secure hash of it — we never see or store your actual password. If you choose
                &ldquo;Continue with Google,&rdquo; Google verifies your identity and shares your
                name, email address, and profile picture with us; your Google password is never
                shared. That account information is the only personal data our servers keep.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">Your notebook</h2>
              <p className="mt-2 leading-relaxed">
                Text you write in the Story Notebook is saved in your own browser's local storage — it
                stays on your device and isn't sent to or stored on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">Cookies</h2>
              <p className="mt-2 leading-relaxed">
                Signing in sets a small number of cookies to keep you logged in. We don't use
                tracking, analytics, or advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">Third-party AI services</h2>
              <p className="mt-2 leading-relaxed">
                A few features send your input to a third-party AI provider to generate a response: the
                Illustration Generator sends your prompt to OpenAI, and the Fiction Helper chat sends your
                messages to Anthropic. Those providers process that content under their own privacy
                policies — we don't control how they handle it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">How your data is used</h2>
              <p className="mt-2 leading-relaxed">
                Only to run your account — signing you in and remembering who you are. We don't sell your
                data, and we don't use it for advertising.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">Deleting your data</h2>
              <p className="mt-2 leading-relaxed">
                Email us through the{' '}
                <a href="/contact" className="font-bold text-ink underline underline-offset-2">
                  Contact page
                </a>{' '}
                and we'll delete your account and the data tied to it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">Children's privacy</h2>
              <p className="mt-2 leading-relaxed">Storyburst accounts are intended for people 13 and older.</p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">Changes to this policy</h2>
              <p className="mt-2 leading-relaxed">
                If what we collect or how we use it changes in a meaningful way, we'll update the date at
                the top of this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">Contact</h2>
              <p className="mt-2 leading-relaxed">
                Questions about this policy? Reach out through the{' '}
                <a href="/contact" className="font-bold text-ink underline underline-offset-2">
                  Contact page
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
