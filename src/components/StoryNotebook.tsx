'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import ReadAloud from './ReadAloud'
import DictateButton from './DictateButton'
import NotebookExport from './NotebookExport'
import NotebookImages from './NotebookImages'
import Sticker from './Sticker'
import { createClient } from '../lib/supabase/client'

const STORAGE_KEY = 'storyburst-notebook'
const FONT_SIZE_KEY = 'storyburst-notebook-font-size'
const FONT_FAMILY_KEY = 'storyburst-notebook-font-family'

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

export default function StoryNotebook() {
  const t = useTranslations('Notebook')
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState<FontSize>('base')
  const [fontFamily, setFontFamily] = useState<FontFamily>('default')
  const saveTimeout = useRef<number | undefined>(undefined)

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
    })
  }, [])

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
    <section id="notebook" className="px-4 py-16 sm:px-6">
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
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={t('placeholder')}
            rows={10}
            style={{ fontSize: FONT_SIZES[fontSize], fontFamily: FONT_FAMILIES[fontFamily] }}
            className="w-full resize-y rounded-2xl border-2 border-ink/15 bg-base/80 p-4 text-ink placeholder:text-ink/40 focus:border-primary/50"
          />

          <div className="mt-4">
            <p className="mb-2 text-sm font-bold text-ink/60">{t('picturesTitle')}</p>
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
        </div>
      </div>
    </section>
  )
}
