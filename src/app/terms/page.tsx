import type { Metadata } from 'next'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const title = 'Terms of Service — Storyburst'
const description = 'The terms for using Storyburst.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/terms' },
  openGraph: { title, description, url: '/terms', images: '/opengraph-image' },
  twitter: { card: 'summary', title, description, images: '/opengraph-image' },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Terms of Service</h1>
          <p className="mt-3 text-sm font-semibold text-ink/50">Last updated August 24, 2026</p>

          <p className="mt-8 rounded-2xl border-2 border-ink/10 bg-white/60 p-5 text-sm text-ink/70">
            Storyburst is a free, independent personal project — not a registered company. These terms
            are written in plain language so they're actually readable, not a substitute for a lawyer's
            review. If something here doesn't sit right with you, don't sign up, or reach out first.
          </p>

          <div className="mt-10 space-y-8 text-ink/80">
            <section>
              <h2 className="text-xl font-extrabold text-ink">1. Accepting these terms</h2>
              <p className="mt-2 leading-relaxed">
                By creating an account or using Storyburst, you agree to these Terms of Service and the{' '}
                <a href="/privacy" className="font-bold text-ink underline underline-offset-2">
                  Privacy Policy
                </a>
                . If you don't agree, please don't create an account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">2. Accounts</h2>
              <p className="mt-2 leading-relaxed">
                You need to be at least 13 years old to create an account. Sign up with a real email
                and a password, or with your Google account. Keep your login to yourself — you're
                responsible for anything that happens under your account. One account per person,
                please.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">3. Acceptable use</h2>
              <p className="mt-2 leading-relaxed">
                Use Storyburst to write, brainstorm, and illustrate your stories. Don't use it to create
                or share anything illegal, harassing, hateful, or infringing on someone else's rights —
                including when using the AI-assisted tools.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">4. Your content &amp; AI-assisted tools</h2>
              <p className="mt-2 leading-relaxed">
                Whatever you write in your notebook or story is yours. Some features send your prompts to
                third-party AI providers to generate a response: the Illustration Generator uses OpenAI,
                and the Fiction Helper chat uses Anthropic. Review what they generate before you use it —
                AI output can be wrong, weird, or need editing, and we don't guarantee its accuracy or
                originality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">5. No warranty</h2>
              <p className="mt-2 leading-relaxed">
                Storyburst is provided &quot;as is,&quot; free of charge, and maintained by one person in
                their spare time. Features can change or break, and we can't promise the site will always
                be available. Please keep your own backup copies of anything important you write.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">6. Limitation of liability</h2>
              <p className="mt-2 leading-relaxed">
                To the extent the law allows, Storyburst and its creator aren't liable for damages or
                losses arising from your use of the site, including lost content or anything an AI feature
                generates.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">7. Ending your account</h2>
              <p className="mt-2 leading-relaxed">
                You can stop using Storyburst any time. To delete your account and data, email us — see{' '}
                <a href="/contact" className="font-bold text-ink underline underline-offset-2">
                  Contact
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">8. Changes to these terms</h2>
              <p className="mt-2 leading-relaxed">
                If these terms change in a meaningful way, we'll update the date at the top of this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">9. Contact</h2>
              <p className="mt-2 leading-relaxed">
                Questions about these terms? Reach out through the{' '}
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
