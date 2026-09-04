import type { Metadata } from 'next'
import Link from 'next/link'
import ShimmerImage from '../../../../components/library/ShimmerImage'

export const metadata: Metadata = { title: 'History' }

const history = [
  {
    title: 'Neon Drift: Tokyo Protocol',
    chapter: 'Ch. 42',
    when: 'Today, 2:14 PM',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo4oV0eGelrckOX-SDpUoDV_IM7B7UFDJv6A3Z509BWwkZeFZ3exvZNx8gyBEIitJKyQ2zPsMa-Eh6nqsYg-BSMQg0pailik5PJWWC-3sUbbRP_wK0UdrQf6za9-aznwGv8j-DDYF3L4Qar6T-LlJK5kyajgJCsbjsmEGdum_BDxYwRnkgBtLRh_T33MAy95k1mObrs1gYu7AzUmer0XocEisqpEWLI49ynPYkMXwEYNfL3CrxbDsfdw',
  },
  {
    title: 'Ashen Vanguard',
    chapter: 'Ch. 12 (Finished)',
    when: 'Yesterday, 9:02 PM',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCO8eJ-fLIkLt-MkjCnADo3CckB3m4zI55EZBGxzVHBKxJMhqSYXwAYDFJkDg3VNrsd0wBID-sNwh0AbCjF2dLLikYdWcNLeoalbKC_bpicf-hJ7eu3mQPIykpud-ImmPqpkzTydQbxDSbS87MnnHnXFPibCH28LEiaB-2D9kxfRRo9t2LtE8qTHnw8w3CFt1JwrLIeBIBHUHHp4KHHswthOWWWw3Uf9ULicoaPy9z16H63_J2fr8G-Iw',
  },
  {
    title: 'Iron Paradigm',
    chapter: 'Ch. 8',
    when: '2 days ago',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBqV-ZeDuOVPmajrEsAv6dmwW7qnmBoYj_7yOFb_wPa47_T_F8Z55vCi8TQlBY1QgZWiUu-j462tsdn3FldiuanhfvO86qNDFXTM8JHY285vVF9W6bPXeqRFfLOwDARReRLL_G_7AoChGKC1M-GFZSnPG1DkgW7OukC-qhrSV_KlJJqxNiTYLYE6LW9Ihrg3lVYw_Vvhx9hPak7Luf_YQwIGf7a2xGrusAwcxjxLgmj64PQiuSOJo8FQ',
  },
  {
    title: 'Whispers of the Deep Vault',
    chapter: 'Ch. 89',
    when: '4 days ago',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVCk73dNHatQnvw5azUXAcHzL9Xspe387dVT84WjSZeKndmjTchwn5fTUdQJu-eZKwaUdvd8XqiCRlCNoq6-fMjwXLcYJ_WlFOJvCFAIqKNS2DgwoX6D2gda38OliT0NSnwjBpT1yEc6oh4liUySyqkpi7JO5NWmb1iG0n84-5aXDsw8deheA-DUNRs1loVOTUN_wYSOfmtzz8TTFU4yJn5TiYIoIsqyPNlYe8YkDgtc3eCjPAqRPDUA',
  },
  {
    title: 'Concrete Shadows',
    chapter: 'Ch. 1',
    when: 'Last week',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnop3Xkhrnqej09K-cK0uyvN2SBT3XTGSITFNuloAWC7W-hWWUcmAgsg0q3oOjYMZek1Iwj8M25-iwFLCnsxpFzOumkyoAUS-QaojgM3JpMrilb76d8_Njn_XCXv2iaDbHuwlLL-ODjBH0QN-0hYbbNgYdLwZikN3CyUiuOTGCN-l8O0EWMvn3qOqxpVo8_c3A44sIXbRkYJpfIh8iCZtsJXlhTAY-QpW0cQf0tkO8Qb2XPPtLLHI-gw',
  },
]

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-3xl px-[16px] py-[24px] md:px-[32px] md:py-[48px]">
      <h1 className="mb-[24px] font-noir-display text-[28px] font-bold text-noir-on-surface md:text-[48px]">
        History
      </h1>
      <div className="flex flex-col gap-2">
        {history.map((item, i) => (
          <Link
            href="/library/book"
            key={`${item.title}-${i}`}
            className="group flex items-center gap-4 rounded-[0.5rem] border border-transparent bg-noir-surface-container-low p-3 transition-colors hover:border-white/10 hover:bg-noir-surface-container"
          >
            <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded">
              <ShimmerImage alt={item.title} src={item.img} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-noir-display text-[16px] text-noir-on-surface transition-colors group-hover:text-noir-primary">
                {item.title}
              </h3>
              <span className="font-noir-mono text-[12px] text-noir-on-surface-variant">{item.chapter}</span>
            </div>
            <span className="shrink-0 font-noir-mono text-[12px] text-noir-on-surface-variant">{item.when}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
