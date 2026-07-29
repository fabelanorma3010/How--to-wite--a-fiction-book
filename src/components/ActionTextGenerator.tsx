import { useEffect, useState } from 'react'
import { bookTypes, type BookTypeId } from '../data/bookTypes'
import { generateActionText } from '../data/generators'
import GenreSwitcher from './GenreSwitcher'
import CopyButton from './CopyButton'

interface ActionTextGeneratorProps {
  selected: BookTypeId
  onSelect: (id: BookTypeId) => void
}

export default function ActionTextGenerator({ selected, onSelect }: ActionTextGeneratorProps) {
  const [lines, setLines] = useState<string[]>([])
  const activeType = bookTypes.find((b) => b.id === selected) ?? bookTypes[0]

  // Generated client-side only, after mount — Math.random() output would
  // otherwise differ between the server-rendered and hydrated client markup.
  useEffect(() => {
    setLines((prev) => (prev.length === 0 ? [generateActionText(selected)] : prev))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenerate = () => {
    setLines((prev) => [generateActionText(selected), ...prev].slice(0, 5))
  }

  return (
    <section id="action-generator" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-3xl border-2 border-ink/10 bg-white/60 p-6 shadow-sm sm:p-10">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
            Fun Action Text Generator ⚡
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/70">
            Stuck on a script beat? Generate a punchy line of action text — sound effect
            included — tuned to your book's genre.
          </p>
        </div>

        <div className="mt-6">
          <GenreSwitcher selected={selected} onSelect={onSelect} label="Choose genre for action text" />
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-full bg-secondary px-8 py-3.5 text-lg font-extrabold text-secondary-content shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            Generate {activeType.emoji} Action Line
          </button>
        </div>

        <div className="mt-8 space-y-3">
          {lines.map((line, i) => (
            <div
              key={`${line}-${i}`}
              className={`animate-pop-in flex flex-col gap-3 rounded-2xl border-2 p-4 sm:flex-row sm:items-center sm:justify-between ${
                i === 0
                  ? 'border-secondary/40 bg-secondary/10'
                  : 'border-ink/10 bg-base/70'
              }`}
            >
              <p className={`text-lg font-bold text-ink ${i === 0 ? '' : 'opacity-70'}`}>
                {line}
              </p>
              {i === 0 && <CopyButton text={line} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
