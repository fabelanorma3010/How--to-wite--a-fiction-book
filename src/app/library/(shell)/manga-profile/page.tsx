import Link from 'next/link'
import ShimmerImage from '../../../../components/library/ShimmerImage'

const chapters = [
  {
    num: 'CH. 42',
    title: 'The Fractured Reflection',
    date: 'Oct 12, 2023 • 24 Pages',
    isNew: true,
    read: false,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKSB8tP5aZnx5NlX6wTLl17a9ApmzVSRiTRK3Tlm65LM8wP9oeP5NUQiW6iKgUTI_lW9NcV97l7L124HjyVFiOrvOWqWqsPjgIOd9WIq5rTK2LKqQf6NMrYOqUV_FgMNgYhhWsx8_JV2ARu_wqb42Xif9Na9wOuMINwZwG8gLqcR6wKqq_FdxCut8ngoy3geg-2dDblG7k-VM_1ZEaknuKa1jvvc82jbxf2q04fS3jla8v25zbvFNhuQ',
  },
  {
    num: 'CH. 41',
    title: 'Echoes in the Rain',
    date: 'Oct 05, 2023 • 22 Pages',
    isNew: false,
    read: true,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB6u4Di4Bgpp96J5LXDJjozrkGV2lBQpprdIShKbNbsmbSgy49KWEt5ofC-E9pgE8LsQ0pHd04KNYJBt9_Pfw5b-6qAqaR6uNB0QxV045-okrhIZYBF-7Crsw5PyU1SpPPME8iVzT4qGF_DF59B7SLQbDmutSkwP7DqhC6SF6I5b_bA9IX_UVHjXlfxLOouUtjtQW-2X1sDcp1xF_GfUbAOS4jYUpUbf4v69MA5Wi4y-Vb3ac3NDlVYA',
  },
]

export default function MangaProfileOriginalPage() {
  return (
    <div>
      <p className="border-b border-white/10 bg-noir-surface-container-low px-[16px] py-2 text-center font-noir-mono text-[10px] uppercase tracking-wider text-noir-on-surface-variant">
        Original Stitch layout — &quot;Manga Profile&quot; · see also{' '}
        <Link href="/library/book" className="text-noir-secondary-fixed-dim underline">
          the Book Details page
        </Link>
      </p>

      <div className="relative h-[420px] w-full sm:h-[530px]">
        <div
          className="absolute inset-0 h-full w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDKac9F4ZIuGM-Y7D8-4cUY4m92kgH2yM7p09qz7N1PmXMTTizXpYfVdc4l50-CHyQUBtv5wFhBTQ_0BInmxH4XvJyXIJfAm1Qt2cREGb17-Y6zdRFyZvTHkr7ech3oP77p7IZgbAd8gN6ciktpYxb7McY4wsSnjktQujzKMovQn-pllK0LhaIcCMFuQpM-FKzn2ZR49hDBh-Wau5ztZlcS8o4fhkaZ7WgU_KE7f9V9kVc1_B94i97mKA')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noir-surface via-noir-surface/80 to-transparent" />
        <div className="absolute bottom-0 left-0 mx-auto flex w-full max-w-7xl flex-col gap-6 px-[16px] pb-[24px] sm:flex-row sm:items-end sm:px-[32px]">
          <div className="hidden aspect-[2/3] w-48 shrink-0 overflow-hidden rounded-[0.5rem] border border-white/10 shadow-2xl sm:block">
            <ShimmerImage
              alt="Neon Abyss: The Silent Echo cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAMMtApm-dqfSSIFnmL9XpYGbJXkuEuDICJxTGFR_vBF2Lf24zDcvMZfKdtFDE52r7BusMKdaB-v7Rgk-A_PgEZfWjiIKzT6S52HJubLjNxBumHv7nGEzJ4Aqakv-rDDBFoiIQtdf9Qjr3CLQlAHykn2gIXVvNewYMJeG5ADr9uyu8y9kR-3eJ9Kix3BzgtbPqkznxdQsV2m3Fvql0SJ12TzxYAIZCedaGdmzkztu0578FvvQc_Yp3ig"
            />
          </div>
          <div className="flex-1 space-y-4">
            <div className="mb-2 flex flex-wrap gap-2">
              <span className="rounded-[0.125rem] border border-white/10 bg-noir-surface-container-high px-2 py-1 font-noir-mono text-[12px] text-noir-on-surface">ACTION</span>
              <span className="rounded-[0.125rem] border border-white/10 bg-noir-surface-container-high px-2 py-1 font-noir-mono text-[12px] text-noir-on-surface">MYSTERY</span>
              <span className="rounded-[0.125rem] border border-white/10 bg-noir-surface-container-high px-2 py-1 font-noir-mono text-[12px] text-noir-on-surface">SEINEN</span>
              <span className="rounded-[0.125rem] border border-noir-primary-container bg-noir-surface-container-high px-2 py-1 font-noir-mono text-[12px] text-noir-primary-container">ONGOING</span>
            </div>
            <h1 className="max-w-3xl font-noir-display text-[28px] font-extrabold leading-tight text-noir-on-surface sm:text-[48px] lg:text-[56px]">
              NEON ABYSS: THE SILENT ECHO
            </h1>
            <p className="max-w-2xl font-noir-display text-[16px] text-noir-on-surface-variant">
              In the sprawling mega-city of Neo-Kowloon, a rogue detective uncovers a conspiracy
              that spans from the darkest underbelly to the highest corporate spires. As the lines
              between human and synthetic blur, he must navigate a web of deceit where truth is the
              most expensive commodity.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <Link
                href="/library/manga-reader"
                className="flex items-center gap-2 rounded-[0.25rem] bg-noir-primary-container px-8 py-3 font-noir-display text-[16px] text-noir-on-primary-container transition-colors hover:bg-noir-primary-fixed"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
                READ NOW
              </Link>
              <button
                type="button"
                className="flex items-center gap-2 rounded-[0.25rem] border border-noir-secondary px-4 py-3 text-noir-secondary transition-colors hover:bg-noir-secondary/10"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bookmark_add
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-[16px] py-[48px] sm:px-[32px]">
        <div className="mb-[24px] flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="font-noir-display text-[28px] font-bold text-noir-on-surface">Chapters</h2>
          <button type="button" className="flex items-center gap-1 font-noir-mono text-[12px] text-noir-on-surface-variant transition-colors hover:text-noir-primary">
            <span className="material-symbols-outlined text-sm">sort</span>
            Latest First
          </button>
        </div>
        <div className="space-y-2">
          {chapters.map((ch) => (
            <div
              key={ch.num}
              className={`group relative flex items-center justify-between overflow-hidden rounded-[0.5rem] border border-transparent p-4 transition-colors hover:border-white/10 ${
                ch.read ? 'bg-noir-surface opacity-70 hover:opacity-100' : 'bg-noir-surface-container-low hover:bg-noir-surface-container'
              }`}
            >
              <div className="z-10 flex items-center gap-4">
                <div className="hidden h-16 w-12 shrink-0 overflow-hidden rounded sm:block">
                  <ShimmerImage
                    alt=""
                    imgClassName={`h-full w-full object-cover ${ch.read ? 'grayscale' : ''}`}
                    src={ch.img}
                  />
                </div>
                <div>
                  <span className={`mb-1 block font-noir-mono text-[12px] ${ch.isNew ? 'text-noir-primary-container' : 'text-noir-on-surface-variant'}`}>
                    {ch.num}
                  </span>
                  <h3 className="font-noir-display text-[16px] text-noir-on-surface transition-colors group-hover:text-noir-primary">
                    {ch.title}
                  </h3>
                  <span className="font-noir-mono text-[12px] text-noir-on-surface-variant">{ch.date}</span>
                </div>
              </div>
              <div className="z-10 flex items-center gap-4">
                {ch.isNew && (
                  <span className="hidden rounded-[0.125rem] bg-noir-secondary/20 px-2 py-1 font-noir-mono text-[10px] uppercase tracking-wider text-noir-secondary sm:block">
                    New
                  </span>
                )}
                <span className="material-symbols-outlined text-noir-on-surface-variant transition-colors group-hover:text-noir-primary">
                  {ch.read ? 'check_circle' : 'download'}
                </span>
              </div>
              <div className={`absolute bottom-0 left-0 h-[2px] bg-noir-secondary transition-all duration-500 ease-out ${ch.read ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
