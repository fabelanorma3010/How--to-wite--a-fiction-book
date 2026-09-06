import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { LAUNCH_PHASE_EMOJIS, type LaunchPhaseCopy } from '../data/launchChecklist'
import Sticker from './Sticker'

const STORAGE_KEY = 'storyburst-launch-checklist'

// Stable key per item so checked state survives copy edits to the item text.
function itemKey(phaseIndex: number, itemIndex: number) {
  return `${phaseIndex}-${itemIndex}`
}

export default function LaunchChecklist() {
  const t = useTranslations('LaunchChecklist')
  const phases = t.raw('phases') as LaunchPhaseCopy[]
  const totalItems = phases.reduce((sum, phase) => sum + phase.items.length, 0)
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed === 'object') setChecked(parsed)
    } catch {
      // ignore malformed storage
    }
  }, [])

  function toggle(key: string) {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const doneCount = Object.values(checked).filter(Boolean).length

  return (
    <section id="launch-checklist" className="px-4 pb-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">{t('title')} ✅</h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink/70">{t('intro')}</p>
          <p className="mt-4 text-sm font-bold text-ink/50">
            {doneCount === totalItems && totalItems > 0
              ? t('allDone')
              : t('progress', { done: doneCount, total: totalItems })}
          </p>
        </div>

        <div className="relative space-y-6">
          <Sticker emoji="✅" className="-top-2 -right-2 rotate-12 sm:-top-4 sm:-right-4" />
          {phases.map((phase, phaseIndex) => (
            <div
              key={phaseIndex}
              className="rounded-3xl border-2 border-ink/10 bg-white/70 p-5 shadow-sm sm:p-6"
            >
              <div className="mb-4 flex items-baseline gap-2">
                <span aria-hidden="true" className="text-xl">
                  {LAUNCH_PHASE_EMOJIS[phaseIndex]}
                </span>
                <h3 className="text-lg font-extrabold text-ink sm:text-xl">{phase.phase}</h3>
                <span className="text-xs font-bold uppercase tracking-wide text-ink/40">
                  {phase.when}
                </span>
              </div>
              <ul className="space-y-2.5">
                {phase.items.map((item, itemIndex) => {
                  const key = itemKey(phaseIndex, itemIndex)
                  const isDone = Boolean(checked[key])
                  const id = `launch-${key}`
                  return (
                    <li key={itemIndex}>
                      <label
                        htmlFor={id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-colors ${
                          isDone
                            ? 'border-ink/5 bg-white/40'
                            : 'border-ink/10 bg-white/60 hover:border-primary/30'
                        }`}
                      >
                        <input
                          id={id}
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggle(key)}
                          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-primary"
                        />
                        <span
                          className={`text-sm sm:text-base ${
                            isDone ? 'text-ink/40 line-through' : 'text-ink/80'
                          }`}
                        >
                          {item}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
