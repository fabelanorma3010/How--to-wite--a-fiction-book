import { useState } from 'react'

const navLinks = [
  { href: '#quiz', label: 'Quiz' },
  { href: '#book-types', label: 'Book Types' },
  { href: '#action-generator', label: 'Action Text' },
  { href: '#illustration-generator', label: 'Illustrations' },
  { href: '#notebook', label: 'Notebook' },
  { href: '#publish', label: 'Publish' },
  { href: '#community', label: 'Community' },
  { href: '#contact', label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b-4 border-ink/10 bg-base/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
          <span aria-hidden="true" className="text-2xl sm:text-3xl">📖</span>
          Storyburst
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 font-semibold text-ink/80 transition-colors hover:bg-primary/15 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="flex items-center justify-center rounded-full border-2 border-ink/15 p-2 text-ink transition-colors hover:bg-primary/15 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="flex flex-col gap-1 border-t-4 border-ink/10 bg-base px-4 pb-4 pt-2 md:hidden"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 font-semibold text-ink/80 transition-colors hover:bg-primary/15 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
