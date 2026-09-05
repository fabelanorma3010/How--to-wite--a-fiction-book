'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ShimmerNextImage from '../../../../components/ShimmerNextImage'

const tabs = ['Reading', 'Completed', 'Downloaded'] as const

const readingNow = [
  {
    title: 'Neon Drift: Tokyo Protocol',
    progress: 'Ch. 42 / 120',
    pct: 35,
    badge: 'Update',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo4oV0eGelrckOX-SDpUoDV_IM7B7UFDJv6A3Z509BWwkZeFZ3exvZNx8gyBEIitJKyQ2zPsMa-Eh6nqsYg-BSMQg0pailik5PJWWC-3sUbbRP_wK0UdrQf6za9-aznwGv8j-DDYF3L4Qar6T-LlJK5kyajgJCsbjsmEGdum_BDxYwRnkgBtLRh_T33MAy95k1mObrs1gYu7AzUmer0XocEisqpEWLI49ynPYkMXwEYNfL3CrxbDsfdw',
  },
  {
    title: 'Iron Paradigm',
    progress: 'Ch. 8 / 50',
    pct: 16,
    badge: 'Hot',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBqV-ZeDuOVPmajrEsAv6dmwW7qnmBoYj_7yOFb_wPa47_T_F8Z55vCi8TQlBY1QgZWiUu-j462tsdn3FldiuanhfvO86qNDFXTM8JHY285vVF9W6bPXeqRFfLOwDARReRLL_G_7AoChGKC1M-GFZSnPG1DkgW7OukC-qhrSV_KlJJqxNiTYLYE6LW9Ihrg3lVYw_Vvhx9hPak7Luf_YQwIGf7a2xGrusAwcxjxLgmj64PQiuSOJo8FQ',
  },
  {
    title: 'Whispers of the Deep Vault',
    progress: 'Ch. 89 / ?',
    pct: 80,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVCk73dNHatQnvw5azUXAcHzL9Xspe387dVT84WjSZeKndmjTchwn5fTUdQJu-eZKwaUdvd8XqiCRlCNoq6-fMjwXLcYJ_WlFOJvCFAIqKNS2DgwoX6D2gda38OliT0NSnwjBpT1yEc6oh4liUySyqkpi7JO5NWmb1iG0n84-5aXDsw8deheA-DUNRs1loVOTUN_wYSOfmtzz8TTFU4yJn5TiYIoIsqyPNlYe8YkDgtc3eCjPAqRPDUA',
  },
  {
    title: 'Concrete Shadows',
    progress: 'Ch. 1 / 24',
    pct: 4,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnop3Xkhrnqej09K-cK0uyvN2SBT3XTGSITFNuloAWC7W-hWWUcmAgsg0q3oOjYMZek1Iwj8M25-iwFLCnsxpFzOumkyoAUS-QaojgM3JpMrilb76d8_Njn_XCXv2iaDbHuwlLL-ODjBH0QN-0hYbbNgYdLwZikN3CyUiuOTGCN-l8O0EWMvn3qOqxpVo8_c3A44sIXbRkYJpfIh8iCZtsJXlhTAY-QpW0cQf0tkO8Qb2XPPtLLHI-gw',
  },
]

const savedForLater = [
  {
    title: 'Void Fragments',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChcas8OVp_fLn6JCFdOlKDjyPz44oMAM1QfWgoeY_kqk1Ysf_K2wtvfRtUz4Fj8-0SZOa-aN31RSx0AQHfLOOBR4vMlZK81sNd6DKm6OYzTLwJl43QUvN35THvXcPRIbT3-fTFdeNprVGE80UZQjNS-dU89B4V_SjhroxB-JGNMiNzmbk11U0646rro_Rx-rFpDBfHHWWQs-yN2VJCFd4XHx0BEiPEiY9cmvtPoQGPekvoTJIj-pP0Rw',
  },
]

const completed = [
  {
    title: 'Ashen Vanguard',
    chapters: '12 / 12',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCO8eJ-fLIkLt-MkjCnADo3CckB3m4zI55EZBGxzVHBKxJMhqSYXwAYDFJkDg3VNrsd0wBID-sNwh0AbCjF2dLLikYdWcNLeoalbKC_bpicf-hJ7eu3mQPIykpud-ImmPqpkzTydQbxDSbS87MnnHnXFPibCH28LEiaB-2D9kxfRRo9t2LtE8qTHnw8w3CFt1JwrLIeBIBHUHHp4KHHswthOWWWw3Uf9ULicoaPy9z16H63_J2fr8G-Iw',
  },
]

const downloaded = [
  {
    title: 'Neon Drift: Tokyo Protocol',
    size: '128 MB',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo4oV0eGelrckOX-SDpUoDV_IM7B7UFDJv6A3Z509BWwkZeFZ3exvZNx8gyBEIitJKyQ2zPsMa-Eh6nqsYg-BSMQg0pailik5PJWWC-3sUbbRP_wK0UdrQf6za9-aznwGv8j-DDYF3L4Qar6T-LlJK5kyajgJCsbjsmEGdum_BDxYwRnkgBtLRh_T33MAy95k1mObrs1gYu7AzUmer0XocEisqpEWLI49ynPYkMXwEYNfL3CrxbDsfdw',
  },
  {
    title: 'Iron Paradigm',
    size: '96 MB',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBqV-ZeDuOVPmajrEsAv6dmwW7qnmBoYj_7yOFb_wPa47_T_F8Z55vCi8TQlBY1QgZWiUu-j462tsdn3FldiuanhfvO86qNDFXTM8JHY285vVF9W6bPXeqRFfLOwDARReRLL_G_7AoChGKC1M-GFZSnPG1DkgW7OukC-qhrSV_KlJJqxNiTYLYE6LW9Ihrg3lVYw_Vvhx9hPak7Luf_YQwIGf7a2xGrusAwcxjxLgmj64PQiuSOJo8FQ',
  },
]

function useBookSearch() {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q')
    if (q) setQuery(q)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (query.trim()) params.set('q', query.trim())
    else params.delete('q')
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname)
  }, [query])

  return [query, setQuery] as const
}

function EmptyState({ query }: { query: string }) {
  return (
    <p className="animate-slide-in py-[48px] text-center font-noir-mono text-[13px] text-noir-on-surface-variant">
      No books match &ldquo;{query}&rdquo;.
    </p>
  )
}

const gridImageSizes = '(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw'

export default function MyLibraryPage() {
  const [active, setActive] = useState<(typeof tabs)[number]>('Reading')
  const [query, setQuery] = useBookSearch()

  const q = query.trim().toLowerCase()
  const filtered = useMemo(() => {
    const match = <T extends { title: string }>(list: T[]) =>
      q ? list.filter((item) => item.title.toLowerCase().includes(q)) : list
    return {
      readingNow: match(readingNow),
      savedForLater: match(savedForLater),
      completed: match(completed),
      downloaded: match(downloaded),
    }
  }, [q])

  return (
    <div className="mx-auto max-w-7xl px-[16px] py-[24px] md:px-[32px] md:py-[48px]">
      <div className="mb-[24px] flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h1 className="font-noir-display text-[28px] font-bold text-noir-on-surface md:text-[48px]">
          My Library
        </h1>
        <div className="flex gap-6 overflow-x-auto border-b border-noir-outline-variant/30 pb-1 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActive(tab)}
              className={`whitespace-nowrap pb-2 font-noir-display text-[20px] font-semibold transition-colors ${
                active === tab
                  ? 'border-b-2 border-noir-primary-container text-noir-primary-container'
                  : 'text-noir-on-surface-variant hover:text-noir-on-surface'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-[24px]">
        <div className="relative max-w-md">
          <span
            aria-hidden="true"
            className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-noir-on-surface-variant"
          >
            search
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your books…"
            aria-label="Search your books by title"
            className="w-full rounded-[0.5rem] border border-noir-outline-variant/40 bg-noir-surface-container-low py-2.5 pl-10 pr-9 font-noir-display text-[14px] text-noir-on-surface placeholder:text-noir-on-surface-variant/60 focus:border-noir-primary-container focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-noir-on-surface-variant transition-colors hover:bg-white/5 hover:text-noir-on-surface"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                close
              </span>
            </button>
          )}
        </div>
      </div>

      {active === 'Completed' &&
        (filtered.completed.length === 0 ? (
          <EmptyState query={query.trim()} />
        ) : (
          <div
            key={active}
            className="animate-slide-in grid grid-cols-2 gap-[16px] md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-[24px]"
          >
            {filtered.completed.map((book) => (
              <Link
                href="/library/book"
                key={book.title}
                className="group relative flex flex-col overflow-hidden rounded-[0.125rem] border border-white/10 bg-noir-surface-container-low transition-colors duration-300 hover:border-noir-primary-container"
              >
                <div className="relative aspect-[2/3] w-full bg-noir-surface-container">
                  <ShimmerNextImage
                    alt={book.title}
                    src={book.img}
                    fill
                    sizes={gridImageSizes}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-[0.125rem] bg-noir-secondary-container px-2 py-0.5 font-noir-mono text-[10px] uppercase tracking-wider text-noir-on-secondary-container">
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    Finished
                  </span>
                  <div className="absolute bottom-0 left-0 flex w-full flex-col justify-end p-3">
                    <h3 className="line-clamp-2 font-noir-display text-[16px] font-semibold leading-tight text-noir-on-surface">
                      {book.title}
                    </h3>
                    <p className="font-noir-mono text-[12px] text-noir-on-surface-variant">{book.chapters} chapters</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ))}

      {active === 'Downloaded' &&
        (filtered.downloaded.length === 0 ? (
          <EmptyState query={query.trim()} />
        ) : (
          <div
            key={active}
            className="animate-slide-in grid grid-cols-2 gap-[16px] md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-[24px]"
          >
            {filtered.downloaded.map((book) => (
              <Link
                href="/library/book"
                key={book.title}
                className="group relative flex flex-col overflow-hidden rounded-[0.125rem] border border-white/10 bg-noir-surface-container-low transition-colors duration-300 hover:border-noir-primary-container"
              >
                <div className="relative aspect-[2/3] w-full bg-noir-surface-container">
                  <ShimmerNextImage
                    alt={book.title}
                    src={book.img}
                    fill
                    sizes={gridImageSizes}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-[0.125rem] bg-noir-surface-container-high px-2 py-0.5 font-noir-mono text-[10px] uppercase tracking-wider text-noir-on-surface">
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      download_done
                    </span>
                    Downloaded
                  </span>
                  <div className="absolute bottom-0 left-0 flex w-full flex-col justify-end p-3">
                    <h3 className="line-clamp-2 font-noir-display text-[16px] font-semibold leading-tight text-noir-on-surface">
                      {book.title}
                    </h3>
                    <p className="font-noir-mono text-[12px] text-noir-on-surface-variant">{book.size} on device</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ))}

      {active === 'Reading' && (
        <div key={active} className="animate-slide-in">
          {filtered.readingNow.length === 0 && filtered.savedForLater.length === 0 ? (
            <EmptyState query={query.trim()} />
          ) : (
            <>
              {filtered.readingNow.length > 0 && (
                <div className="mb-[48px] grid grid-cols-2 gap-[16px] md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-[24px]">
                  {filtered.readingNow.map((book) => (
                    <Link
                      href="/library/book"
                      key={book.title}
                      className="group relative flex flex-col overflow-hidden rounded-[0.125rem] border border-white/10 bg-noir-surface-container-low transition-colors duration-300 hover:border-noir-primary-container"
                    >
                      <div className="relative aspect-[2/3] w-full bg-noir-surface-container">
                        <ShimmerNextImage
                          alt={book.title}
                          src={book.img}
                          fill
                          sizes={gridImageSizes}
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                        {book.badge && (
                          <span
                            className={`absolute left-2 top-2 rounded-[0.125rem] px-2 py-0.5 font-noir-mono text-[10px] uppercase tracking-wider ${
                              book.badge === 'Hot'
                                ? 'bg-noir-tertiary-container text-noir-on-tertiary-container'
                                : 'bg-noir-primary-container text-noir-on-primary-container'
                            }`}
                          >
                            {book.badge}
                          </span>
                        )}
                        <div className="absolute bottom-0 left-0 flex w-full flex-col justify-end p-3">
                          <h3 className="mb-1 line-clamp-2 font-noir-display text-[16px] font-semibold leading-tight text-noir-on-surface">
                            {book.title}
                          </h3>
                          <div className="flex w-full items-center justify-between">
                            <p className="font-noir-mono text-[12px] text-noir-on-surface-variant">{book.progress}</p>
                            <p className="font-noir-mono text-[12px] text-noir-primary-container">{book.pct}%</p>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-noir-surface-variant">
                          <div className="h-full bg-noir-secondary-container" style={{ width: `${book.pct}%` }} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {filtered.savedForLater.length > 0 && (
                <>
                  <h2 className="mb-[24px] flex items-center gap-2 border-t border-white/10 pt-[24px] font-noir-display text-[20px] font-semibold text-noir-on-surface">
                    <span className="material-symbols-outlined text-noir-on-surface-variant">bookmark</span>
                    Saved for Later
                  </h2>
                  <div className="grid grid-cols-2 gap-[16px] md:grid-cols-5">
                    {filtered.savedForLater.map((book) => (
                      <Link
                        href="/library/book"
                        key={book.title}
                        className="group relative aspect-[2/3] overflow-hidden rounded-[0.5rem] border border-white/10 bg-noir-surface-container-low transition-colors hover:border-noir-primary-fixed/50"
                      >
                        <ShimmerNextImage
                          alt={book.title}
                          src={book.img}
                          fill
                          sizes="(min-width: 768px) 20vw, 50vw"
                          className="object-cover opacity-60 grayscale transition-all group-hover:opacity-80 group-hover:grayscale-0"
                        />
                        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black to-transparent p-3">
                          <h3 className="font-noir-display text-[16px] text-noir-on-surface-variant transition-colors group-hover:text-noir-on-surface">
                            {book.title}
                          </h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
