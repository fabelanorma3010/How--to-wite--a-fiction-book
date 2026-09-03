'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

interface Account {
  firstName: string
  initials: string
}

const sidebarLinks = [
  { href: '/library', label: 'Home', icon: 'home' },
  { href: '/library/my-library', label: 'Library', icon: 'auto_stories' },
  { href: '/library/genres', label: 'Genres', icon: 'category' },
  { href: '/library/history', label: 'History', icon: 'history' },
  { href: '/library/profile', label: 'Profile', icon: 'person' },
]

const bottomTabs = [
  { href: '/library', label: 'Discover', icon: 'explore' },
  { href: '/library/my-library', label: 'Library', icon: 'auto_stories' },
  { href: '/library/updates', label: 'Updates', icon: 'notifications_active' },
  { href: '/library/profile', label: 'Profile', icon: 'person' },
]

function readAccount(metadata: Record<string, unknown>, email: string | undefined): Account {
  const name = (metadata.name as string) || (metadata.full_name as string) || email || 'Member'
  const firstName =
    (metadata.first_name as string) || (metadata.given_name as string) || name.split(' ')[0] || 'Member'
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]!.toUpperCase())
      .slice(0, 2)
      .join('') || 'M'
  return { firstName, initials }
}

export default function NoirNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [account, setAccount] = useState<Account | null | undefined>(undefined)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) {
      setAccount(null)
      return
    }
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user
      setAccount(u ? readAccount((u.user_metadata ?? {}) as Record<string, unknown>, u.email ?? undefined) : null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase?.auth.signOut()
    setAccount(null)
    router.refresh()
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-screen w-72 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-noir-surface-container-highest py-[24px]">
        <div className="mb-[32px] flex items-center gap-4 px-6">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-noir-surface-container-lowest flex items-center justify-center text-noir-primary-container font-noir-display font-black">
            {account ? account.initials : 'DL'}
          </div>
          <div>
            <h2 className="font-noir-display text-[16px] font-semibold text-noir-on-surface">
              {account ? account.firstName : 'Digital Library'}
            </h2>
            <p className="font-noir-mono text-[11px] text-noir-primary-container">
              {account === undefined ? ' ' : account ? 'Member' : 'Browsing as guest'}
            </p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-4 rounded-full px-6 py-3 font-noir-display text-[15px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-noir-primary-container text-noir-on-primary-container'
                    : 'text-noir-on-surface-variant hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="flex flex-col gap-1 px-2">
          {account ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-4 rounded-full px-6 py-3 font-noir-display text-[15px] font-semibold text-noir-on-surface-variant transition-colors hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Log out
            </button>
          ) : account === null ? (
            <Link
              href={`/login?next=${encodeURIComponent(pathname)}`}
              className="flex items-center gap-4 rounded-full px-6 py-3 font-noir-display text-[15px] font-semibold text-noir-on-surface-variant transition-colors hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              Log in
            </Link>
          ) : null}
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
          Library
        </span>
        <Link
          href={account ? '/library/profile' : `/login?next=${encodeURIComponent(pathname)}`}
          className="flex h-10 w-10 items-center justify-center text-noir-primary-container"
          aria-label={account ? 'Your profile' : 'Log in'}
        >
          <span className="material-symbols-outlined">{account ? 'account_circle' : 'login'}</span>
        </Link>
      </header>

      {/* Mobile bottom tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-white/10 bg-noir-background/90 px-4 pb-4 backdrop-blur-xl md:hidden">
        {bottomTabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 pt-2 transition-transform active:scale-90 ${
                isActive
                  ? 'border-t-2 border-noir-primary-container text-noir-primary-container'
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
