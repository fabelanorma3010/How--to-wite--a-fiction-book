'use client'

import { useRef, useState } from 'react'
import CopyButton from './CopyButton'

const TOOLS = [
  {
    id: 'summarize',
    label: 'Summarize',
    blurb: 'Long article, meeting notes, or a document → a one-line overview plus the key points.',
  },
  {
    id: 'critique',
    label: 'Critique',
    blurb: 'A draft, essay, chapter, or paper → constructive feedback on what works and what to fix.',
  },
  {
    id: 'structure',
    label: 'Structure notes',
    blurb: 'Messy notes → clean headings, grouped bullets, and a separate action-items list.',
  },
] as const

type ToolId = (typeof TOOLS)[number]['id']
type Status = 'idle' | 'loading' | 'error' | 'done'

const MAX_CHARS = 50_000
const MAX_FILE_BYTES = 2 * 1024 * 1024

export default function WritingTools() {
  const [tool, setTool] = useState<ToolId>('summarize')
  const [text, setText] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const active = TOOLS.find((t) => t.id === tool) ?? TOOLS[0]

  function reset() {
    setStatus('idle')
    setResult('')
    setError('')
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_FILE_BYTES) {
      setError('That file is over 2 MB — paste the text instead, or trim it down.')
      setStatus('error')
      return
    }
    try {
      const content = await file.text()
      setText(content.slice(0, MAX_CHARS))
      reset()
    } catch {
      setError('Could not read that file. Use a plain .txt or .md file, or paste the text.')
      setStatus('error')
    }
  }

  async function handleRun() {
    if (!text.trim() || status === 'loading') return
    setStatus('loading')
    setError('')
    setResult('')
    try {
      const res = await fetch('/api/writing-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode: tool }),
      })
      const data = await res.json()
      if (!res.ok || typeof data?.result !== 'string') {
        throw new Error(data?.error || 'Something went wrong.')
      }
      setResult(data.result)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('error')
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Writing tools">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tool === t.id}
            onClick={() => {
              setTool(t.id)
              setText('')
              reset()
            }}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tool === t.id
                ? 'bg-primary text-primary-content shadow-sm'
                : 'border-2 border-ink/15 bg-white/70 text-ink/70 hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-ink/60">{active.blurb}</p>

      <div className="mt-4 rounded-3xl border-2 border-ink/10 bg-white/60 p-5 shadow-sm sm:p-6">
        <label htmlFor="wt-input" className="text-sm font-bold text-ink">
          Your text
        </label>
        <textarea
          id="wt-input"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          rows={10}
          placeholder="Paste it here…"
          className="mt-2 w-full rounded-2xl border-2 border-ink/15 bg-white/80 px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink/40 focus:border-primary/50 focus:outline-none"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-ink/50">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-full border-2 border-ink/15 bg-white px-3 py-1.5 font-bold text-ink/70 transition-colors hover:text-ink"
            >
              📄 Upload .txt / .md
            </button>
            <span>
              {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.markdown,text/plain,text/markdown"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleRun}
            disabled={!text.trim() || status === 'loading'}
            className="rounded-full bg-accent px-6 py-2.5 font-extrabold text-accent-content shadow-md transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'loading' ? 'Working…' : `Run ${active.label}`}
          </button>
        </div>

        {status === 'error' && (
          <p role="alert" className="mt-4 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        {status === 'done' && result && (
          <div className="animate-pop-in mt-5 rounded-2xl border-2 border-accent/40 bg-accent/10 p-4 sm:p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">Result</h3>
              <CopyButton text={result} />
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/90">{result}</p>
          </div>
        )}
      </div>
    </div>
  )
}
