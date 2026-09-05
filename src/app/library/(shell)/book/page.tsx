import type { Metadata } from 'next'
import Link from 'next/link'
import ReadAloud from '../../../../components/ReadAloud'
import ShimmerNextImage from '../../../../components/ShimmerNextImage'

export const metadata: Metadata = { title: 'Book' }

const chapters = [
  { num: 'CH 142', title: "The Architect's Fall", date: 'Today', read: false },
  { num: 'CH 141', title: 'Echoes in the Core', date: 'Oct 24', read: true },
  { num: 'CH 140', title: 'Shattered Glass', date: 'Oct 17', read: true },
]

const synopsis =
  "In the sprawling mega-structure of Sector 7, power is everything, and the Ascendant Syndicate holds all the cards. When former enforcer Jax is resurrected with experimental cybernetics, he discovers a conspiracy that reaches the highest levels of the city's elite. Stripped of his past and fueled by a volatile new energy source, he must navigate a brutal underworld of augmented mercs and rogue AI to find the truth behind Protocol Zero."

export default function BookDetailsPage() {
  return (
    <div className="relative pb-[48px]">
      <p className="relative z-10 border-b border-white/10 bg-noir-surface-container-low px-[16px] py-2 text-center font-noir-mono text-[10px] uppercase tracking-wider text-noir-on-surface-variant">
        See also the original{' '}
        <Link href="/library/manga-profile" className="text-noir-secondary-fixed-dim underline">
          Manga Profile
        </Link>{' '}
        layout (different book, same treatment)
      </p>
      <div className="pt-[24px] md:pt-[32px]">
      <div className="pointer-events-none absolute left-0 top-0 -z-10 h-[530px] w-full overflow-hidden opacity-30">
        <div
          className="h-full w-full scale-110 bg-cover bg-center blur-3xl"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDPlTZ3y75x62eGTYqtwO6qYj5eAeLxBzx69NXwI31ZAAOwQ0hf3agsLreXdNpjxHuUqA88z5C_ab_j05zqwznZdgXASGKW5hU-aY_cREGR6WlJj5ky8MpIVCBnCTeRXnT_Tg3ecyfqjnc7GnPneMPiHA2QkXEo2eNJQ_XjC2-gIAhcl_S7agbv_9_iuAbpE3vvNUpMjoMLUVxiMpKMW_yIKfZotzhcP42PVPfaGc0Yjhb7f_2bKnIi5w')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-noir-background to-noir-background" />
      </div>

      <div className="mx-auto max-w-7xl px-[16px] md:px-[32px]">
        <div className="relative z-10 grid grid-cols-1 items-start gap-[48px] md:grid-cols-12">
          <div className="group flex flex-col items-center md:col-span-4 md:items-start">
            <div className="relative aspect-[2/3] w-2/3 overflow-hidden rounded-[0.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-transform duration-500 hover:scale-[1.02] md:w-full">
              <ShimmerNextImage
                alt="Neon Ascendant: Protocol Zero cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA44t8f7WDYU30gO3u69bvfgVCzx2IbP3pmSJMJ5LLOXHwPf3Qs2oSHuFjohMvgCAVxR99KZWpwCXLKArzTFBjJ0cuGRsYffez_T3bjdq_Drzmr5VnoWpqYYpDGvHL682rc_8j9AfLLdmnfk1DoDf1l6LxjCPoqEqDynDw-AXKl8X9TNLKl_a5SlkVCKqqUp73GnRiGVfsd4wiDkTYn-chFJ3T6PHg30nF21jQ-Hc6rv6eQ_CgdDyonpw"
                fill
                priority
                sizes="(min-width: 768px) 33vw, 66vw"
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <Link
                  href="/library/manga-reader"
                  aria-label="Read now"
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-noir-primary-fixed text-noir-on-primary-fixed shadow-lg transition-transform active:scale-90"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col pt-4 md:col-span-8 md:pt-0">
            <div className="mb-[8px] flex flex-wrap gap-2">
              <span className="rounded-[0.25rem] border border-white/10 bg-noir-surface-container px-3 py-1 font-noir-mono text-[12px] uppercase tracking-wider text-noir-on-surface-variant">
                Sci-Fi
              </span>
              <span className="rounded-[0.25rem] border border-white/10 bg-noir-surface-container px-3 py-1 font-noir-mono text-[12px] uppercase tracking-wider text-noir-on-surface-variant">
                Action
              </span>
              <span className="flex items-center gap-1 rounded-[0.25rem] border border-noir-tertiary-fixed/30 bg-noir-surface-container px-3 py-1 font-noir-mono text-[12px] uppercase tracking-wider text-noir-tertiary-fixed">
                <span className="material-symbols-outlined text-[14px]">local_fire_department</span> Trending
              </span>
            </div>

            <h1 className="noir-text-gradient mb-2 font-noir-display text-[28px] font-extrabold md:text-[48px]">
              Neon Ascendant: Protocol Zero
            </h1>
            <p className="mb-6 font-noir-display text-[20px] text-noir-on-surface-variant">
              By Kaelen Vance · Art by J.R. Ryu
            </p>

            <div className="noir-glass-panel mb-[24px] flex w-fit flex-wrap items-center gap-6 rounded-[0.5rem] border border-white/5 p-4">
              <div className="flex items-center gap-2">
                <div className="flex text-noir-primary-fixed">
                  {['star', 'star', 'star', 'star', 'star_half'].map((icon, i) => (
                    <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${i < 4 ? 1 : 0}` }}>
                      {icon}
                    </span>
                  ))}
                </div>
                <span className="font-noir-mono text-[12px] text-noir-on-surface">
                  4.8 <span className="text-noir-on-surface-variant">(12k)</span>
                </span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex flex-col">
                <span className="font-noir-mono text-[12px] uppercase text-noir-on-surface-variant">Status</span>
                <span className="font-noir-display text-[16px] text-noir-on-surface">Ongoing</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex flex-col">
                <span className="font-noir-mono text-[12px] uppercase text-noir-on-surface-variant">Chapters</span>
                <span className="font-noir-display text-[16px] text-noir-on-surface">142</span>
              </div>
            </div>

            <div className="mb-[48px]">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h3 className="font-noir-display text-[20px] font-semibold text-noir-on-surface">Synopsis</h3>
                <ReadAloud
                  text={synopsis}
                  label="Read Synopsis"
                  className="rounded-[0.25rem] border border-white/10 bg-noir-surface-container px-3 py-1 font-noir-mono text-[11px] uppercase tracking-wider text-noir-on-surface-variant transition-colors hover:border-noir-secondary-fixed-dim/50 hover:text-noir-secondary-fixed-dim disabled:cursor-not-allowed disabled:opacity-40"
                />
              </div>
              <p className="max-w-3xl font-noir-display text-[16px] leading-relaxed text-noir-on-surface-variant">
                {synopsis}
              </p>
            </div>

            <div className="mt-auto flex flex-col gap-4 sm:flex-row">
              <Link
                href="/library/manga-reader"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-noir-primary-fixed px-8 py-4 font-noir-display text-[20px] font-bold text-noir-on-primary-fixed shadow-[0_0_20px_rgba(255,225,109,0.2)] transition-colors hover:bg-noir-primary-fixed-dim active:scale-95 sm:flex-none"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  menu_book
                </span>
                Read First Chapter
              </Link>
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-noir-secondary-fixed-dim px-8 py-4 font-noir-display text-[20px] text-noir-secondary-fixed-dim transition-colors hover:bg-noir-secondary-fixed-dim/10 active:scale-95 sm:flex-none"
              >
                <span className="material-symbols-outlined">bookmark_add</span>
                Add to Library
              </button>
            </div>
          </div>
        </div>

        <div className="my-[48px] h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="font-noir-display text-[28px] font-bold text-noir-on-surface">Recent Chapters</h2>
              <span className="flex items-center gap-1 font-noir-mono text-[12px] text-noir-secondary-fixed-dim">
                View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {chapters.map((ch) => (
                <Link
                  href="/library/manga-reader"
                  key={ch.num}
                  className="group relative flex items-center justify-between overflow-hidden rounded-[0.5rem] border border-transparent bg-noir-surface-container p-4 transition-colors hover:border-white/5 hover:bg-noir-surface-bright"
                >
                  <div className="z-10 flex items-center gap-4">
                    <span className="w-12 font-noir-mono text-[12px] text-noir-on-surface-variant">{ch.num}</span>
                    <span className="font-noir-display text-[16px] text-noir-on-surface transition-colors group-hover:text-noir-primary-fixed">
                      {ch.title}
                    </span>
                  </div>
                  <span className="z-10 font-noir-mono text-[12px] text-noir-on-surface-variant">{ch.date}</span>
                  <div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/5">
                    {ch.read && <div className="h-full w-full bg-noir-secondary-fixed-dim" />}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="h-full rounded-[0.75rem] border border-white/5 bg-noir-surface-container-low p-6">
              <h3 className="mb-6 font-noir-mono text-[12px] uppercase tracking-wider text-noir-on-surface-variant">
                About the Creator
              </h3>
              <div className="mb-4 flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-noir-surface-bright">
                  <ShimmerNextImage
                    alt="Kaelen Vance"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDl1RrjTUGRTSxrAQYjOayZ60EI7iPJply4b98JCQ3V1DSrBOY_9OcJd7HU1Xxr9ei65QjuNnjUlg1-bl-SoojQ_oEMOT1MCekS0HZ0pFQ9WK38cvClE86rxX2l9Nl4VM3sq8Fe1MIWQrSsxTI1YA5t89idxoegv9HQggyAD0GuKbr3M0wLeNBwLv2RuIeaeeMm39OjehvOzb_qIQxaxxh3BZyA5e6EbRcgHvsK9s9noQ8xnCqPwwHV7w"
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-noir-display text-[20px] font-semibold text-noir-on-surface">Kaelen Vance</h4>
                  <p className="font-noir-display text-[14px] text-noir-on-surface-variant">Writer / Creator</p>
                </div>
              </div>
              <p className="mb-6 font-noir-display text-[14px] text-noir-on-surface-variant">
                Award-winning author known for deep world-building and kinetic action sequences.
                &apos;Neon Ascendant&apos; is their third major graphic novel serialization.
              </p>
              <button
                type="button"
                className="w-full rounded-[0.375rem] border border-white/10 py-3 font-noir-mono text-[12px] text-noir-on-surface transition-colors hover:bg-white/5"
              >
                View Creator Profile
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
