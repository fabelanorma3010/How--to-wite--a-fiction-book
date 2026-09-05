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
          <p className="mt-3 text-sm font-semibold text-ink/50">Last updated September 5, 2026</p>

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
                shared. If you write in the Story Notebook while signed in, that text is saved to
                your account too, so it follows you between devices — see below if you'd rather it
                stay local only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">Public profiles &amp; uploaded books</h2>
              <p className="mt-2 leading-relaxed">
                You can optionally turn on a public profile page (at{' '}
                <span className="font-semibold">www.fiction-book-builder.com/u/your-username</span>) and
                add a bio, avatar, website, and social media links to it — all of that is visible to
                anyone who visits the link, not just to us. You can also upload your own books (title,
                description, cover image, and the book file itself) to show on that page. Anything you
                mark private, or any book on a private profile, stays visible only to you. Turning your
                profile off, or deleting a book, removes it from public view immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">Your notebook</h2>
              <p className="mt-2 leading-relaxed">
                Text you write in the Story Notebook is always saved in your own browser's local
                storage first. If you're signed in, it's also saved to your account so you can pick up
                where you left off on another device. If you're signed out, it stays on your device
                only and isn't sent to our servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">Cookies &amp; analytics</h2>
              <p className="mt-2 leading-relaxed">
                Signing in sets a small number of cookies to keep you logged in. We don't use
                advertising cookies, and we don't sell or share data with advertisers. We do use{' '}
                <a
                  href="https://umami.is"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-ink underline underline-offset-2"
                >
                  Umami
                </a>
                , a privacy-focused analytics tool, to see how many people visit and which pages are
                popular, and{' '}
                <a
                  href="https://vercel.com/docs/speed-insights"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-ink underline underline-offset-2"
                >
                  Vercel Speed Insights
                </a>{' '}
                to measure page-loading performance. Neither uses cookies, tracks you across other
                websites, or collects anything that identifies you personally — just aggregate
                counts and timings. Both only run if you accept the cookie notice on your first
                visit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">Error monitoring</h2>
              <p className="mt-2 leading-relaxed">
                If something breaks while you're using Storyburst, we use{' '}
                <a
                  href="https://sentry.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-ink underline underline-offset-2"
                >
                  Sentry
                </a>{' '}
                to find out and fix it — it captures the error itself, the page you
                were on, and basic technical details like your browser and device
                type. This is separate from the analytics above (it exists to catch
                bugs, not to analyze behavior), doesn't set cookies, and runs
                regardless of the cookie notice choice.
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
                To run your account (signing you in and remembering who you are), to show your public
                profile and books if you choose to make them public, to understand in aggregate how the
                site is used so we know what to improve, and to catch and fix errors when something
                breaks. We don't sell your data, and we don't use it for advertising.
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
