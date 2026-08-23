import Link from 'next/link'

const newReleases = [
  {
    title: "Winter's End",
    meta: 'Fantasy • Ch. 12',
    rating: '4.8',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3tAGiqWl0bJA4HLsw1yKAuxx-XcoFWkRzYiUua8hLG8KW94cbiWIESjRGbe1N6pHNh6H_pfp7pyljK60pDwr0273JDqGKiaLpbvEf0f6T_9-GXLSnnL2LPdp5r0JFZUF0VXDe6eXHCOQs0lmspyqK7Iugq5wg3IFboigtUd_-JD9JR8ppTjxyHdGxku6AkrTph_sv9VTRTU_940Xuf6OguaX_5rhCzT9DQK4DR53ds5S4-unnkFnh6g',
  },
  {
    title: 'Apex Court',
    meta: 'Sports • Ch. 45',
    rating: '4.9',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAe-6syG5OWcjqFlwiv2DdEWWHxWKjRUBC7wlufoJPLwBieJx537sjvwgA9tacg5Bwnne917c6bpXFMczHlgYrfy53kICJF0m2myBHKC2DCn4AmpqcpK3aRwLjTR3l-qrYfTRa5x0PrmlZ1wMDInQsiZ8fZDsUiBLQzXVNX1r6LUjuIj2U4CWecGWYWp4Zy3FIv-6MRP_rFPBEXhagoldxMUvkpC2a_58W4H4FKIyeRIVQCiwEoy5QjVw',
  },
  {
    title: 'The Spiral City',
    meta: 'Horror • Ch. 8',
    rating: '4.6',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQmXqlP0znNFMimZrA1KPzSvMneAQyWOanir9z_8xIZ9LuXLp1fgyEI6ntBl-153sk2f8RHRYDpK6Lq05_rpi7-ejCnMLs7tzuBOJIXyc93gWKakC8LIAv_jKfw-Nn8g7eMQ-yhMA-uWs-xSDwfQoHW_EifhHQCIzw2IZwoBNQlH3n1ap-WVYDHH8H9NjR4_8kCb_sx7JD2cu31dY6Mhwn221-O28TuIqquNrHwcleVa8keHv-BCctLA',
  },
  {
    title: 'Ghost in the Shell',
    meta: 'Sci-Fi • Ch. 22',
    rating: '4.7',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsXUwh0L9VIE-_MpGjtwFk5Am3o9umBCInfRfR2mrNQtf02ZO6WuQxGgF8-kzQ-bvD7vJapw3udar9EeKZP1a6Q2zb2bJswrj9hxKiji5rVe3wsZz4eHA7qjXLlcbxvhJZmnhrEybxlQVjcd9YjUSZSTErROZsg2HwI2ziCqLb02jbUaQaSXnouBAobJTguUdslaOPoVbx-IUTmwRP299cMvYBlzFsJVTtIiavoueDG5FfNBxh93WFBA',
  },
]

export default function DiscoveryFeedOriginalPage() {
  return (
    <div>
      <p className="border-b border-white/10 bg-noir-surface-container-low px-[16px] py-2 text-center font-noir-mono text-[10px] uppercase tracking-wider text-noir-on-surface-variant">
        Original Stitch layout — &quot;Discovery Feed&quot; · see also{' '}
        <Link href="/library" className="text-noir-secondary-fixed-dim underline">
          the merged Discover page
        </Link>
      </p>

      <section className="relative mb-[48px] h-[420px] w-full sm:h-[530px]">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-noir-background via-noir-background/40 to-transparent" />
        <img
          alt="Trending manga cover"
          className="absolute inset-0 h-full w-full object-cover object-top"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9OGy7eJ22WUzQdWHHxCoVBY8DRphZfiwCB-P58hbmOQo4knwoilx9eRDOdSxAbH1geTBJO3XdlIWVVI3_kualoyUJ8RQ-awgiz2_F6e7AdMIjzKCrwyeGAE853q6I33nuHg49PEm7FrLDhIiuP_vJZAZge9IWYhtSvLSpsX4AdbPWGfGgXQAZ1RLSMuBy_h4yo-c_zMJLY01KV3H99ImNDc6FZTVfk5Klmh0Id4LNNuE4n2k3mC4yBQ"
        />
        <div className="absolute bottom-0 left-0 z-20 flex w-full flex-col items-start gap-[8px] p-[16px] sm:p-[32px]">
          <span className="rounded-[0.125rem] border border-noir-tertiary-container/30 bg-noir-tertiary-container/20 px-2 py-1 font-noir-mono text-[12px] text-noir-tertiary-container backdrop-blur-md">
            TRENDING TODAY
          </span>
          <h1 className="max-w-2xl font-noir-display text-[28px] font-extrabold text-noir-primary drop-shadow-lg sm:text-[48px]">
            Neon Katana: Cyber Samurai
          </h1>
          <p className="max-w-xl font-noir-display text-[16px] text-noir-on-surface-variant">
            In the sprawling neon labyrinth of Neo-Edo, a disgraced samurai must navigate a
            treacherous underworld of corporate syndicates and rogue AI to reclaim his stolen
            honor. A masterpiece of cyberpunk action.
          </p>
          <div className="mt-4 flex gap-4">
            <Link
              href="/library/manga-reader"
              className="flex items-center gap-2 rounded-[0.125rem] bg-noir-primary-container px-6 py-3 font-noir-display text-[16px] text-noir-on-primary-container transition-colors hover:bg-noir-primary-fixed"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_arrow
              </span>
              Read Now
            </Link>
            <button
              type="button"
              className="flex items-center gap-2 rounded-[0.125rem] border border-noir-secondary px-6 py-3 font-noir-display text-[16px] text-noir-secondary transition-colors hover:bg-noir-secondary/10"
            >
              <span className="material-symbols-outlined">bookmark_add</span>
              Save
            </button>
          </div>
        </div>
      </section>

      <section className="pl-[16px] sm:pl-[32px]">
        <div className="mb-4 flex items-end justify-between pr-[16px] sm:pr-[32px]">
          <h2 className="font-noir-display text-[20px] font-semibold text-noir-primary">New Releases</h2>
          <Link href="/library" className="flex items-center font-noir-mono text-[12px] text-noir-secondary transition-colors hover:text-noir-secondary-fixed">
            VIEW ALL <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        <div className="flex snap-x snap-mandatory gap-[12px] overflow-x-auto pb-4 pr-[16px] hide-scrollbar sm:pr-[32px]">
          {newReleases.map((item) => (
            <div key={item.title} className="group w-36 shrink-0 cursor-pointer snap-start sm:w-48">
              <Link href="/library/book" className="relative block aspect-[2/3] w-full overflow-hidden rounded-[0.5rem] border border-white/10 transition-colors group-hover:border-noir-primary-container">
                <img alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" src={item.img} />
                <div className="absolute left-2 top-2 flex items-center gap-1 rounded-[0.125rem] border border-white/10 bg-black/60 px-1.5 py-0.5 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[10px] text-noir-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  <span className="font-noir-mono text-[10px] text-white">{item.rating}</span>
                </div>
              </Link>
              <div className="mt-2 flex flex-col">
                <h3 className="truncate font-noir-display text-[16px] text-noir-on-surface transition-colors group-hover:text-noir-primary">
                  {item.title}
                </h3>
                <span className="truncate font-noir-mono text-[12px] text-noir-on-surface-variant">{item.meta}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
