import { bookTypes, type BookTypeId } from '../data/bookTypes'

interface GenreSwitcherProps {
  selected: BookTypeId
  onSelect: (id: BookTypeId) => void
  label: string
}

export default function GenreSwitcher({ selected, onSelect, label }: GenreSwitcherProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label={label}>
      {bookTypes.map((type) => {
        const isActive = type.id === selected
        return (
          <button
            key={type.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(type.id)}
            className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-bold transition-all ${
              isActive
                ? 'border-secondary bg-secondary text-secondary-content'
                : 'border-ink/15 bg-white/70 text-ink/60 hover:border-secondary/50 hover:text-ink'
            }`}
          >
            <span aria-hidden="true">{type.emoji}</span>
            {type.name}
          </button>
        )
      })}
    </div>
  )
}
