import { useEffect, useRef, useState } from 'react'
import type { BookTypeId } from '../data/bookTypes'
import { getHelperReply, quickPrompts } from '../data/helper'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

interface FictionHelperProps {
  selected: BookTypeId
}

const WELCOME: Message = {
  role: 'assistant',
  text: "Hi! I'm your Fiction Helper 🤖 — ask me for a villain, a hero, a plot twist, a title, a line of dialogue, or how to publish. Tap a suggestion below to try it out!",
}

export default function FictionHelper({ selected }: FictionHelperProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  async function sendPrompt(prompt: string) {
    const trimmed = prompt.trim()
    if (!trimmed || thinking) return

    const nextMessages = [...messages, { role: 'user' as const, text: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setThinking(true)

    let reply: string
    try {
      const res = await fetch('/api/fiction-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, genre: selected }),
      })
      const data = await res.json()
      reply = res.ok && typeof data?.reply === 'string' ? data.reply : getHelperReply(trimmed, selected)
    } catch {
      reply = getHelperReply(trimmed, selected)
    }

    setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    setThinking(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendPrompt(input)
  }

  function handleReset() {
    setMessages([WELCOME])
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="fixed bottom-5 right-4 z-50 sm:bottom-6 sm:right-6" onKeyDown={handleKeyDown}>
      {open && (
        <div
          role="region"
          aria-label="Fiction Helper chat"
          className="animate-pop-in mb-3 flex h-[70vh] max-h-[36rem] w-[92vw] max-w-sm flex-col overflow-hidden rounded-3xl border-2 border-ink/10 bg-base shadow-xl sm:w-96"
        >
          <div className="flex items-center justify-between border-b-2 border-ink/10 bg-white/70 px-4 py-3">
            <h2 className="font-extrabold text-ink">Fiction Helper 🤖</h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full px-2.5 py-1.5 text-xs font-bold text-ink/60 transition-colors hover:bg-primary/15 hover:text-ink"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close Fiction Helper"
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-primary/15 hover:text-ink"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <div ref={scrollRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <p
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-content'
                      : 'border-2 border-ink/10 bg-white/80 text-ink/90'
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))}

            {thinking && (
              <div className="flex justify-start">
                <p className="rounded-2xl border-2 border-ink/10 bg-white/80 px-3.5 py-2.5 text-sm text-ink/50">
                  <span aria-hidden="true">···</span>
                  <span className="sr-only">Thinking</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto border-t-2 border-ink/10 bg-white/50 px-3 py-2">
            {quickPrompts.map((qp) => (
              <button
                key={qp.label}
                type="button"
                onClick={() => sendPrompt(qp.prompt)}
                disabled={thinking}
                className="shrink-0 rounded-full border-2 border-ink/15 bg-white/80 px-3 py-1.5 text-xs font-bold text-ink/70 transition-colors hover:border-secondary/50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                {qp.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t-2 border-ink/10 p-3">
            <label htmlFor="helper-input" className="sr-only">
              Ask the Fiction Helper
            </label>
            <input
              ref={inputRef}
              id="helper-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for a villain, twist, title..."
              className="flex-1 rounded-full border-2 border-ink/15 bg-white/80 px-4 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-primary/50"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12h15m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Minimize Fiction Helper' : 'Open Fiction Helper'}
        className="relative ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-accent" />
          </span>
        )}
        <span aria-hidden="true">{open ? '✕' : '🤖'}</span>
      </button>
    </div>
  )
}
