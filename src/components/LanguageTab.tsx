'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { locales, localeNames, type Locale } from '../i18n/config'
import { setUserLocale } from '../i18n/locale'

export default function LanguageTab() {
  const active = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointer(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // The dark Digital Library and the admin panel have their own chrome.
  if (pathname.startsWith('/library') || pathname.startsWith('/admin')) return null

  function choose(next: Locale) {
    setOpen(false)
    if (next === active) return
    startTransition(async () => {
      await setUserLocale(next)
      router.refresh()
    })
  }

  return (
    <div ref={wrapRef} className="fixed left-0 top-1/2 z-40 flex -translate-y-1/2 items-start">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Language: ${localeNames[active]}. Change language`}
        className="flex flex-col items-center gap-0.5 rounded-r-2xl border-2 border-l-0 border-ink/15 bg-white/90 px-2 py-3 shadow-lg backdrop-blur transition-colors hover:bg-white"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          🌐
        </span>
        <span className="text-[10px] font-black uppercase tracking-wider text-ink/70">{active}</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Choose a language"
          className="animate-slide-in ml-2 mt-1 w-44 overflow-hidden rounded-2xl border-2 border-ink/15 bg-white shadow-xl"
        >
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              role="menuitemradio"
              aria-checked={l === active}
              onClick={() => choose(l)}
              disabled={pending}
              className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-primary/10 disabled:opacity-50 ${
                l === active ? 'bg-primary/15 text-primary-content' : 'text-ink/70'
              }`}
            >
              {localeNames[l]}
              {l === active && (
                <span aria-hidden="true" className="text-primary-content">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
