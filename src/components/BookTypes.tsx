import { bookTypes, type BookTypeId } from '../data/bookTypes'

interface BookTypesProps {
  selected: BookTypeId
  onSelect: (id: BookTypeId) => void
}

export default function BookTypes({ selected, onSelect }: BookTypesProps) {
  const active = bookTypes.find((b) => b.id === selected) ?? bookTypes[0]

  return (
    <section id="book-types" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
            Pick Your Book Type
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink/70">
            Every format has its own storytelling rules. Choose one to see tailored tips
            — your pick also powers the generators below.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Book types"
          className="mb-6 flex flex-wrap justify-center gap-2 sm:gap-3"
        >
          {bookTypes.map((type) => {
            const isActive = type.id === selected
            return (
              <button
                key={type.id}
                role="tab"
                id={`tab-${type.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${type.id}`}
                onClick={() => onSelect(type.id)}
                className={`flex items-center gap-2 rounded-full border-2 px-4 py-2.5 font-bold transition-all sm:px-5 sm:py-3 ${
                  isActive
                    ? 'border-primary bg-primary text-primary-content shadow-md scale-105'
                    : 'border-ink/15 bg-white/70 text-ink/70 hover:border-primary/50 hover:text-ink'
                }`}
              >
                <span aria-hidden="true" className="text-lg sm:text-xl">
                  {type.emoji}
                </span>
                {type.name}
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={`panel-${active.id}`}
          aria-labelledby={`tab-${active.id}`}
          key={active.id}
          className="animate-pop-in rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
            <h3 className="text-2xl font-extrabold text-ink">
              <span aria-hidden="true">{active.emoji}</span> {active.name}
            </h3>
            <p className="font-semibold text-secondary-content/80">{active.tagline}</p>
          </div>

          <p className="mt-4 text-ink/80">{active.blurb}</p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {active.tips.map((tip, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-2xl bg-base/80 p-4 text-sm text-ink/80 sm:text-base"
              >
                <span aria-hidden="true" className="font-extrabold text-accent-content/70">
                  {i + 1}.
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
