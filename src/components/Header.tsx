'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface AuthUser {
  id: string
  name: string
  email: string
}

const navLinks = [
  { href: '#quiz', label: 'Quiz' },
  { href: '#book-types', label: 'Book Types' },
  { href: '#action-generator', label: 'Action Text' },
  { href: '#illustration-generator', label: 'Illustrations' },
  { href: '#notebook', label: 'Notebook' },
  { href: '#publish', label: 'Publish' },
]

const pageLinks = [
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setUser(data?.user ?? null)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleLogout() {
    setOpen(false)
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b-4 border-ink/10 bg-base/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
          <span aria-hidden="true" className="text-2xl sm:text-3xl">📖</span>
          Storyburst
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-semibold text-ink/80 transition-colors hover:bg-primary/15 hover:text-ink lg:px-3.5"
            >
              {link.label}
            </a>
          ))}
          {pageLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-semibold text-ink/80 transition-colors hover:bg-primary/15 hover:text-ink lg:px-3.5"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/library"
            className="ml-1 whitespace-nowrap rounded-full bg-ink px-3 py-2 font-semibold text-base transition-colors hover:bg-ink/80 lg:px-4"
          >
            Digital Library ↗
          </Link>

          {user ? (
            <div className="ml-1 flex items-center gap-1.5">
              <span className="whitespace-nowrap px-1.5 text-sm font-semibold text-ink/60">
                Hi, {user.name.split(' ')[0]}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-semibold text-ink/80 transition-colors hover:bg-primary/15 hover:text-ink"
              >
                Log out
              </button>
            </div>
          ) : user === null ? (
            <div className="ml-1 flex items-center gap-1.5">
              <Link
                href="/login"
                className="whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-semibold text-ink/80 transition-colors hover:bg-primary/15 hover:text-ink"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="whitespace-nowrap rounded-full border-2 border-ink px-2.5 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
              >
                Sign Up
              </Link>
            </div>
          ) : null}
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

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none md:hidden ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          inert={!open}
          className="flex min-h-0 flex-col gap-1 overflow-hidden border-t-4 border-ink/10 bg-base px-4 pb-4 pt-2"
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
          {pageLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 font-semibold text-ink/80 transition-colors hover:bg-primary/15 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/library"
            onClick={() => setOpen(false)}
            className="rounded-xl bg-ink px-3 py-3 font-semibold text-base transition-colors hover:bg-ink/80"
          >
            Digital Library ↗
          </Link>

          <div className="mt-1 border-t-2 border-ink/10 pt-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2">
                <span className="font-semibold text-ink/60">Hi, {user.name.split(' ')[0]}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full bg-white/70 px-3 py-1.5 text-sm font-bold text-ink transition-colors hover:bg-white"
                >
                  Log out
                </button>
              </div>
            ) : user === null ? (
              <div className="flex gap-2 px-3 py-1">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border-2 border-ink/15 py-2.5 text-center font-semibold text-ink/80 transition-colors hover:bg-primary/15 hover:text-ink"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl bg-ink py-2.5 text-center font-semibold text-white transition-colors hover:bg-ink/80"
                >
                  Sign Up
                </Link>
              </div>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  )
}
