import { useEffect, useState } from 'react'
import { bookTypes, type BookTypeId } from '../data/bookTypes'
import { generateIllustrationIdea } from '../data/generators'
import GenreSwitcher from './GenreSwitcher'
import CopyButton from './CopyButton'

interface IllustrationGeneratorProps {
  selected: BookTypeId
  onSelect: (id: BookTypeId) => void
}

export default function IllustrationGenerator({ selected, onSelect }: IllustrationGeneratorProps) {
  const [idea, setIdea] = useState<string>('')
  const activeType = bookTypes.find((b) => b.id === selected) ?? bookTypes[0]

  // Generated client-side only, after mount — Math.random() output would
  // otherwise differ between the server-rendered and hydrated client markup.
  useEffect(() => {
    setIdea((prev) => prev || generateIllustrationIdea(selected))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenerate = () => {
    setIdea(generateIllustrationIdea(selected))
  }

  return (
    <section id="illustration-generator" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-3xl border-2 border-ink/10 bg-white/60 p-6 shadow-sm sm:p-10">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
            Creative Illustration Idea Generator 🎨
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/70">
            Need a spark for your next panel or page? Generate a full illustration
            prompt — subject, action, setting, detail, and color palette — for your
            artist (or yourself).
          </p>
        </div>

        <div className="mt-6">
          <GenreSwitcher selected={selected} onSelect={onSelect} label="Choose genre for illustration idea" />
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-full bg-accent px-8 py-3.5 text-lg font-extrabold text-accent-content shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            Generate {activeType.emoji} Illustration Idea
          </button>
        </div>

        <div
          key={idea}
          className="animate-pop-in mt-8 rounded-2xl border-2 border-accent/40 bg-accent/10 p-5 sm:p-6"
        >
          <p className="text-lg leading-relaxed font-semibold text-ink">{idea}</p>
          <div className="mt-4 flex justify-end">
            <CopyButton text={idea} />
          </div>
        </div>
      </div>
    </section>
  )
}
