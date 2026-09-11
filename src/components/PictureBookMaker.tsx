'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { printHtml, escapeHtml } from '../lib/printHtml'
import Sticker from './Sticker'

type Tool = 'pencil' | 'crayon' | 'eraser'
type Point = { x: number; y: number }
type TemplateId = 'dog' | 'cat' | 'dinosaur' | 'rocket'

// Simple original line-art outlines (not any copyrighted character) that drop
// onto a fresh page so there's something fun to color inside of.
const TEMPLATES: { id: TemplateId; emoji: string }[] = [
  { id: 'dog', emoji: '🐶' },
  { id: 'cat', emoji: '🐱' },
  { id: 'dinosaur', emoji: '🦕' },
  { id: 'rocket', emoji: '🚀' },
]

const TEMPLATE_STROKE = 'fill="none" stroke="#1a1a1a" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"'

const TEMPLATE_SVGS: Record<TemplateId, string> = {
  dog: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><g ${TEMPLATE_STROKE}>
    <ellipse cx="95" cy="135" rx="32" ry="62" transform="rotate(-35 95 135)"/>
    <ellipse cx="305" cy="135" rx="32" ry="62" transform="rotate(35 305 135)"/>
    <circle cx="200" cy="180" r="90"/>
    <ellipse cx="200" cy="240" rx="45" ry="35"/>
    <ellipse cx="200" cy="230" rx="14" ry="10"/>
    <circle cx="165" cy="165" r="8"/>
    <circle cx="235" cy="165" r="8"/>
    <ellipse cx="200" cy="390" rx="110" ry="90"/>
    <rect x="140" y="440" width="30" height="50" rx="14"/>
    <rect x="230" y="440" width="30" height="50" rx="14"/>
    <path d="M310 350 Q 370 320 355 260"/>
  </g></svg>`,
  cat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><g ${TEMPLATE_STROKE}>
    <path d="M140 120 L120 60 L175 105 Z"/>
    <path d="M260 120 L280 60 L225 105 Z"/>
    <circle cx="200" cy="170" r="85"/>
    <ellipse cx="170" cy="160" rx="10" ry="14"/>
    <ellipse cx="230" cy="160" rx="10" ry="14"/>
    <path d="M192 190 L208 190 L200 200 Z"/>
    <path d="M120 190 L60 180 M120 205 L60 205 M120 220 L60 230"/>
    <path d="M280 190 L340 180 M280 205 L340 205 M280 220 L340 230"/>
    <ellipse cx="200" cy="380" rx="100" ry="95"/>
    <rect x="150" y="430" width="26" height="55" rx="13"/>
    <rect x="224" y="430" width="26" height="55" rx="13"/>
    <path d="M300 400 Q 380 380 370 300 Q 365 260 330 260"/>
  </g></svg>`,
  dinosaur: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><g ${TEMPLATE_STROKE}>
    <ellipse cx="220" cy="330" rx="120" ry="80"/>
    <path d="M140 300 Q 60 220 90 130"/>
    <ellipse cx="80" cy="110" rx="35" ry="25" transform="rotate(-30 80 110)"/>
    <circle cx="75" cy="100" r="6"/>
    <path d="M180 260 L195 220 L210 260 M215 265 L230 222 L245 265 M250 270 L265 228 L280 270"/>
    <path d="M330 340 Q 400 330 395 260"/>
    <rect x="160" y="390" width="30" height="60" rx="12"/>
    <rect x="260" y="390" width="30" height="60" rx="12"/>
  </g></svg>`,
  rocket: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><g ${TEMPLATE_STROKE}>
    <path d="M200 40 L150 160 L250 160 Z"/>
    <rect x="150" y="160" width="100" height="220" rx="10"/>
    <circle cx="200" cy="230" r="28"/>
    <path d="M150 320 L90 400 L150 380 Z"/>
    <path d="M250 320 L310 400 L250 380 Z"/>
    <path d="M170 380 Q 200 460 200 480 Q 200 460 230 380"/>
  </g></svg>`,
}

const COLORS = [
  '#1a1a1a',
  '#e63946',
  '#f4a300',
  '#ffd60a',
  '#2a9d8f',
  '#457b9d',
  '#7b2cbf',
  '#ff6fb1',
  '#8d5524',
  '#ffffff',
]
const MAX_PAGES = 20
const CANVAS_W = 800
const CANVAS_H = 1000

function blankPageDataUrl(): string {
  const c = document.createElement('canvas')
  c.width = CANVAS_W
  c.height = CANVAS_H
  const ctx = c.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
  }
  return c.toDataURL('image/png')
}

function templatePageDataUrl(templateId: TemplateId): Promise<string> {
  return new Promise((resolve) => {
    const c = document.createElement('canvas')
    c.width = CANVAS_W
    c.height = CANVAS_H
    const ctx = c.getContext('2d')
    if (!ctx) {
      resolve(blankPageDataUrl())
      return
    }
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    const img = new Image()
    const finish = () => resolve(c.toDataURL('image/png'))
    img.onload = () => {
      ctx.drawImage(img, CANVAS_W * 0.1, CANVAS_H * 0.08, CANVAS_W * 0.8, CANVAS_H * 0.8)
      finish()
    }
    img.onerror = finish
    img.src = `data:image/svg+xml;base64,${btoa(TEMPLATE_SVGS[templateId])}`
  })
}

const toolButtonClass = (active: boolean) =>
  `rounded-full px-4 py-2 text-sm font-bold transition-colors ${
    active ? 'bg-primary text-primary-content' : 'text-ink/60 hover:bg-page'
  }`

export default function PictureBookMaker() {
  const t = useTranslations('PictureBook')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<Point | null>(null)
  const historyRef = useRef<string[]>([])

  const [pages, setPages] = useState<string[]>([])
  const [captions, setCaptions] = useState<string[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [tool, setTool] = useState<Tool>('pencil')
  const [color, setColor] = useState(COLORS[0])
  const [turnDir, setTurnDir] = useState<'next' | 'prev'>('next')
  const [downloadBusy, setDownloadBusy] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  // Canvas needs the DOM, so the first blank page is created client-side only.
  useEffect(() => {
    setPages([blankPageDataUrl()])
    setCaptions([''])
  }, [])

  // Redraw the visible canvas whenever the active page's stored image changes
  // (a fresh blank page, or navigating to a different one).
  useEffect(() => {
    const canvas = canvasRef.current
    const src = pages[pageIndex]
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !src) return
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = src
    historyRef.current = []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pages[pageIndex]])

  function saveCurrentPage(): string[] {
    const canvas = canvasRef.current
    if (!canvas) return pages
    const snapshot = canvas.toDataURL('image/png')
    const next = [...pages]
    next[pageIndex] = snapshot
    setPages(next)
    return next
  }

  function pushHistory() {
    const canvas = canvasRef.current
    if (!canvas) return
    historyRef.current = [...historyRef.current.slice(-19), canvas.toDataURL('image/png')]
  }

  function getPos(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  function strokeSegment(from: Point, to: Point) {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.globalAlpha = 1
      ctx.lineWidth = 34
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
      return
    }

    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = color

    if (tool === 'crayon') {
      ctx.globalAlpha = 0.55
      ctx.lineWidth = 16
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
      // A second, slightly offset pass gives the stroke a waxy, uneven edge.
      ctx.globalAlpha = 0.35
      ctx.lineWidth = 10
      ctx.beginPath()
      ctx.moveTo(from.x + 1.5, from.y - 1.5)
      ctx.lineTo(to.x + 1.5, to.y - 1.5)
      ctx.stroke()
    } else {
      ctx.globalAlpha = 1
      ctx.lineWidth = 3.5
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    canvasRef.current?.setPointerCapture(e.pointerId)
    pushHistory()
    drawingRef.current = true
    const p = getPos(e)
    lastPointRef.current = p
    strokeSegment(p, { x: p.x + 0.01, y: p.y + 0.01 })
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    const p = getPos(e)
    strokeSegment(lastPointRef.current ?? p, p)
    lastPointRef.current = p
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    drawingRef.current = false
    lastPointRef.current = null
    canvasRef.current?.releasePointerCapture(e.pointerId)
  }

  function handleUndo() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const prev = historyRef.current.pop()
    if (!canvas || !ctx || !prev) return
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
    }
    img.src = prev
  }

  function handleClearPage() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    pushHistory()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  function goPrev() {
    if (pageIndex === 0) return
    saveCurrentPage()
    setTurnDir('prev')
    setPageIndex((i) => i - 1)
  }

  function goNext() {
    if (pageIndex >= pages.length - 1) return
    saveCurrentPage()
    setTurnDir('next')
    setPageIndex((i) => i + 1)
  }

  async function addPage(templateId?: TemplateId) {
    if (pages.length >= MAX_PAGES) return
    const updated = saveCurrentPage()
    const blank = templateId ? await templatePageDataUrl(templateId) : blankPageDataUrl()
    setPages([...updated, blank])
    setCaptions((prev) => [...prev, ''])
    setTurnDir('next')
    setPageIndex(updated.length)
  }

  function removePage() {
    if (pages.length <= 1) return
    if (!confirm(t('deletePageConfirm'))) return
    const next = pages.filter((_, i) => i !== pageIndex)
    setPages(next)
    setCaptions((prev) => prev.filter((_, i) => i !== pageIndex))
    setPageIndex((i) => Math.min(i, next.length - 1))
  }

  function updateCaption(value: string) {
    setCaptions((prev) => {
      const next = [...prev]
      next[pageIndex] = value
      return next
    })
  }

  async function handleDownload() {
    if (downloadBusy || pages.length === 0) return
    setDownloadBusy(true)
    setDownloadError('')
    try {
      const updated = saveCurrentPage()
      const pagesHtml = updated
        .map((src, i) => {
          const caption = (captions[i] ?? '').trim()
          return `<div class="page"><img src="${src}" alt="">${caption ? `<p class="caption">${escapeHtml(caption)}</p>` : ''}</div>`
        })
        .join('')
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(t('downloadTitle'))}</title>
<style>
  @page { margin: 0; }
  html, body { margin: 0; }
  .page { width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; break-after: page; }
  .page:last-child { break-after: auto; }
  .page img { max-width: 92%; max-height: 82%; }
  .page .caption { margin: 0; max-width: 80%; text-align: center; font: 16pt/1.4 Georgia, "Times New Roman", serif; color: #1a1a1a; }
</style></head><body>${pagesHtml}</body></html>`
      await printHtml(html)
    } catch {
      setDownloadError(t('downloadError'))
    } finally {
      setDownloadBusy(false)
    }
  }

  return (
    <section id="picture-book" className="scroll-mt-[116px] px-4 py-16 sm:px-6 lg:scroll-mt-20">
      <div className="relative mx-auto max-w-3xl rounded-3xl border-2 border-ink/10 bg-white/60 p-6 shadow-sm sm:p-10">
        <Sticker emoji="🖍️" className="-top-2 -right-2 rotate-12 sm:-top-4 sm:-right-4" />
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">{t('title')} 🎨</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/70">{t('intro')}</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <div className="flex items-center gap-1 rounded-full border-2 border-ink/10 bg-white p-1">
            <button type="button" onClick={() => setTool('pencil')} aria-pressed={tool === 'pencil'} className={toolButtonClass(tool === 'pencil')}>
              ✏️ {t('pencil')}
            </button>
            <button type="button" onClick={() => setTool('crayon')} aria-pressed={tool === 'crayon'} className={toolButtonClass(tool === 'crayon')}>
              🖍️ {t('crayon')}
            </button>
            <button type="button" onClick={() => setTool('eraser')} aria-pressed={tool === 'eraser'} className={toolButtonClass(tool === 'eraser')}>
              🧽 {t('eraser')}
            </button>
          </div>
          <button
            type="button"
            onClick={handleUndo}
            className="rounded-full border-2 border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink/70 transition-colors hover:bg-page"
          >
            ↩️ {t('undo')}
          </button>
          <button
            type="button"
            onClick={handleClearPage}
            className="rounded-full border-2 border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink/70 transition-colors hover:bg-page"
          >
            🗑️ {t('clearPage')}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={c}
              aria-pressed={color === c}
              className={`h-8 w-8 shrink-0 rounded-full border-2 transition-transform hover:scale-110 ${
                color === c ? 'scale-110 border-ink' : 'border-ink/15'
              }`}
              style={{ background: c }}
            />
          ))}
        </div>

        {pages.length > 0 && (
          <>
            <div className="mt-6 flex items-center justify-center gap-2" style={{ perspective: '1400px' }}>
              <button
                type="button"
                onClick={goPrev}
                disabled={pageIndex === 0}
                aria-label={t('prevPage')}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink/15 bg-white text-lg font-bold text-ink disabled:opacity-30"
              >
                ‹
              </button>

              <div
                key={pageIndex}
                className={`relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border-2 border-ink/15 bg-white shadow-md ${
                  turnDir === 'prev' ? 'animate-page-turn-prev' : 'animate-page-turn-next'
                }`}
                style={{ transformOrigin: 'left center' }}
              >
                <canvas
                  ref={canvasRef}
                  width={CANVAS_W}
                  height={CANVAS_H}
                  className="h-full w-full touch-none"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                />
              </div>

              <button
                type="button"
                onClick={goNext}
                disabled={pageIndex >= pages.length - 1}
                aria-label={t('nextPage')}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink/15 bg-white text-lg font-bold text-ink disabled:opacity-30"
              >
                ›
              </button>
            </div>

            <p className="mt-3 text-center text-sm font-semibold text-ink/60">
              {t('pageCount', { current: pageIndex + 1, total: pages.length })}
            </p>

            <div className="mx-auto mt-3 max-w-sm">
              <input
                value={captions[pageIndex] ?? ''}
                onChange={(e) => updateCaption(e.target.value)}
                placeholder={t('captionPlaceholder')}
                className="w-full rounded-2xl border-2 border-ink/15 bg-white/80 px-4 py-2.5 text-center text-ink placeholder:text-ink/40 focus:border-primary/50"
              />
            </div>

            <p className="mt-4 text-center text-xs font-bold uppercase tracking-wide text-ink/40">
              {t('addPageLabel')}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => void addPage()}
                disabled={pages.length >= MAX_PAGES}
                className="rounded-full border-2 border-primary/40 bg-white px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ➕ {t('addPage')}
              </button>
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => void addPage(template.id)}
                  disabled={pages.length >= MAX_PAGES}
                  className="rounded-full border-2 border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink/70 transition-colors hover:bg-page disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {template.emoji} {t(`template.${template.id}`)}
                </button>
              ))}
              <button
                type="button"
                onClick={removePage}
                disabled={pages.length <= 1}
                className="rounded-full border-2 border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink/70 transition-colors hover:bg-page disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('removePage')}
              </button>
            </div>
          </>
        )}

        <div className="mt-6 flex flex-col items-center gap-2 border-t-2 border-ink/10 pt-6">
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={downloadBusy || pages.length === 0}
            className="rounded-full bg-accent px-8 py-3.5 text-lg font-extrabold text-accent-content shadow-md transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloadBusy ? t('downloading') : `📖 ${t('download')}`}
          </button>
          {downloadError && <p className="text-sm font-semibold text-red-600">{downloadError}</p>}
        </div>
      </div>
    </section>
  )
}
