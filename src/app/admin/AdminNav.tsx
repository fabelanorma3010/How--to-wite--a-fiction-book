'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/admin/subscriptions', label: 'Subscriptions' },
  { href: '/admin/members', label: 'Members' },
]

export default function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className="flex gap-1">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
              active ? 'bg-ink text-white' : 'text-ink/60 hover:bg-ink/10 hover:text-ink'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
