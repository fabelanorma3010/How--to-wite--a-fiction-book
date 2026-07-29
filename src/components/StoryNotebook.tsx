import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'storyburst-notebook'

export default function StoryNotebook() {
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(true)
  const saveTimeout = useRef<number | undefined>(undefined)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) setText(stored)
  }, [])

  function handleChange(value: string) {
    setText(value)
    setSaved(false)
    window.clearTimeout(saveTimeout.current)
    saveTimeout.current = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, value)
      setSaved(true)
    }, 400)
  }

  function handleClear() {
    if (text.trim() && !window.confirm('Clear everything in your notebook? This can\'t be undone.')) {
      return
    }
    setText('')
    window.localStorage.removeItem(STORAGE_KEY)
    setSaved(true)
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <section id="notebook" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
            Your Story Notebook 📓
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink/70">
            Jot down character notes, plot twists, or a line of dialogue before it slips away.
            It's saved right in this browser, so it'll be here next time you visit.
          </p>
        </div>

        <div className="animate-pop-in rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8">
          <label htmlFor="notebook-textarea" className="sr-only">
            Story notebook
          </label>
          <textarea
            id="notebook-textarea"
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Once upon a time... (your hero's secret weakness, a killer plot twist, that perfect line of dialogue — write it here before you forget!)"
            rows={10}
            className="w-full resize-y rounded-2xl border-2 border-ink/15 bg-base/80 p-4 text-ink placeholder:text-ink/40 focus:border-primary/50"
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-ink/60">
              {wordCount} {wordCount === 1 ? 'word' : 'words'} · {saved ? 'Saved ✓' : 'Saving…'}
            </span>
            <button
              type="button"
              onClick={handleClear}
              disabled={!text}
              className="rounded-full border-2 border-ink/15 bg-white/70 px-4 py-2 font-bold text-ink transition-colors hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear Notebook 🗑️
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
