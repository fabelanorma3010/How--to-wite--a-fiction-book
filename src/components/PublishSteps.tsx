import { useEffect, useState } from 'react'
import { publishSteps } from '../data/publishSteps'
import Sticker from './Sticker'

const STORAGE_KEY = 'storyburst-publish-progress'

const badgeColors = ['bg-primary text-primary-content', 'bg-secondary text-secondary-content', 'bg-accent text-accent-content']

export default function PublishSteps() {
  const [completed, setCompleted] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed === 'object') setCompleted(parsed)
    } catch {
      // ignore malformed storage
    }
  }, [])

  function toggleStep(index: number) {
    setCompleted((prev) => {
      const next = { ...prev, [index]: !prev[index] }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const doneCount = publishSteps.reduce((total, _, i) => total + (completed[i] ? 1 : 0), 0)

  return (
    <section id="publish" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
            Your Path to Publishing 🚀
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink/70">
            From final draft to finished book on shelves (real or digital) — here's the
            step-by-step process most illustrated books follow. Check off each step as you
            complete it.
          </p>
          <p className="mt-4 text-sm font-bold text-ink/50">
            {doneCount === publishSteps.length
              ? "All steps checked off — congrats, you're published! 🎉"
              : `${doneCount} of ${publishSteps.length} steps checked off`}
          </p>
        </div>

        <ol className="relative">
          <Sticker emoji="🚀" className="-top-2 -right-2 rotate-12 sm:-top-4 sm:-right-4" />
          <div
            aria-hidden="true"
            className="absolute left-[27px] top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-primary via-secondary to-accent sm:left-[31px]"
          />

          {publishSteps.map((step, i) => {
            const isDone = Boolean(completed[i])
            return (
              <li key={step.title} className="relative mb-8 flex gap-4 sm:gap-6 last:mb-0">
                <span
                  aria-hidden="true"
                  className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-extrabold shadow-md transition-colors sm:h-16 sm:w-16 sm:text-2xl ${
                    isDone ? 'bg-ink text-base' : badgeColors[i % badgeColors.length]
                  }`}
                >
                  {isDone ? '✓' : step.emoji}
                </span>
                <label
                  htmlFor={`publish-step-${i}`}
                  className={`flex-1 cursor-pointer rounded-2xl border-2 p-4 pt-3 transition-colors sm:p-5 ${
                    isDone
                      ? 'border-ink/5 bg-white/40'
                      : 'border-ink/10 bg-white/70 hover:border-primary/30'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-ink/40">
                      Step {i + 1}
                    </span>
                    <input
                      id={`publish-step-${i}`}
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleStep(i)}
                      aria-label={`Mark "${step.title}" as ${isDone ? 'not done' : 'done'}`}
                      className="h-5 w-5 shrink-0 cursor-pointer accent-primary"
                    />
                  </span>
                  <h3
                    className={`mt-0.5 text-lg font-extrabold sm:text-xl ${
                      isDone ? 'text-ink/40 line-through' : 'text-ink'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className={`mt-1.5 text-sm sm:text-base ${isDone ? 'text-ink/40' : 'text-ink/70'}`}>
                    {step.description}
                  </p>
                </label>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
