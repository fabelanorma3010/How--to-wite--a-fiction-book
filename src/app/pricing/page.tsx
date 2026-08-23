import type { Metadata } from 'next'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export const metadata: Metadata = {
  title: 'Pricing — Storyburst',
  description: 'Storyburst is free to use. Placeholder tiers below for layout only.',
}

const tiers = [
  {
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    tagline: "What you get today — no account, no paywall.",
    features: [
      'The full format-matching quiz',
      'All genre tips for every book type',
      'Action-text & illustration idea generators',
      'Auto-saving story notebook',
      'The 10-step publishing guide',
    ],
    cta: 'Start writing',
    ctaHref: '/#quiz',
    highlight: false,
  },
  {
    name: 'Supporter',
    price: '$5',
    cadence: '/mo (example)',
    tagline: 'Illustrative placeholder — not a real plan yet.',
    features: [
      'Unlimited saved notebooks',
      'Priority new generator prompts',
      'Early access to new book types',
      'A little badge, because you\'re nice',
    ],
    cta: 'Placeholder',
    ctaHref: '#',
    highlight: true,
  },
  {
    name: 'Studio',
    price: '$15',
    cadence: '/mo (example)',
    tagline: 'Illustrative placeholder — for classrooms or small teams.',
    features: [
      'Everything in Supporter',
      'Shared notebooks for a group',
      'Shared publishing checklists',
      'Priority email support',
    ],
    cta: 'Placeholder',
    ctaHref: '#',
    highlight: false,
  },
]

export default function PricingPage() {
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
              💸 Simple, honest pricing
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              Storyburst is{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Free
              </span>
            </h1>
            <p className="max-w-2xl text-balance text-lg text-ink/70">
              Every tool on this site — the quiz, the generators, the notebook, the publishing
              guide — works today with no account and no cost.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6">
          <div className="mx-auto mb-8 max-w-3xl rounded-2xl border-2 border-dashed border-accent/50 bg-accent/10 p-4 text-center text-sm font-semibold text-ink/70">
            ⚠️ The two paid tiers below are placeholder layout content, not a real offer — swap in
            real plans here before this page goes live, or delete them and keep Storyburst free.
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`animate-pop-in flex flex-col rounded-3xl border-2 p-6 shadow-sm sm:p-8 ${
                  tier.highlight
                    ? 'border-primary bg-white shadow-lg sm:scale-105'
                    : 'border-ink/10 bg-white/70'
                }`}
              >
                {tier.highlight && (
                  <span className="mb-3 w-fit rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-content">
                    Example only
                  </span>
                )}
                <h2 className="text-xl font-extrabold text-ink">{tier.name}</h2>
                <p className="mt-1 text-sm text-ink/60">{tier.tagline}</p>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-ink">{tier.price}</span>
                  <span className="ml-1 text-sm font-semibold text-ink/50">{tier.cadence}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-ink/80">
                      <span aria-hidden="true" className="mt-0.5 text-secondary-content">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href={tier.ctaHref}
                  className={`mt-8 rounded-full px-6 py-3 text-center font-bold shadow-sm transition-transform hover:scale-105 active:scale-95 ${
                    tier.highlight
                      ? 'bg-primary text-primary-content'
                      : 'border-2 border-ink/15 bg-white text-ink hover:bg-base'
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
