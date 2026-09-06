'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { TOOL_IDS } from '../data/writingTools'
import CopyButton from './CopyButton'

type ToolId = (typeof TOOL_IDS)[number]
type Status = 'idle' | 'loading' | 'error' | 'done'

const MAX_CHARS = 50_000
const MAX_FILE_BYTES = 2 * 1024 * 1024

export default function WritingTools() {
  const t = useTranslations('WritingTools')
  const [tool, setTool] = useState<ToolId>('summarize')
  const [text, setText] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

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
      setError(t('fileTooBig'))
      setStatus('error')
      return
    }
    try {
      const content = await file.text()
      setText(content.slice(0, MAX_CHARS))
      reset()
    } catch {
      setError(t('fileReadError'))
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
        throw new Error(data?.error || t('genericError'))
      }
      setResult(data.result)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'))
      setStatus('error')
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('tablistLabel')}>
        {TOOL_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tool === id}
            onClick={() => {
              setTool(id)
              setText('')
              reset()
            }}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tool === id
                ? 'bg-primary text-primary-content shadow-sm'
                : 'border-2 border-ink/15 bg-white/70 text-ink/70 hover:text-ink'
            }`}
          >
            {t(`tools.${id}.label`)}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-ink/60">{t(`tools.${tool}.blurb`)}</p>

      <div className="mt-4 rounded-3xl border-2 border-ink/10 bg-white/60 p-5 shadow-sm sm:p-6">
        <label htmlFor="wt-input" className="text-sm font-bold text-ink">
          {t('yourText')}
        </label>
        <textarea
          id="wt-input"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          rows={10}
          placeholder={t('pasteHere')}
          className="mt-2 w-full rounded-2xl border-2 border-ink/15 bg-white/80 px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink/40 focus:border-primary/50 focus:outline-none"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-ink/50">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-full border-2 border-ink/15 bg-white px-3 py-1.5 font-bold text-ink/70 transition-colors hover:text-ink"
            >
              {t('upload')}
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
            {status === 'loading' ? t('working') : t('run', { tool: t(`tools.${tool}.label`) })}
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
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">{t('resultLabel')}</h3>
              <CopyButton text={result} />
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/90">{result}</p>
          </div>
        )}
      </div>
    </div>
  )
}
