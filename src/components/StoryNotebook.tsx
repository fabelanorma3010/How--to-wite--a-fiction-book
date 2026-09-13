'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import ReadAloud from './ReadAloud'
import DictateButton from './DictateButton'
import NotebookExport from './NotebookExport'
import NotebookImages from './NotebookImages'
import Sticker from './Sticker'
import { createClient } from '../lib/supabase/client'

const STORAGE_KEY = 'storyburst-notebook'
const FONT_SIZE_KEY = 'storyburst-notebook-font-size'
const FONT_FAMILY_KEY = 'storyburst-notebook-font-family'

const EMOJIS = ['✨', '💫', '❤️', '😊', '😢', '😱', '🔥', '⭐', '🌙', '☀️', '🌊', '🍃']

const FONT_SIZES = { sm: '0.875rem', base: '1rem', lg: '1.25rem' } as const
type FontSize = keyof typeof FONT_SIZES

const FONT_FAMILIES = {
  default: 'var(--font-nunito), sans-serif',
  handwritten: 'var(--font-baloo), cursive',
  serif: 'ui-serif, Georgia, serif',
  mono: 'ui-monospace, Menlo, monospace',
} as const
type FontFamily = keyof typeof FONT_FAMILIES

function isFontSize(value: string | null): value is FontSize {
  return value === 'sm' || value === 'base' || value === 'lg'
}

function isFontFamily(value: string | null): value is FontFamily {
  return value === 'default' || value === 'handwritten' || value === 'serif' || value === 'mono'
}

interface NotebookVersion {
  id: number
  content: string
  created_at: string
}

const VERSION_MIN_INTERVAL_MS = 5 * 60 * 1000
const MAX_VERSIONS_SHOWN = 20

export default function StoryNotebook() {
  const t = useTranslations('Notebook')
  const locale = useLocale()
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState<FontSize>('base')
  const [fontFamily, setFontFamily] = useState<FontFamily>('default')
  const [showHistory, setShowHistory] = useState(false)
  const [versions, setVersions] = useState<NotebookVersion[] | null>(null)
  const [loadingVersions, setLoadingVersions] = useState(false)
  const saveTimeout = useRef<number | undefined>(undefined)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastVersion = useRef<{ content: string; savedAt: number } | null>(null)

  // Always paint from this browser's copy first — instant, no network wait.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) setText(stored)

    const storedSize = window.localStorage.getItem(FONT_SIZE_KEY)
    if (isFontSize(storedSize)) setFontSize(storedSize)
    const storedFamily = window.localStorage.getItem(FONT_FAMILY_KEY)
    if (isFontFamily(storedFamily)) setFontFamily(storedFamily)
  }, [])

  // Then, if signed in, reconcile with the account's copy so the notebook
  // follows a member between devices instead of living in one browser only.
  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id
      if (!id) return
      setUserId(id)

      supabase
        .from('notebooks')
        .select('content')
        .eq('user_id', id)
        .maybeSingle()
        .then(({ data: row }) => {
          const remote = row?.content ?? ''
          const local = window.localStorage.getItem(STORAGE_KEY) ?? ''
          if (remote) {
            // The account already has a copy — it wins, and becomes this
            // browser's copy too.
            setText(remote)
            window.localStorage.setItem(STORAGE_KEY, remote)
          } else if (local) {
            // First time this account has synced a notebook — carry this
            // browser's draft up instead of discarding it.
            void supabase
              .from('notebooks')
              .upsert({ user_id: id, content: local, updated_at: new Date().toISOString() })
          }
        })

      // Seed the throttle from the last snapshot already on record, so
      // signing in again doesn't immediately create a duplicate version.
      supabase
        .from('notebook_versions')
        .select('content, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data: row }) => {
          if (row) lastVersion.current = { content: row.content, savedAt: new Date(row.created_at).getTime() }
        })
    })
  }, [])

  // Snapshots a version for history, throttled so continuous typing doesn't
  // create one row per pause — only after enough time has passed since the
  // last snapshot (or immediately, when `force` is set, e.g. around a restore).
  async function commitVersion(id: string, content: string, force = false) {
    if (!content.trim()) return
    const last = lastVersion.current
    if (last?.content === content) return
    if (!force && last && Date.now() - last.savedAt < VERSION_MIN_INTERVAL_MS) return

    const supabase = createClient()
    if (!supabase) return
    const { error } = await supabase.from('notebook_versions').insert({ user_id: id, content })
    if (!error) lastVersion.current = { content, savedAt: Date.now() }
  }

  async function loadVersions(id: string) {
    setLoadingVersions(true)
    const supabase = createClient()
    const { data } = (await supabase
      ?.from('notebook_versions')
      .select('id, content, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(MAX_VERSIONS_SHOWN)) ?? { data: null }
    setVersions(data ?? [])
    setLoadingVersions(false)
  }

  function handleToggleHistory() {
    const next = !showHistory
    setShowHistory(next)
    if (next && userId && versions === null) {
      void loadVersions(userId)
    }
  }

  async function handleRestore(version: NotebookVersion) {
    if (!userId || !window.confirm(t('restoreConfirm'))) return
    const supabase = createClient()

    // Protect whatever's currently in the box before it gets overwritten.
    await commitVersion(userId, text, true)

    setText(version.content)
    window.localStorage.setItem(STORAGE_KEY, version.content)
    await supabase
      ?.from('notebooks')
      .upsert({ user_id: userId, content: version.content, updated_at: new Date().toISOString() })
    await commitVersion(userId, version.content, true)

    setSaved(true)
    setShowHistory(false)
    void loadVersions(userId)
  }

  function handleChange(value: string) {
    setText(value)
    setSaved(false)
    window.clearTimeout(saveTimeout.current)
    saveTimeout.current = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, value)
      if (userId) {
        const supabase = createClient()
        void supabase
          ?.from('notebooks')
          .upsert({ user_id: userId, content: value, updated_at: new Date().toISOString() })
        void commitVersion(userId, value)
      }
      setSaved(true)
    }, 400)
  }

  function handleClear() {
    if (text.trim() && !window.confirm(t('clearConfirm'))) {
      return
    }
    setText('')
    window.localStorage.removeItem(STORAGE_KEY)
    if (userId) {
      const supabase = createClient()
      void supabase?.from('notebooks').upsert({ user_id: userId, content: '', updated_at: new Date().toISOString() })
    }
    setSaved(true)
  }

  function handleDictateResult(chunk: string) {
    handleChange(text ? `${text} ${chunk}` : chunk)
  }

  function insertAtCursor(snippet: string) {
    const el = textareaRef.current
    const start = el?.selectionStart ?? text.length
    const end = el?.selectionEnd ?? text.length
    handleChange(text.slice(0, start) + snippet + text.slice(end))
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      const pos = start + snippet.length
      el.setSelectionRange(pos, pos)
    })
  }

  function handleFontSizeChange(value: string) {
    if (!isFontSize(value)) return
    setFontSize(value)
    window.localStorage.setItem(FONT_SIZE_KEY, value)
  }

  function handleFontFamilyChange(value: string) {
    if (!isFontFamily(value)) return
    setFontFamily(value)
    window.localStorage.setItem(FONT_FAMILY_KEY, value)
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <section id="notebook" className="scroll-mt-[116px] px-4 py-16 sm:px-6 lg:scroll-mt-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">{t('title')} 📓</h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink/70">
            {t('intro')} {userId ? t('syncedNote') : t('localNote')} {t('exportNote')}
          </p>
        </div>

        <div className="animate-pop-in relative rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8">
          <Sticker emoji="📓" className="-top-2 -left-2 -rotate-12 sm:-top-4 sm:-left-4" />

          <div className="mb-3 flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-1.5 font-semibold text-ink/60">
              {t('fontSizeLabel')}
              <select
                value={fontSize}
                onChange={(e) => handleFontSizeChange(e.target.value)}
                className="rounded-full border-2 border-ink/15 bg-white/80 px-2 py-1 text-sm font-bold text-ink"
              >
                <option value="sm">{t('fontSizeSmall')}</option>
                <option value="base">{t('fontSizeMedium')}</option>
                <option value="lg">{t('fontSizeLarge')}</option>
              </select>
            </label>
            <label className="flex items-center gap-1.5 font-semibold text-ink/60">
              {t('fontFamilyLabel')}
              <select
                value={fontFamily}
                onChange={(e) => handleFontFamilyChange(e.target.value)}
                className="rounded-full border-2 border-ink/15 bg-white/80 px-2 py-1 text-sm font-bold text-ink"
              >
                <option value="default">{t('fontDefault')}</option>
                <option value="handwritten">{t('fontHandwritten')}</option>
                <option value="serif">{t('fontSerif')}</option>
                <option value="mono">{t('fontMono')}</option>
              </select>
            </label>
          </div>

          <label htmlFor="notebook-textarea" className="sr-only">
            {t('title')}
          </label>
          <textarea
            id="notebook-textarea"
            ref={textareaRef}
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={t('placeholder')}
            rows={10}
            style={{ fontSize: FONT_SIZES[fontSize], fontFamily: FONT_FAMILIES[fontFamily] }}
            className="w-full resize-y rounded-2xl border-2 border-ink/15 bg-page/80 p-4 text-ink placeholder:text-ink/40 focus:border-primary/50"
          />

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-bold text-ink/45">{t('emojisLabel')}</span>
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insertAtCursor(emoji)}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink/15 bg-white text-base transition-transform hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-ink/60">{t('picturesTitle')}</p>
              <a
                href="https://stock.adobe.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-ink/50 underline underline-offset-2 hover:text-ink"
              >
                {t('stockPhotosLink')}
              </a>
            </div>
            <NotebookImages userId={userId} />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-ink/60">
              {t('wordCount', { count: wordCount })} ·{' '}
              {saved ? (userId ? t('synced') : t('saved')) : t('saving')}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <ReadAloud
                text={text}
                label={t('readAloud')}
                className="rounded-full border-2 border-ink/15 bg-white/70 px-4 py-2 font-bold text-ink transition-colors hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              />
              <DictateButton
                onResult={handleDictateResult}
                label={t('dictate')}
                className="rounded-full border-2 border-ink/15 bg-white/70 px-4 py-2 font-bold text-ink transition-colors hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              />
              <NotebookExport
                text={text}
                className="rounded-full border-2 border-ink/15 bg-white/70 px-4 py-2 font-bold text-ink transition-colors hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              />
              {userId && (
                <button
                  type="button"
                  onClick={handleToggleHistory}
                  aria-expanded={showHistory}
                  className="rounded-full border-2 border-ink/15 bg-white/70 px-4 py-2 font-bold text-ink transition-colors hover:bg-white active:scale-95"
                >
                  {t('historyButton')} 🕓
                </button>
              )}
              <button
                type="button"
                onClick={handleClear}
                disabled={!text}
                className="rounded-full border-2 border-ink/15 bg-white/70 px-4 py-2 font-bold text-ink transition-colors hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('clear')} 🗑️
              </button>
            </div>
          </div>

          {showHistory && userId && (
            <div className="mt-4 rounded-2xl border-2 border-ink/10 bg-page/60 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-ink/70">{t('historyTitle')}</p>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="text-xs font-bold text-ink/50 hover:text-ink"
                >
                  {t('historyClose')}
                </button>
              </div>

              {loadingVersions ? (
                <p className="text-sm text-ink/50">{t('historyLoading')}</p>
              ) : versions && versions.length > 0 ? (
                <ul className="space-y-2">
                  {versions.map((version) => (
                    <li
                      key={version.id}
                      className="flex items-center justify-between gap-3 rounded-xl border-2 border-ink/10 bg-white/70 p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-ink/60">
                          {new Date(version.created_at).toLocaleString(locale, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                        <p className="truncate text-sm text-ink/70">{version.content.slice(0, 80)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestore(version)}
                        className="shrink-0 rounded-full border-2 border-ink/15 bg-white px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:bg-page active:scale-95"
                      >
                        {t('historyRestore')}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink/50">{t('historyEmpty')}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
