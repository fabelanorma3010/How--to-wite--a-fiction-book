import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('TermsPage')
  const title = t('metaTitle')
  const description = t('metaDescription')
  return {
    title,
    description,
    alternates: { canonical: '/terms' },
    openGraph: { title, description, url: '/terms', images: '/opengraph-image' },
    twitter: { card: 'summary', title, description, images: '/opengraph-image' },
  }
}

export default async function TermsPage() {
  const t = await getTranslations('TermsPage')

  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">{t('heading')}</h1>
          <p className="mt-3 text-sm font-semibold text-ink/50">{t('lastUpdated')}</p>

          {t('langNotice') && (
            <p className="mt-6 rounded-2xl border-2 border-accent/30 bg-accent/10 p-4 text-sm text-ink/70">
              {t('langNotice')}
            </p>
          )}

          <p className="mt-8 rounded-2xl border-2 border-ink/10 bg-white/60 p-5 text-sm text-ink/70">
            Storyburst is a free, independent personal project — not a registered company. These terms
            are written in plain language so they're actually readable, not a substitute for a lawyer's
            review. If something here doesn't sit right with you, don't sign up, or reach out first.
          </p>

          <div className="mt-10 space-y-8 text-ink/80">
            <section>
              <h2 className="text-xl font-extrabold text-ink">{t('s1Title')}</h2>
              <p className="mt-2 leading-relaxed">
                By creating an account or using Storyburst, you agree to these Terms of Service and the{' '}
                <a href="/privacy" className="font-bold text-ink underline underline-offset-2">
                  Privacy Policy
                </a>
                . If you don't agree, please don't create an account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">{t('s2Title')}</h2>
              <p className="mt-2 leading-relaxed">
                You need to be at least 13 years old to create an account. Sign up with a real email
                and a password, or with your Google account. Keep your login to yourself — you're
                responsible for anything that happens under your account. One account per person,
                please.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">{t('s3Title')}</h2>
              <p className="mt-2 leading-relaxed">
                Use Storyburst to write, brainstorm, and illustrate your stories. Don't use it to create
                or share anything illegal, harassing, hateful, or infringing on someone else's rights —
                including when using the AI-assisted tools.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">{t('s4Title')}</h2>
              <p className="mt-2 leading-relaxed">
                Whatever you write in your notebook or story is yours. Some features send your prompts to
                third-party AI providers to generate a response: the Illustration Generator uses OpenAI,
                and the Fiction Helper chat uses Anthropic. Review what they generate before you use it —
                AI output can be wrong, weird, or need editing, and we don't guarantee its accuracy or
                originality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">{t('s5Title')}</h2>
              <p className="mt-2 leading-relaxed">
                Storyburst is provided &quot;as is,&quot; free of charge, and maintained by one person in
                their spare time. Features can change or break, and we can't promise the site will always
                be available. Please keep your own backup copies of anything important you write.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">{t('s6Title')}</h2>
              <p className="mt-2 leading-relaxed">
                To the extent the law allows, Storyburst and its creator aren't liable for damages or
                losses arising from your use of the site, including lost content or anything an AI feature
                generates.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">{t('s7Title')}</h2>
              <p className="mt-2 leading-relaxed">
                You can stop using Storyburst any time. To delete your account and data, email us — see{' '}
                <a href="/contact" className="font-bold text-ink underline underline-offset-2">
                  Contact
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">{t('s8Title')}</h2>
              <p className="mt-2 leading-relaxed">
                If these terms change in a meaningful way, we'll update the date at the top of this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-ink">{t('s9Title')}</h2>
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
