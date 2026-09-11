'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

const footerLinks = [
  { href: '/quiz', key: 'quiz' },
  { href: '/book-types', key: 'bookTypes' },
  { href: '/tools', key: 'tools' },
  { href: '/creators', key: 'creators' },
  { href: '/about', key: 'about' },
  { href: '/pricing', key: 'pricing' },
  { href: '/contact', key: 'contact' },
  { href: '/library', key: 'digitalLibrary' },
] as const

const legalLinks = [
  { href: '/terms', key: 'terms' },
  { href: '/privacy', key: 'privacy' },
] as const

export default function Footer() {
  const t = useTranslations('Footer')

  return (
    <footer className="border-t-4 border-ink/10 bg-white/50 px-4 py-8 text-center sm:px-6">
      <nav aria-label={t('navLabel')} className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {footerLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-bold text-ink/70 transition-colors hover:text-ink"
          >
            {t(link.key)}
          </Link>
        ))}
      </nav>
      <p className="mt-6 font-bold text-ink/70">{t('tagline')}</p>
      <p className="mt-1 text-sm text-ink/50">{t('subtagline')}</p>

      <nav aria-label={t('legalLabel')} className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {legalLinks.map((link) => (
          <Link key={link.href} href={link.href} className="text-xs font-semibold text-ink/40 transition-colors hover:text-ink/70">
            {t(link.key)}
          </Link>
        ))}
      </nav>
    </footer>
  )
}
