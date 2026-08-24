'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sidebarLinks = [
  { href: '/library', label: 'Home', icon: 'home' },
  { href: '/library/my-library', label: 'Library', icon: 'auto_stories' },
  { href: '/library/profile', label: 'Genres', icon: 'category', inert: true },
  { href: '/library/profile', label: 'History', icon: 'history', inert: true },
]

const bottomTabs = [
  { href: '/library', label: 'Discover', icon: 'explore' },
  { href: '/library/my-library', label: 'Library', icon: 'auto_stories' },
  { href: '/library/profile', label: 'Updates', icon: 'notifications_active', inert: true },
  { href: '/library/profile', label: 'Profile', icon: 'person' },
]

export default function NoirNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-screen w-72 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-noir-surface-container-highest py-[24px]">
        <div className="mb-[32px] flex items-center gap-4 px-6">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-noir-surface-container-lowest flex items-center justify-center text-noir-primary-container font-noir-display font-black">
            NW
          </div>
          <div>
            <h2 className="font-noir-display text-[16px] font-semibold text-noir-on-surface">Manga Enthusiast</h2>
            <p className="font-noir-mono text-[11px] text-noir-primary-container">Premium Member</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2">
          {sidebarLinks.map((link) => {
            const isActive = !link.inert && pathname === link.href
            return (
              <Link
                key={link.label}
                href={link.href}
                aria-disabled={link.inert}
                className={`flex items-center gap-4 rounded-full px-6 py-3 font-noir-display text-[15px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-noir-primary-container text-noir-on-primary-container'
                    : link.inert
                      ? 'text-noir-on-surface-variant/50'
                      : 'text-noir-on-surface-variant hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-2">
          <Link
            href="/"
            className="flex items-center gap-4 rounded-full px-6 py-3 font-noir-display text-[15px] font-semibold text-noir-on-surface-variant transition-colors hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Back to Storyburst
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-noir-background/90 px-[16px] backdrop-blur-xl md:hidden">
        <Link href="/" className="flex h-10 w-10 items-center justify-center text-noir-primary-container">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <span className="font-noir-display text-[20px] font-black uppercase tracking-tighter text-noir-primary-container">
          Newsletter
        </span>
        <button type="button" className="flex h-10 w-10 items-center justify-center text-noir-primary-container" aria-label="Search (not wired up in this demo)">
          <span className="material-symbols-outlined">search</span>
        </button>
      </header>

      {/* Mobile bottom tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-white/10 bg-noir-background/90 px-4 pb-4 backdrop-blur-xl md:hidden">
        {bottomTabs.map((tab) => {
          const isActive = !tab.inert && pathname === tab.href
          return (
            <Link
              key={tab.label}
              href={tab.href}
              aria-disabled={tab.inert}
              className={`flex flex-col items-center justify-center gap-1 pt-2 transition-transform active:scale-90 ${
                isActive
                  ? 'border-t-2 border-noir-primary-container text-noir-primary-container'
                  : tab.inert
                    ? 'text-noir-on-surface-variant/40'
                    : 'text-noir-on-surface-variant hover:text-noir-primary'
              }`}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              <span className="font-noir-mono text-[11px]">{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
