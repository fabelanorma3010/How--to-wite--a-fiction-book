import Link from 'next/link'

const trending = [
  {
    title: 'Shadow Walkers',
    meta: 'Action • Fantasy',
    tag: 'Hot',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkTZ-UkXzId53OoPqQl9mIrV8XwEjq7zDEhMyHRc0GL0lIirY5qrsvNfgUYnW4asK326bIT7v_lRb7kO8RBl_6u6s50NKkQMvryFlbcafKS2rbr9wgyVp82QGfSfFEYsf9edfTRoEisNmrHzUbfa056aEgccqRd06vsiZODekWIMX53UmCzlWz5CV9zQ9gIDDucAVsBEefiDrB6eBO6JDdpbLt-GEuQdCWGaf4pXmwxha0rBPrS8xwxw',
  },
  {
    title: 'Neon Magi',
    meta: 'Urban Fantasy',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFth356Vf6iP6ZcdmOHhD327xW60aVfLuh2AK8GRHlF0hijtQisVCXxseM8TP543UUcpstX5wJDF3TKyWHoxdWSHMiHCSlrNy4QxxqhM4nd1-7UqvefB_e0_r0dG_YbPfaP9iqhnG3VtxZMDWkrYUMTpVfbi3YarzEDOReTFTg2lUDtCeJlCzeuPsJ8F_qs5bLy2hbIj5deIYM-J65nOxmPzk4_azsL_3t0pOluW6hDhKKjcTqaXaPYA',
  },
  {
    title: 'Iron Core',
    meta: 'Mecha • Sci-Fi',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHe5GO74vyV0ZQ9FodjHL5HlIyn6xWf1fmUJyx_u59akr7fvfgW7plJvU7SCXC6yQ2nWWj5RVD9yC0q9yZygDc4Upk7636EtK5uw3ULsF5JTFPy-leC88jDY799rBiwqKu-Mz6DYjNPexKXPuWhvfTxeIWLDMeT7j2FP4yDGubF2nUtnMu_RlaGhNkqRDneE7RmG6pjLV4QUVYeFnq9Mbv1pnP6Dy_CLnZuW15TNCyadiMcAZM0fczrg',
  },
]

const newFiction = [
  { title: 'The Quantum\nThief', meta: 'Novel • Sci-Fi' },
  { title: 'Echoes of\nAsh', meta: 'Novel • Mystery' },
]

export default function LibraryDiscoverPage() {
  return (
    <div className="overflow-hidden pb-[48px]">
      <p className="border-b border-white/10 bg-noir-surface-container-low px-[16px] py-2 text-center font-noir-mono text-[10px] uppercase tracking-wider text-noir-on-surface-variant">
        See also the original, unmerged{' '}
        <Link href="/library/discovery-feed" className="text-noir-secondary-fixed-dim underline">
          Discovery Feed
        </Link>{' '}
        layout
      </p>
      <div className="pt-[24px] md:pt-[32px]">
      {/* Hero */}
      <section className="mb-[48px] w-full">
        <div className="flex gap-4 overflow-x-auto px-[16px] pb-4 hide-scrollbar md:px-[32px]">
          <div className="group relative h-[480px] w-full shrink-0 overflow-hidden rounded-[0.75rem] border border-white/10 bg-noir-surface-container-low md:w-[85%] lg:w-[70%]">
            <img
              alt="Cyberfall Initiative cover art"
              className="absolute inset-0 h-full w-full object-cover opacity-70 mix-blend-lighten transition-transform duration-700 ease-out group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUpmRj9A_IfB6Tn2wWx_wfFILMBjVt8ZHEDx0FJhryP5qY0aui0n50qICOfXZrpA-7E3M4bxr7uTkiHbMUJKcmWW9xC2B8IuArHSyLTflKzQFEUjrcaNxLHy5zdIQdDnNE1ATERhkkUc_umQTptg5fDjz9xs4n0ZVmRuCH5aCSqOqB1cdY8wPKlOf2daxJRENgDVjCGpVdJWYeC5jjKBIO41noo-JLu2bKOXBXgcBrXzvDp0hmB2y45A"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 flex w-full flex-col justify-end p-[24px]">
              <div className="mb-3 flex gap-2">
                <span className="rounded-[0.25rem] bg-noir-primary-fixed px-2 py-1 font-noir-mono text-[12px] uppercase tracking-wider text-noir-on-primary-fixed">
                  Spotlight
                </span>
                <span className="rounded-[0.25rem] border border-white/10 bg-noir-surface-variant px-2 py-1 font-noir-mono text-[12px] text-noir-on-surface">
                  Sci-Fi
                </span>
              </div>
              <h2 className="mb-2 font-noir-display text-[28px] font-extrabold uppercase leading-none tracking-tight text-noir-on-surface md:text-[48px]">
                Cyberfall
                <br />
                Initiative
              </h2>
              <p className="mb-6 max-w-2xl font-noir-reading text-[16px] text-noir-on-surface-variant">
                In the neon-drenched ruins of Sector 4, a rogue operative discovers a rogue AI that
                could unravel reality itself. The chase begins now.
              </p>
              <div>
                <Link
                  href="/library/read"
                  className="inline-flex items-center gap-2 rounded-[0.5rem] bg-noir-primary-fixed px-6 py-3 font-noir-display text-[16px] font-extrabold text-noir-on-primary-fixed transition-colors hover:bg-noir-primary-fixed-dim active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                  Read Ch. 1
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="mb-[48px] pl-[16px] md:pl-[32px]">
        <div className="mb-[8px] flex items-center justify-between pr-[16px] md:pr-[32px]">
          <h3 className="flex items-center gap-2 font-noir-display text-[20px] font-bold uppercase text-noir-on-surface md:text-[32px]">
            <span className="material-symbols-outlined text-noir-primary-fixed">local_fire_department</span>
            Trending
          </h3>
          <Link href="/library/my-library" className="font-noir-mono text-[12px] text-noir-secondary-fixed-dim hover:text-noir-secondary-fixed">
            Explore All
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 pr-[16px] hide-scrollbar md:pr-[32px]">
          {trending.map((item) => (
            <Link
              href="/library/book"
              key={item.title}
              className="group flex w-40 shrink-0 flex-col gap-3 md:w-52"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[0.5rem] border border-white/10 bg-noir-surface-container shadow-lg shadow-black/50 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-noir-primary-fixed">
                <img alt={item.title} className="absolute inset-0 h-full w-full object-cover" src={item.img} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                {item.tag && (
                  <span className="absolute left-2 top-2 rounded-[0.25rem] border border-noir-tertiary-container/50 bg-noir-tertiary-container px-2 py-0.5 font-noir-mono text-[10px] font-bold uppercase text-noir-on-tertiary-container">
                    {item.tag}
                  </span>
                )}
              </div>
              <div>
                <h4 className="line-clamp-1 font-noir-display text-[16px] font-semibold text-noir-on-surface group-hover:text-noir-primary-fixed">
                  {item.title}
                </h4>
                <p className="mt-1 font-noir-mono text-[11px] text-noir-on-surface-variant">{item.meta}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Fiction */}
      <section className="mb-[48px] pl-[16px] md:pl-[32px]">
        <h3 className="mb-[8px] flex items-center gap-2 font-noir-display text-[20px] font-bold uppercase text-noir-on-surface md:text-[32px]">
          <span className="material-symbols-outlined text-noir-secondary-fixed-dim">menu_book</span>
          New Fiction
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 pr-[16px] hide-scrollbar md:pr-[32px]">
          {newFiction.map((item) => (
            <Link
              href="/library/book"
              key={item.title}
              className="group flex w-40 shrink-0 flex-col gap-3 md:w-52"
            >
              <div className="flex aspect-[2/3] w-full items-center justify-center overflow-hidden rounded-[0.5rem] border border-white/5 bg-noir-surface-container-low p-6 text-center transition-colors group-hover:border-noir-secondary-fixed-dim">
                <h4 className="whitespace-pre-line font-noir-reading text-[22px] font-medium leading-tight text-noir-on-surface group-hover:text-noir-secondary-fixed-dim">
                  {item.title}
                </h4>
              </div>
              <p className="px-1 font-noir-mono text-[11px] uppercase tracking-wider text-noir-on-surface-variant">
                {item.meta}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Daily Picks */}
      <section className="px-[16px] md:px-[32px]">
        <h3 className="mb-[24px] flex items-center gap-2 font-noir-display text-[20px] font-bold uppercase text-noir-on-surface md:text-[32px]">
          <span className="material-symbols-outlined text-noir-primary-fixed">star</span>
          Daily Picks
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link
            href="/library/book"
            className="group relative flex gap-4 overflow-hidden rounded-[0.75rem] border border-white/5 bg-noir-surface-container-low p-4 shadow-md shadow-black/20 transition-colors hover:border-noir-primary-fixed/40"
          >
            <div className="aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-[0.375rem] border border-white/10 md:w-24">
              <img
                alt="Blade & Blood"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQKRYBii5ulPeNmXMJPBrK_uM8xwOuzanbzlFcj8iOfzBZ6cCGQBguUCDkT1NBzxlq-L6gVkJ1wJEc-LpyG9rK7oi2NvnUTFA86hWdn9xPIxCpdxyiH405EKmuSpNVT3VL_Aj70YIeRfuHJ2M4xggmXr_ZdF3Dj84hdN4bfblrYIu20wfUOnY02vtotGadhUV7N2AwrOdJtpzjJJY1jGvSC1I01vYy0dh5rRxLWOOt6iVpmEsX6powzA"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center py-1">
              <h4 className="mb-1 font-noir-display text-[16px] font-semibold leading-tight text-noir-on-surface group-hover:text-noir-primary-fixed">
                Blade &amp; Blood
              </h4>
              <p className="mb-3 line-clamp-2 font-noir-reading text-[14px] leading-snug text-noir-on-surface-variant">
                The final chapter of the tournament arc is here. Who will survive the gauntlet?
              </p>
              <div className="mt-auto flex items-center gap-2">
                <span className="rounded-[0.25rem] border border-noir-outline-variant px-1.5 py-0.5 font-noir-mono text-[10px] text-noir-on-surface-variant">
                  Update: Ch 142
                </span>
                <div className="h-1 flex-grow overflow-hidden rounded-full bg-noir-surface-bright">
                  <div className="h-full w-[85%] bg-noir-secondary-fixed-dim" />
                </div>
              </div>
            </div>
          </Link>
          <Link
            href="/library/book"
            className="group relative flex gap-4 overflow-hidden rounded-[0.75rem] border border-white/5 bg-noir-surface-container-low p-4 shadow-md shadow-black/20 transition-colors hover:border-noir-primary-fixed/40"
          >
            <div className="flex aspect-[2/3] w-20 shrink-0 items-center justify-center overflow-hidden rounded-[0.375rem] border border-white/10 bg-noir-surface-container md:w-24">
              <span className="material-symbols-outlined text-4xl text-noir-on-surface-variant/50">auto_stories</span>
            </div>
            <div className="flex flex-1 flex-col justify-center py-1">
              <h4 className="mb-1 font-noir-display text-[16px] font-semibold leading-tight text-noir-on-surface group-hover:text-noir-secondary-fixed-dim">
                The Silent Archive
              </h4>
              <p className="mb-3 line-clamp-2 font-noir-reading text-[14px] leading-snug text-noir-on-surface-variant">
                Deep within the vaults, a forbidden text has been opened. The consequences begin to
                ripple.
              </p>
              <span className="w-fit rounded-[0.25rem] border border-noir-outline-variant px-1.5 py-0.5 font-noir-mono text-[10px] text-noir-on-surface-variant">
                Fiction • Read
              </span>
            </div>
          </Link>
        </div>
      </section>
      </div>
    </div>
  )
}
