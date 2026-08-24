import Link from 'next/link'

const footerLinks = [
  { href: '/#quiz', label: 'Quiz' },
  { href: '/#book-types', label: 'Book Types' },
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
  { href: '/library', label: 'Digital Library' },
]

const legalLinks = [
  { href: '/terms', label: 'Terms of Service' },
  { href: '/privacy', label: 'Privacy Policy' },
]

export default function Footer() {
  return (
    <footer className="border-t-4 border-ink/10 bg-white/50 px-4 py-8 text-center sm:px-6">
      <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {footerLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-bold text-ink/70 transition-colors hover:text-ink"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <p className="mt-6 font-bold text-ink/70">
        📖 Storyburst — made for writers, artists, and everyone in between.
      </p>
      <p className="mt-1 text-sm text-ink/50">
        Keep drafting, keep drawing, and get that story out into the world.
      </p>

      <nav aria-label="Legal" className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {legalLinks.map((link) => (
          <Link key={link.href} href={link.href} className="text-xs font-semibold text-ink/40 transition-colors hover:text-ink/70">
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  )
}
