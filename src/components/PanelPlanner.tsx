import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { planPanels, type PanelSize, WIDTH_WEIGHT } from '../lib/panelLayout'
import { createClient } from '../lib/supabase/client'
import CopyButton from './CopyButton'
import Sticker from './Sticker'
import DictateButton from './DictateButton'

export type PlannerMode = 'comic' | 'manga'

interface ModeConfig {
  id: string
  emoji: string
  sticker: string
  rtl: boolean
  /** manga = diagonal panel cuts, bleeds on the big beats, tight column gutters. */
  dynamic: boolean
  /** Example inputs stay in English — the parser matches English shape words. */
  examples: { label: string; text: string }[]
}

const MODES: Record<PlannerMode, ModeConfig> = {
  comic: {
    id: 'comic-planner',
    emoji: '💥',
    sticker: '🗂️',
    rtl: false,
    dynamic: false,
    examples: [
      {
        label: 'Heist beat',
        text: 'Wide panel for the vault, tall skinny panel for the drop, then a beat panel with no dialogue before the punch lands.',
      },
      {
        label: 'Rooftop chase',
        text: 'Establishing shot of the city rooftops at dusk. Then three quick beat panels of pounding feet. Then a big splash page of the leap across the gap.',
      },
      {
        label: 'Quiet scene',
        text: 'Two medium panels of them talking across the diner table. A tight beat panel on her hands around the mug. Wide panel as she stands and leaves without a word.',
      },
    ],
  },
  manga: {
    id: 'manga-planner',
    emoji: '🌸',
    sticker: '📖',
    rtl: true,
    dynamic: true,
    examples: [
      {
        label: 'Impact frame',
        text: 'Wide panel of the empty dojo. Tall skinny panel of the drawn sword. A silent beat panel on the eyes, then a big impact frame as the blades clash.',
      },
      {
        label: 'Confession',
        text: 'Two medium panels walking home under the cherry blossoms. A tight beat panel on the hand not quite taken. Wide panel of the confession, speed lines everywhere.',
      },
      {
        label: 'Cliffhanger',
        text: 'Big panel of the letter on the floor. Tall skinny panel of the open door. Then a silent beat panel, then a splash page of who is standing there.',
      },
    ],
  },
}

const STICKERS = ['💥', '⭐', '✨', '🔥', '❗', '👊', '😱', '💦']
const ACCEPTED_IMAGE = ['image/png', 'image/jpeg', 'image/webp']
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

interface PanelOverride {
  text?: string
  sticker?: string
  image?: string
}

interface PlannerBook {
  id: string
  title: string
}

interface PanelPlannerProps {
  mode: PlannerMode
}

export default function PanelPlanner({ mode }: PanelPlannerProps) {
  const cfg = MODES[mode]
  const t = useTranslations('PanelPlanner')
  const tm = useTranslations(mode === 'comic' ? 'PanelPlanner.comic' : 'PanelPlanner.manga')
  const [text, setText] = useState(cfg.examples[0].text)
  const [overrides, setOverrides] = useState<Record<number, PanelOverride>>({})
  const [selectedPanel, setSelectedPanel] = useState<number | null>(null)
  const [panelTextDraft, setPanelTextDraft] = useState('')
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageBusy, setImageBusy] = useState(false)
  const [imageError, setImageError] = useState('')

  const [userId, setUserId] = useState<string | null>(null)
  const [books, setBooks] = useState<PlannerBook[] | null>(null)
  const [selectedBookId, setSelectedBookId] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [publishedBookId, setPublishedBookId] = useState<string | null>(null)

  const plan = useMemo(() => planPanels(text), [text])
  const flatPanels = useMemo(() => plan.tiers.flatMap((tier) => tier.panels), [plan])

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  useEffect(() => {
    if (!userId) {
      setBooks([])
      return
    }
    const supabase = createClient()
    if (!supabase) return
    supabase
      .from('books')
      .select('id, title')
      .eq('user_id', userId)
      .eq('book_type', mode)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows = (data ?? []) as PlannerBook[]
        setBooks(rows)
        setSelectedBookId((prev) => prev || rows[0]?.id || '')
      })
  }, [userId, mode])

  function selectExample(exampleText: string) {
    setText(exampleText)
    setOverrides({})
    setSelectedPanel(null)
    setPublishedBookId(null)
  }

  function selectPanel(n: number, currentText: string) {
    setSelectedPanel((prev) => (prev === n ? null : n))
    setPanelTextDraft(overrides[n]?.text ?? currentText)
    setImageError('')
  }

  function updateOverride(n: number, patch: PanelOverride) {
    setOverrides((prev) => ({ ...prev, [n]: { ...prev[n], ...patch } }))
  }

  function commitPanelText() {
    if (selectedPanel !== null) updateOverride(selectedPanel, { text: panelTextDraft })
  }

  function toggleStickerOnSelected(emoji: string) {
    if (selectedPanel === null) return
    updateOverride(selectedPanel, { sticker: overrides[selectedPanel]?.sticker === emoji ? undefined : emoji })
  }

  async function handleGenerateImage() {
    if (selectedPanel === null || !imagePrompt.trim() || imageBusy) return
    setImageBusy(true)
    setImageError('')
    try {
      const res = await fetch('/api/generate-illustration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt.trim() }),
      })
      const data = await res.json()
      if (!res.ok || typeof data?.image !== 'string') {
        throw new Error(data?.error || t('imageGenericError'))
      }
      updateOverride(selectedPanel, { image: data.image })
      setImagePrompt('')
    } catch (err) {
      setImageError(err instanceof Error ? err.message : t('imageGenericError'))
    } finally {
      setImageBusy(false)
    }
  }

  async function handleUploadImage(file: File) {
    if (selectedPanel === null || !userId) return
    setImageError('')
    if (!ACCEPTED_IMAGE.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
      setImageError(t('imageFileError'))
      return
    }
    const supabase = createClient()
    if (!supabase) return
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${userId}/panel-${cfg.id}-${selectedPanel}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('books')
      .upload(path, file, { contentType: file.type })
    if (uploadError) {
      setImageError(uploadError.message)
      return
    }
    const url = supabase.storage.from('books').getPublicUrl(path).data.publicUrl
    updateOverride(selectedPanel, { image: url })
  }

  const illustratedPanels = flatPanels.filter((p) => overrides[p.n]?.image)

  async function handlePublish() {
    if (!selectedBookId || illustratedPanels.length === 0 || publishing) return
    setPublishing(true)
    setPublishError('')
    try {
      const supabase = createClient()
      if (!supabase) throw new Error(t('imageGenericError'))
      const { data: existing } = await supabase
        .from('book_chapters')
        .select('chapter_number')
        .eq('book_id', selectedBookId)
        .order('chapter_number', { ascending: false })
        .limit(1)
      const nextNumber = existing && existing.length > 0 ? existing[0].chapter_number + 1 : 1
      const pages = illustratedPanels.map((p) => overrides[p.n]!.image!)
      const { error: insertError } = await supabase.from('book_chapters').insert({
        book_id: selectedBookId,
        chapter_number: nextNumber,
        title: null,
        pages,
      })
      if (insertError) throw insertError
      setPublishedBookId(selectedBookId)
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : t('imageGenericError'))
    } finally {
      setPublishing(false)
    }
  }

  const sizeName = (size: PanelSize) => t(`size.${size}`)

  const script = useMemo(
    () =>
      [
        `// ${tm('title')} — ${tm('scriptNote')}`,
        ...flatPanels.map(
          (p) =>
            `${t('panelWord').toUpperCase()} ${p.n} — ${sizeName(p.size).toUpperCase()}${
              p.silent ? ` · ${t('noDialogue')}` : ''
            }\n${overrides[p.n]?.text ?? p.text}`,
        ),
      ].join('\n\n'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flatPanels, overrides, mode],
  )

  const totalWeight = plan.tiers.reduce((sum, tier) => sum + tier.height, 0)
  const pageHeight = Math.min(1000, Math.max(360, Math.round(totalWeight * 82)))
  const inputId = `${cfg.id}-input`
  const selectedBookTitle = books?.find((b) => b.id === publishedBookId)?.title

  return (
    <section id={cfg.id} className="px-4 py-16 sm:px-6">
      <div className="relative mx-auto max-w-3xl rounded-3xl border-2 border-ink/10 bg-white/60 p-6 shadow-sm sm:p-10">
        <Sticker emoji={cfg.sticker} className="-top-2 -left-2 -rotate-12 sm:-top-4 sm:-left-4" />
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
            {tm('title')} {cfg.emoji}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/70">{tm('lead')}</p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {cfg.examples.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => selectExample(ex.text)}
              className="rounded-full border-2 border-ink/15 bg-white/70 px-3 py-1.5 text-sm font-bold text-ink/70 transition-colors hover:border-ink/30 hover:text-ink"
            >
              {ex.label}
            </button>
          ))}
        </div>

        <label htmlFor={inputId} className="sr-only">
          {t('inputLabel')}
        </label>
        <textarea
          id={inputId}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setPublishedBookId(null)
          }}
          rows={4}
          placeholder="Wide establishing shot of the street. Two medium panels of the argument. Tall skinny panel as the door slams."
          className="mt-4 w-full resize-y rounded-2xl border-2 border-ink/15 bg-page/80 p-4 text-ink placeholder:text-ink/40 focus:border-primary/50"
        />
        <p className="mt-2 text-sm text-ink/50">{t('help')}</p>

        {plan.panelCount > 0 ? (
          <>
            <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">
                {t('pageCount', { count: plan.panelCount })}
              </h3>
              <p className="text-xs font-semibold text-ink/45">{tm('reading')}</p>
            </div>
            <p className="mt-2 text-center text-xs font-semibold text-ink/45">{t('tapPanelHint')}</p>

            <div
              className={`mx-auto mt-3 flex w-full max-w-sm flex-col overflow-hidden rounded-xl border-2 border-ink/15 bg-white p-1.5 ${
                cfg.dynamic ? 'gap-3' : 'gap-1.5'
              }`}
              style={{ height: pageHeight }}
            >
              {plan.tiers.map((tier, ti) => (
                <div
                  key={ti}
                  className={`flex min-h-0 ${cfg.dynamic ? 'gap-1' : 'gap-1.5'} ${
                    cfg.rtl ? 'flex-row-reverse' : ''
                  }`}
                  style={{ flexGrow: tier.height, flexBasis: 0 }}
                >
                  {tier.panels.map((p) => {
                    const bleed =
                      cfg.dynamic && tier.panels.length === 1 && (p.size === 'splash' || p.size === 'big')
                    const diagonal = cfg.dynamic && tier.panels.length > 1
                    const override = overrides[p.n]
                    const hasImage = Boolean(override?.image)
                    const isSelected = selectedPanel === p.n
                    return (
                      <div
                        key={p.n}
                        role="button"
                        tabIndex={0}
                        onClick={() => selectPanel(p.n, p.text)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            selectPanel(p.n, p.text)
                          }
                        }}
                        aria-label={t('editPanelAction', { n: p.n })}
                        aria-pressed={isSelected}
                        className={`relative flex min-w-0 cursor-pointer flex-col overflow-hidden ${
                          hasImage
                            ? 'border-2 border-ink'
                            : bleed
                              ? 'rounded-[2px] border-2 border-dashed border-ink/25 bg-gradient-to-br from-ink/10 to-ink/[0.02]'
                              : cfg.dynamic
                                ? 'rounded-[2px] border-2 border-dashed border-ink/25'
                                : 'rounded-sm border-[3px] border-dashed border-ink/25'
                        } ${diagonal && !hasImage ? 'px-3 py-2' : hasImage ? '' : 'p-2'} ${
                          !hasImage && p.silent && !bleed ? 'bg-ink/[0.05]' : !hasImage && !bleed ? 'bg-page/40' : ''
                        } ${isSelected ? 'ring-4 ring-primary ring-offset-1' : ''}`}
                        style={{
                          flexGrow: WIDTH_WEIGHT[p.size],
                          flexBasis: 0,
                          ...(bleed && !hasImage ? { margin: '-6px' } : null),
                          ...(diagonal
                            ? { clipPath: 'polygon(0% 0%, 94% 0%, 100% 100%, 6% 100%)' }
                            : null),
                        }}
                      >
                        {hasImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={override!.image}
                            alt=""
                            className="pointer-events-none h-full w-full object-cover"
                          />
                        ) : (
                          <>
                            <span className="text-[9px] font-black uppercase tracking-wider text-ink/45">
                              {p.n} &middot; {sizeName(p.size)}
                              {bleed ? ` · ${t('bleed')}` : p.silent ? ` · ${t('silent')}` : ''}
                            </span>
                            <span className="mt-0.5 line-clamp-3 text-[11px] font-semibold leading-snug text-ink/80">
                              {override?.text ?? p.text}
                            </span>
                            <span className="mt-auto text-[10px] font-bold text-ink/30">{t('addImageHint')}</span>
                          </>
                        )}
                        {override?.sticker && (
                          <span
                            aria-hidden="true"
                            className="animate-pop-in absolute right-1 top-1 flex h-6 w-6 rotate-12 items-center justify-center rounded-full border border-ink/10 bg-white text-sm shadow-md"
                          >
                            {override.sticker}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {selectedPanel !== null && (
              <div className="mt-4 rounded-2xl border-2 border-primary/40 bg-primary/5 p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">
                    {t('editingPanel', { n: selectedPanel })}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedPanel(null)}
                    className="text-xs font-bold text-ink/50 hover:text-ink"
                  >
                    {t('closeEditor')}
                  </button>
                </div>

                <label htmlFor={`${cfg.id}-panel-text`} className="mb-1 block text-xs font-bold text-ink/60">
                  {t('panelTextLabel')}
                </label>
                <textarea
                  id={`${cfg.id}-panel-text`}
                  value={panelTextDraft}
                  onChange={(e) => setPanelTextDraft(e.target.value)}
                  onBlur={commitPanelText}
                  rows={2}
                  className="w-full resize-y rounded-lg border-2 border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:border-primary/50"
                />

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-xs font-bold text-ink/45">{t('stickersLabel')}</span>
                  {STICKERS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => toggleStickerOnSelected(emoji)}
                      aria-pressed={overrides[selectedPanel]?.sticker === emoji}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-base transition-transform hover:scale-110 ${
                        overrides[selectedPanel]?.sticker === emoji
                          ? 'border-primary bg-primary/20 scale-110'
                          : 'border-ink/15 bg-white'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <div className="mt-3 rounded-lg border-2 border-ink/10 bg-white/70 p-2.5">
                  <p className="mb-1.5 text-xs font-bold text-ink/60">{t('panelImageLabel')}</p>
                  {userId ? (
                    <label className="cursor-pointer rounded-full border-2 border-ink/15 bg-white px-3 py-1 text-xs font-bold text-ink/70 hover:bg-page">
                      {t('uploadImage')}
                      <input
                        type="file"
                        accept={ACCEPTED_IMAGE.join(',')}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) void handleUploadImage(file)
                          e.target.value = ''
                        }}
                      />
                    </label>
                  ) : (
                    <p className="text-xs font-semibold text-ink/45">{t('signInForUpload')}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <input
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder={t('generateImagePrompt')}
                      className="min-w-0 flex-1 rounded-lg border-2 border-ink/15 bg-white px-2.5 py-1.5 text-xs text-ink focus:border-primary/50"
                    />
                    <DictateButton
                      onResult={setImagePrompt}
                      label={t('speakButton')}
                      className="rounded-full border-2 border-ink/15 bg-white px-3 py-1.5 text-xs font-bold text-ink/70 hover:bg-page"
                    />
                    <button
                      type="button"
                      onClick={() => void handleGenerateImage()}
                      disabled={imageBusy || !imagePrompt.trim()}
                      className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-content disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {imageBusy ? t('generatingButton') : `🖼️ ${t('generateButton')}`}
                    </button>
                  </div>
                  {imageError && <p className="mt-1.5 text-xs font-semibold text-red-600">{imageError}</p>}
                </div>
              </div>
            )}

            <div className="mt-6 rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 sm:p-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">
                  {t('breakdown')}
                </h3>
                <CopyButton text={script} />
              </div>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink/80">
                {script}
              </pre>
            </div>

            <div className="mt-4 rounded-2xl border-2 border-ink/10 bg-white/70 p-4 sm:p-5">
              <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink/60">
                {t('publishHeading')}
              </h3>
              {!userId ? (
                <p className="text-sm text-ink/60">{t('signInToPublish')}</p>
              ) : books === null ? (
                <p className="text-sm text-ink/50">{t('loadingBooks')}</p>
              ) : books.length === 0 ? (
                <p className="text-sm text-ink/60">{t('publishNoBooks')}</p>
              ) : (
                <>
                  <p className="mb-3 text-xs font-semibold text-ink/50">
                    {t('publishedPanelsCount', { count: illustratedPanels.length, total: flatPanels.length })}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={selectedBookId}
                      onChange={(e) => setSelectedBookId(e.target.value)}
                      className="rounded-lg border-2 border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:border-primary/50"
                    >
                      {books.map((book) => (
                        <option key={book.id} value={book.id}>
                          {book.title}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => void handlePublish()}
                      disabled={publishing || illustratedPanels.length === 0 || !selectedBookId}
                      className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-content disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {publishing ? t('publishingButton') : t('publishButton')}
                    </button>
                  </div>
                  {illustratedPanels.length === 0 && (
                    <p className="mt-2 text-xs font-semibold text-ink/45">{t('publishNeedImage')}</p>
                  )}
                  {publishError && <p className="mt-2 text-xs font-semibold text-red-600">{publishError}</p>}
                  {publishedBookId && (
                    <p className="mt-2 text-xs font-bold text-primary-content">
                      {t('publishSuccess', { title: selectedBookTitle ?? '' })}
                    </p>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <p className="mt-8 text-center text-sm text-ink/50">{t('emptyHint')}</p>
        )}
      </div>
    </section>
  )
}
