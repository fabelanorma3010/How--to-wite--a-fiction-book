import Link from 'next/link'

const genres = [
  { name: 'Action', icon: 'bolt' },
  { name: 'Fantasy', icon: 'auto_awesome' },
  { name: 'Sci-Fi', icon: 'rocket_launch' },
  { name: 'Horror', icon: 'nightlight' },
  { name: 'Mystery', icon: 'search' },
  { name: 'Sports', icon: 'sports_basketball' },
  { name: 'Mecha', icon: 'precision_manufacturing' },
  { name: 'Romance', icon: 'favorite' },
  { name: 'Slice of Life', icon: 'local_cafe' },
  { name: 'Seinen', icon: 'menu_book' },
]

export default function GenresPage() {
  return (
    <div className="mx-auto max-w-7xl px-[16px] py-[24px] md:px-[32px] md:py-[48px]">
      <h1 className="mb-[24px] font-noir-display text-[28px] font-bold text-noir-on-surface md:text-[48px]">
        Genres
      </h1>
      <div className="grid grid-cols-2 gap-[16px] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {genres.map((genre) => (
          <Link
            href="/library"
            key={genre.name}
            className="group flex flex-col items-center justify-center gap-3 rounded-[0.75rem] border border-white/10 bg-noir-surface-container-low p-6 text-center transition-colors hover:border-noir-primary-container hover:bg-noir-surface-container"
          >
            <span className="material-symbols-outlined text-[32px] text-noir-primary-container transition-transform group-hover:scale-110">
              {genre.icon}
            </span>
            <span className="font-noir-display text-[15px] font-semibold text-noir-on-surface">{genre.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
