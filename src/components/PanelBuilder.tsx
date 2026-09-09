import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getBookFormatTheme, textureOverlayStyle } from '../data/bookFormatThemes'
import type { BookFormat } from '../lib/books'
import { createClient } from '../lib/supabase/client'
import { encodeCaptionType, type CaptionType } from '../lib/captionType'
import { rasterizePdfFirstPage } from '../lib/pdfToImage'
import { downloadBookAsPdf } from '../lib/downloadBookPdf'
import DictateButton from './DictateButton'

type BuilderStyle = 'picturebook' | 'comic' | 'manga'
type LayoutKey = 'oneBig' | 'twoStacked' | 'threeAcross' | 'wideTop2' | 'fourSquares' | 'manga5'

const STYLE_ORDER: BuilderStyle[] = ['picturebook', 'comic', 'manga']
const STYLE_TO_FORMAT: Record<BuilderStyle, BookFormat> = { picturebook: 'childrens', comic: 'comic', manga: 'manga' }
const STYLE_RTL: Record<BuilderStyle, boolean> = { picturebook: false, comic: false, manga: true }

interface LayoutDef {
  count: number
  cols: string
  rows: string
  areas: number[][]
  nubs: { x: number; y: number }[]
}

const LAYOUTS: Record<LayoutKey, LayoutDef> = {
  oneBig: { count: 1, cols: '1fr', rows: '1fr', areas: [[1]], nubs: [] },
  twoStacked: { count: 2, cols: '1fr', rows: '1fr 1fr', areas: [[1], [2]], nubs: [{ x: 50, y: 50 }] },
  threeAcross: {
    count: 3,
    cols: '1fr 1fr 1fr',
    rows: '1fr',
    areas: [[1, 2, 3]],
    nubs: [
      { x: 33.3, y: 50 },
      { x: 66.7, y: 50 },
    ],
  },
  wideTop2: {
    count: 3,
    cols: '1fr 1fr',
    rows: '1.15fr 1fr',
    areas: [
      [1, 1],
      [2, 3],
    ],
    nubs: [
      { x: 25, y: 53.5 },
      { x: 75, y: 53.5 },
      { x: 50, y: 76.75 },
    ],
  },
  fourSquares: {
    count: 4,
    cols: '1fr 1fr',
    rows: '1fr 1fr',
    areas: [
      [1, 2],
      [3, 4],
    ],
    nubs: [
      { x: 50, y: 25 },
      { x: 50, y: 75 },
      { x: 25, y: 50 },
      { x: 75, y: 50 },
    ],
  },
  manga5: {
    count: 5,
    cols: '1fr 1fr',
    rows: '0.85fr 1fr 1fr',
    areas: [
      [1, 1],
      [2, 3],
      [4, 5],
    ],
    nubs: [
      { x: 25, y: 29.8 },
      { x: 75, y: 29.8 },
      { x: 50, y: 47.35 },
      { x: 25, y: 64.9 },
      { x: 75, y: 64.9 },
      { x: 50, y: 82.45 },
    ],
  },
}
const LAYOUT_ORDER: LayoutKey[] = ['oneBig', 'twoStacked', 'threeAcross', 'wideTop2', 'fourSquares', 'manga5']
const TEXT_TYPE_ORDER: CaptionType[] = ['speech', 'caption', 'thought']
const TEXT_TYPE_ICON: Record<CaptionType, string> = { speech: '💬', caption: '📝', thought: '💭' }

const ACCEPTED_IMAGE = ['image/png', 'image/jpeg', 'image/webp']
const PDF_TYPE = 'application/pdf'
const ACCEPTED_UPLOAD = [...ACCEPTED_IMAGE, PDF_TYPE]
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_PAGES = 30

interface PanelState {
  image?: string
  textType?: CaptionType
  text?: string
}
interface PageState {
  layout: LayoutKey
  panels: PanelState[]
}

function makePage(layout: LayoutKey): PageState {
  return { layout, panels: Array.from({ length: LAYOUTS[layout].count }, () => ({})) }
}

function layoutCells(key: LayoutKey) {
  const { areas } = LAYOUTS[key]
  const seen = new Set<number>()
  const cells: { n: number; gridColumn: string; gridRow: string }[] = []
  areas.forEach((row, r) =>
    row.forEach((n, c) => {
      if (seen.has(n)) return
      seen.add(n)
      let colSpan = 1
      let rowSpan = 1
      for (let i = c + 1; i < row.length; i++) if (row[i] === n) colSpan++
      for (let i = r + 1; i < areas.length; i++) if (areas[i][c] === n) rowSpan++
      cells.push({ n, gridColumn: `${c + 1} / span ${colSpan}`, gridRow: `${r + 1} / span ${rowSpan}` })
    }),
  )
  return cells
}

interface PlannerBook {
  id: string
  title: string
}

export default function PanelBuilder() {
  const t = useTranslations('PanelBuilder')

  const [style, setStyle] = useState<BuilderStyle>('comic')
  const [pagesByStyle, setPagesByStyle] = useState<Record<BuilderStyle, PageState[]>>({
    picturebook: [makePage('threeAcross')],
    comic: [makePage('threeAcross')],
    manga: [makePage('threeAcross')],
  })
  const [pageIndex, setPageIndex] = useState(0)
  const [turnDir, setTurnDir] = useState<'next' | 'prev'>('next')
  const [selectedPanel, setSelectedPanel] = useState<number | null>(null)
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageBusy, setImageBusy] = useState(false)
  const [imageError, setImageError] = useState('')
  const [convertingPdf, setConvertingPdf] = useState(false)

  const [userId, setUserId] = useState<string | null>(null)
  const [books, setBooks] = useState<PlannerBook[] | null>(null)
  const [selectedBookId, setSelectedBookId] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [publishedBookId, setPublishedBookId] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  const theme = getBookFormatTheme(STYLE_TO_FORMAT[style])
  const rtl = STYLE_RTL[style]
  const pages = pagesByStyle[style]
  const currentPage = pages[pageIndex]
  const cells = layoutCells(currentPage.layout)
  const currentPanel = selectedPanel !== null ? currentPage.panels[selectedPanel] : undefined

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  // The header's "Book Panel" tab lands on #panel-builder directly, but old
  // links/bookmarks may still point at these two anchors — honor them by
  // picking the matching style so they still land on the right tool.
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash === 'manga-planner') setStyle('manga')
    else if (hash === 'comic-planner') setStyle('comic')
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
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows = (data ?? []) as PlannerBook[]
        setBooks(rows)
        setSelectedBookId((prev) => prev || rows[0]?.id || '')
      })
  }, [userId])

  function switchStyle(next: BuilderStyle) {
    setStyle(next)
    setPageIndex(0)
    setSelectedPanel(null)
    setPublishedBookId(null)
  }

  function setLayout(key: LayoutKey) {
    setPagesByStyle((prev) => {
      const next = [...prev[style]]
      next[pageIndex] = makePage(key)
      return { ...prev, [style]: next }
    })
    setSelectedPanel(null)
  }

  function updatePanel(panelIndex: number, patch: Partial<PanelState>) {
    setPagesByStyle((prev) => {
      const pageList = [...prev[style]]
      const panels = [...pageList[pageIndex].panels]
      panels[panelIndex] = { ...panels[panelIndex], ...patch }
      pageList[pageIndex] = { ...pageList[pageIndex], panels }
      return { ...prev, [style]: pageList }
    })
  }

  function goPrev() {
    if (pageIndex === 0) return
    setTurnDir('prev')
    setPageIndex((i) => i - 1)
    setSelectedPanel(null)
  }

  function goNext() {
    if (pageIndex < pages.length - 1) {
      setTurnDir('next')
      setPageIndex((i) => i + 1)
      setSelectedPanel(null)
      return
    }
    if (pages.length >= MAX_PAGES) return
    setPagesByStyle((prev) => ({ ...prev, [style]: [...prev[style], makePage(currentPage.layout)] }))
    setTurnDir('next')
    setPageIndex((i) => i + 1)
    setSelectedPanel(null)
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
      updatePanel(selectedPanel, { image: data.image })
      setImagePrompt('')
    } catch (err) {
      setImageError(err instanceof Error ? err.message : t('imageGenericError'))
    } finally {
      setImageBusy(false)
    }
  }

  async function handleUploadImage(file: File) {
    if (selectedPanel === null || !userId || convertingPdf) return
    setImageError('')
    if (!ACCEPTED_UPLOAD.includes(file.type)) {
      setImageError(t('imageFileError'))
      return
    }

    let uploadFile = file
    if (file.type === PDF_TYPE) {
      setConvertingPdf(true)
      try {
        uploadFile = await rasterizePdfFirstPage(file)
      } catch {
        setImageError(t('pdfConvertError'))
        setConvertingPdf(false)
        return
      }
      setConvertingPdf(false)
    }

    if (uploadFile.size > MAX_IMAGE_BYTES) {
      setImageError(t('imageFileError'))
      return
    }

    const supabase = createClient()
    if (!supabase) return
    const ext = uploadFile.name.split('.').pop() || 'jpg'
    const path = `${userId}/builder-${style}-${pageIndex}-${selectedPanel}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('books')
      .upload(path, uploadFile, { contentType: uploadFile.type })
    if (uploadError) {
      setImageError(uploadError.message)
      return
    }
    const url = supabase.storage.from('books').getPublicUrl(path).data.publicUrl
    updatePanel(selectedPanel, { image: url })
  }

  const filledPanels = pages.flatMap((page) => page.panels.filter((p) => p.image))

  function flattenPages() {
    const orderedPanels = pages.flatMap((page) => {
      const panelCells = layoutCells(page.layout)
      const ordered = rtl ? [...panelCells].reverse() : panelCells
      return ordered.map((c) => page.panels[c.n - 1]).filter((p) => p.image)
    })
    const pagesOut = orderedPanels.map((p) => p.image!)
    const pageCaptions = orderedPanels.map((p) => (p.text ? encodeCaptionType(p.textType ?? 'speech', p.text) : ''))
    return { pagesOut, pageCaptions }
  }

  async function handlePublish() {
    if (!selectedBookId || filledPanels.length === 0 || publishing) return
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
      const { pagesOut, pageCaptions } = flattenPages()
      const { error: insertError } = await supabase.from('book_chapters').insert({
        book_id: selectedBookId,
        chapter_number: nextNumber,
        title: null,
        pages: pagesOut,
        page_captions: pageCaptions,
      })
      if (insertError) throw insertError
      setPublishedBookId(selectedBookId)
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : t('imageGenericError'))
    } finally {
      setPublishing(false)
    }
  }

  async function handleDownload() {
    if (filledPanels.length === 0 || downloading) return
    setDownloading(true)
    setDownloadError('')
    try {
      const { pagesOut, pageCaptions } = flattenPages()
      const title = books?.find((b) => b.id === selectedBookId)?.title || t('downloadDefaultTitle')
      await downloadBookAsPdf(
        { title, description: '' },
        [
          {
            id: 'draft',
            bookId: selectedBookId,
            chapterNumber: 1,
            title: null,
            body: null,
            pages: pagesOut,
            pageCaptions,
            publishedAt: new Date().toISOString(),
          },
        ],
      )
    } catch {
      setDownloadError(t('downloadError'))
    } finally {
      setDownloading(false)
    }
  }

  const selectedBookTitle = books?.find((b) => b.id === publishedBookId)?.title

  return (
    <section id="panel-builder" className="px-4 py-16 sm:px-6">
      <span id="comic-planner" className="sr-only" aria-hidden="true" />
      <span id="manga-planner" className="sr-only" aria-hidden="true" />
      <div
        className="relative mx-auto max-w-3xl rounded-3xl border-2 p-6 shadow-sm sm:p-10"
        style={{ background: theme.pageBg, borderColor: `${theme.ink}1a` }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl" style={{ color: theme.ink, fontFamily: theme.displayFont }}>
            {t('title')} 🧩
          </h2>
          <p className="mx-auto mt-3 max-w-xl" style={{ color: theme.soft, fontFamily: theme.bodyFont }}>
            {t('lead')}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {STYLE_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => switchStyle(s)}
              className="rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors"
              style={
                s === style
                  ? { background: theme.accent, borderColor: theme.accent, color: '#fff' }
                  : { background: '#fff', borderColor: `${theme.ink}26`, color: theme.ink }
              }
            >
              {t(`style.${s}`)}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wide" style={{ color: theme.soft }}>
            {t('layoutHeading')}
          </h3>
          <p className="text-xs font-semibold" style={{ color: theme.soft }}>
            {t('pageOf', { n: pageIndex + 1, total: MAX_PAGES })}
          </p>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {LAYOUT_ORDER.map((key) => {
            const active = currentPage.layout === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setLayout(key)}
                className="flex flex-col items-center gap-1 rounded-lg border-2 bg-white/70 py-2"
                style={{ borderColor: active ? theme.accent : `${theme.ink}22` }}
              >
                <LayoutIcon layoutKey={key} active={active} ink={theme.ink} accent={theme.accent} />
                <span className="text-center text-[8.5px] font-bold leading-tight" style={{ color: active ? theme.ink : theme.soft }}>
                  {t(`layout.${key}`)}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mx-auto mt-4 flex w-full max-w-xl items-center gap-3" style={{ perspective: '1400px' }}>
          <button
            type="button"
            onClick={goPrev}
            disabled={pageIndex === 0}
            aria-label={t('prevPage')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink/15 bg-white text-base font-bold text-ink disabled:opacity-30"
          >
            ‹
          </button>

          <div
            key={pageIndex}
            className={`relative aspect-[3/4] flex-1 gap-1.5 overflow-hidden ${
              turnDir === 'prev' ? 'animate-page-turn-prev' : 'animate-page-turn-next'
            }`}
            style={{
              display: 'grid',
              gridTemplateColumns: LAYOUTS[currentPage.layout].cols,
              gridTemplateRows: LAYOUTS[currentPage.layout].rows,
              padding: '6px',
              border: theme.pageBorder === 'none' ? `1px solid ${theme.ink}22` : theme.pageBorder,
              borderRadius: theme.pageRadius,
              boxShadow: theme.pageShadow,
              background: theme.pageBg,
              transformOrigin: 'left center',
            }}
          >
            {cells.map(({ n, gridColumn, gridRow }) => {
              const panel = currentPage.panels[n - 1]
              const isSelected = selectedPanel === n - 1
              const decoded = panel.textType ?? 'speech'
              return (
                <div
                  key={n}
                  onClick={() => setSelectedPanel(isSelected ? null : n - 1)}
                  className="relative cursor-pointer overflow-hidden"
                  style={{
                    gridColumn,
                    gridRow,
                    background: `${theme.ink}0d`,
                    border: isSelected ? `2.5px solid ${theme.accent}` : `1.5px solid ${theme.ink}22`,
                  }}
                >
                  {panel.image ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={panel.image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        style={theme.grayscale ? { filter: 'grayscale(1) contrast(1.05)' } : undefined}
                      />
                      {theme.illustTexture !== 'flat' && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0"
                          style={textureOverlayStyle(theme.illustTexture, theme.ink)}
                        />
                      )}
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl opacity-30">🖼️</div>
                  )}

                  <span
                    className="absolute bottom-1 rounded-full px-1.5 py-0.5 text-[8px] font-bold"
                    style={{ [rtl ? 'right' : 'left']: 4, color: `${theme.ink}99`, background: `${theme.pageBg}cc` } as React.CSSProperties}
                  >
                    {t('panelWord')} {n}
                  </span>

                  {panel.textType && (
                    <TextBox
                      type={decoded}
                      value={panel.text ?? ''}
                      onChange={(text) => updatePanel(n - 1, { text })}
                      theme={theme}
                      rtl={rtl}
                      manga={style === 'manga'}
                      placeholder={t('textPlaceholder')}
                    />
                  )}
                </div>
              )
            })}

            {LAYOUTS[currentPage.layout].nubs.map((nub, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="pointer-events-none absolute z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: `${nub.x}%`,
                  top: `${nub.y}%`,
                  background: theme.pageBg,
                  border: `1.5px solid ${theme.ink}55`,
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={pageIndex >= pages.length - 1 && pages.length >= MAX_PAGES}
            aria-label={t('nextPage')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink/15 bg-white text-base font-bold text-ink disabled:opacity-30"
          >
            ›
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
          {pages.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === pageIndex ? 18 : 6, background: i === pageIndex ? theme.accent : `${theme.ink}26` }}
            />
          ))}
        </div>

        {selectedPanel === null ? (
          <p className="mt-4 text-center text-sm" style={{ color: theme.soft }}>
            {t('tapHint')}
          </p>
        ) : (
          <div className="mx-auto mt-4 max-w-xl rounded-2xl border-2 border-primary/40 bg-primary/5 p-4 sm:p-5">
            <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-ink/60">
              {t('panelWord')} {selectedPanel + 1}
            </h3>

            <div className="flex flex-wrap items-center gap-1.5">
              {TEXT_TYPE_ORDER.map((typeKey) => (
                <button
                  key={typeKey}
                  type="button"
                  onClick={() => updatePanel(selectedPanel, { textType: typeKey, text: currentPanel?.text ?? '' })}
                  className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold ${
                    currentPanel?.textType === typeKey
                      ? 'border-primary bg-primary/20 text-ink'
                      : 'border-ink/15 bg-white text-ink/70'
                  }`}
                >
                  {TEXT_TYPE_ICON[typeKey]} {t(`textType.${typeKey}`)}
                </button>
              ))}
              {(currentPanel?.image || currentPanel?.textType) && (
                <button
                  type="button"
                  onClick={() => updatePanel(selectedPanel, { image: undefined, text: undefined, textType: undefined })}
                  className="rounded-full border-2 border-red-400/50 bg-white px-3 py-1.5 text-xs font-bold text-red-600"
                >
                  ✕ {t('clearPanel')}
                </button>
              )}
            </div>

            {!currentPanel?.image && (
              <div className="mt-3 rounded-lg border-2 border-ink/10 bg-white/70 p-2.5">
                <p className="mb-1.5 text-xs font-bold text-ink/60">{t('panelImageLabel')}</p>
                {userId ? (
                  <label
                    className={`rounded-full border-2 border-ink/15 bg-white px-3 py-1 text-xs font-bold text-ink/70 ${
                      convertingPdf ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-page'
                    }`}
                  >
                    {convertingPdf ? t('convertingPdf') : t('uploadImage')}
                    <input
                      type="file"
                      accept={ACCEPTED_UPLOAD.join(',')}
                      disabled={convertingPdf}
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
            )}
          </div>
        )}

        {filledPanels.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void handleDownload()}
              disabled={downloading}
              className="flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-page disabled:cursor-not-allowed disabled:opacity-50"
            >
              {downloading ? t('downloadingButton') : `⬇️ ${t('downloadButton')}`}
            </button>
            {downloadError && <p className="text-xs font-semibold text-red-600">{downloadError}</p>}
          </div>
        )}

        <div className="mt-6 rounded-2xl border-2 border-ink/10 bg-white/70 p-4 sm:p-5">
          <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink/60">{t('publishHeading')}</h3>
          {!userId ? (
            <p className="text-sm text-ink/60">{t('signInToPublish')}</p>
          ) : books === null ? (
            <p className="text-sm text-ink/50">{t('loadingBooks')}</p>
          ) : books.length === 0 ? (
            <p className="text-sm text-ink/60">{t('publishNoBooks')}</p>
          ) : (
            <>
              <p className="mb-3 text-xs font-semibold text-ink/50">
                {t('publishedPanelsCount', { count: filledPanels.length })}
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
                  disabled={publishing || filledPanels.length === 0 || !selectedBookId}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-content disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {publishing ? t('publishingButton') : t('publishButton')}
                </button>
              </div>
              {filledPanels.length === 0 && <p className="mt-2 text-xs font-semibold text-ink/45">{t('publishNeedImage')}</p>}
              {publishError && <p className="mt-2 text-xs font-semibold text-red-600">{publishError}</p>}
              {publishedBookId && (
                <p className="mt-2 text-xs font-bold text-primary-content">
                  {t('publishSuccess', { title: selectedBookTitle ?? '' })}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function LayoutIcon({
  layoutKey,
  active,
  ink,
  accent,
}: {
  layoutKey: LayoutKey
  active: boolean
  ink: string
  accent: string
}) {
  const { cols, rows } = LAYOUTS[layoutKey]
  const cells = layoutCells(layoutKey)
  const color = active ? accent : `${ink}88`
  return (
    <div className="grid h-6 w-8 gap-[1.5px]" style={{ gridTemplateColumns: cols, gridTemplateRows: rows }}>
      {cells.map(({ n, gridColumn, gridRow }) => (
        <span key={n} style={{ gridColumn, gridRow, background: color, borderRadius: 1 }} />
      ))}
    </div>
  )
}

function TextBox({
  type,
  value,
  onChange,
  theme,
  rtl,
  manga,
  placeholder,
}: {
  type: CaptionType
  value: string
  onChange: (text: string) => void
  theme: ReturnType<typeof getBookFormatTheme>
  rtl: boolean
  manga: boolean
  placeholder: string
}) {
  const radius = manga ? 3 : 14
  const side: 'left' | 'right' = rtl ? 'right' : 'left'
  const textarea = (
    <textarea
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value)}
      rows={2}
      placeholder={placeholder}
      className="block w-full resize-none border-0 bg-transparent p-0 text-[10.5px] font-bold leading-snug text-ink placeholder:font-semibold placeholder:italic placeholder:text-ink/40 focus:outline-none focus:ring-0"
      style={{ fontFamily: theme.bodyFont }}
    />
  )

  if (type === 'caption') {
    return (
      <div
        className="absolute inset-x-0 bottom-0 z-[2] px-2.5 py-2"
        style={{ background: 'rgba(255,255,255,.93)', borderTop: `2px solid ${theme.ink}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {textarea}
      </div>
    )
  }

  if (type === 'thought') {
    return (
      <div
        className="absolute top-1.5 z-[2] max-w-[80%] px-3 py-2.5"
        style={{ [side]: 6, background: '#fff', border: `2px solid ${theme.ink}`, borderRadius: '46% 54% 58% 42% / 58% 48% 52% 42%' } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        {textarea}
        <span
          className="absolute flex flex-col gap-0.5"
          style={{ [side]: 12, top: '100%', marginTop: 3 } as React.CSSProperties}
        >
          <span
            className="block rounded-full"
            style={{ width: 7, height: 7, background: '#fff', border: `1.5px solid ${theme.ink}` }}
          />
          <span
            className="ml-1 block rounded-full"
            style={{ width: 4, height: 4, background: '#fff', border: `1.5px solid ${theme.ink}` }}
          />
        </span>
      </div>
    )
  }

  return (
    <div
      className="absolute top-1.5 z-[2] max-w-[80%] px-2.5 py-1.5"
      style={{ [side]: 6, background: '#fff', border: `2px solid ${theme.ink}`, borderRadius: radius } as React.CSSProperties}
      onClick={(e) => e.stopPropagation()}
    >
      {textarea}
      <span
        className="absolute -bottom-[5px] h-[9px] w-[9px] rotate-45"
        style={{ [side]: 12, background: '#fff', borderRight: `2px solid ${theme.ink}`, borderBottom: `2px solid ${theme.ink}` } as React.CSSProperties}
      />
    </div>
  )
}
