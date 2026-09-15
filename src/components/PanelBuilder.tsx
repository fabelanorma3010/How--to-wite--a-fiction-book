'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { getBookFormatTheme, textureOverlayStyle } from '../data/bookFormatThemes'
import type { BookFormat } from '../lib/books'
import { createClient } from '../lib/supabase/client'
import { encodeCaptionList, type CaptionType } from '../lib/captionType'
import { rasterizePdfFirstPage, rasterizePdfPages } from '../lib/pdfToImage'
import { downloadBookAsPdf } from '../lib/downloadBookPdf'
import { isVideoUrl } from '../lib/isVideoUrl'
import DictateButton from './DictateButton'
import ReadAloud from './ReadAloud'

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
const ACCEPTED_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime']
const ACCEPTED_UPLOAD = [...ACCEPTED_IMAGE, PDF_TYPE, ...ACCEPTED_VIDEO]
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 50 * 1024 * 1024
const MAX_PAGES = 30

const ACCEPTED_AUDIO_PREFIXES = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/mp4', 'audio/ogg', 'audio/aac', 'audio/x-m4a']
const ACCEPTED_AUDIO_ACCEPT = ACCEPTED_AUDIO_PREFIXES.join(',')
const MAX_AUDIO_BYTES = 15 * 1024 * 1024
const MAX_RECORDING_MS = 5 * 60 * 1000

function isAcceptedAudioType(type: string): boolean {
  return ACCEPTED_AUDIO_PREFIXES.some((prefix) => type === prefix || type.startsWith(`${prefix};`))
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

const MIN_FONT_SIZE = 13
const MAX_FONT_SIZE = 50
const DEFAULT_FONT_SIZE = 16

// Panel art (picture or video) fills its cell via object-cover, cropping
// whichever dimension overflows — a panel-shaped picture doesn't notice, but
// a mismatched video (a phone's landscape clip in a portrait panel, say)
// otherwise has no way to be seen in full: 1 was already "filling the cell,"
// so the slider could only crop tighter, never back out to reveal the rest.
const MIN_IMAGE_ZOOM = 0.4
const MAX_IMAGE_ZOOM = 3
const DEFAULT_IMAGE_ZOOM = 1
const MAX_IMAGE_OFFSET = 45

function clampImageOffset(value: number): number {
  return Math.max(-MAX_IMAGE_OFFSET, Math.min(MAX_IMAGE_OFFSET, value))
}

// A text bubble may be dragged up to this fraction of its own panel's
// rendered width/height away from its default position — the panel's
// overflow-hidden clips anything further, so this is what "all the way to
// the edge" actually means, and it scales with however big that panel is.
const TEXT_OFFSET_RANGE_RATIO = 0.9
// Fallback for the rare case a panel's size can't be measured yet.
const FALLBACK_TEXT_OFFSET_BASIS = 180

function clampTextOffset(value: number, basis: number): number {
  const max = basis * TEXT_OFFSET_RANGE_RATIO
  return Math.max(-max, Math.min(max, value))
}

const MIN_TEXT_HEIGHT = 44
const MAX_TEXT_HEIGHT = 420
const DEFAULT_TEXT_HEIGHT = 66

function clampTextHeight(value: number): number {
  return Math.max(MIN_TEXT_HEIGHT, Math.min(MAX_TEXT_HEIGHT, value))
}

const EXPORT_VIDEO_W = 1350
const EXPORT_VIDEO_H = 1800
const EXPORT_VIDEO_FPS = 10
const EXPORT_VIDEO_BITRATE = 8_000_000
const IMAGE_PAGE_SECONDS = 2.5
const MAX_VIDEO_PANEL_SECONDS = 8

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

/**
 * Panel art/video lives on Supabase Storage — a different origin from the
 * app — and drawing a cross-origin resource onto a canvas taints it unless
 * the server sends CORS headers permitting it, which Storage doesn't
 * guarantee. Routing it through our own /api/proxy-media route instead makes
 * it same-origin, so the exported video's canvas capture never comes out
 * blank. A data: URL (e.g. an AI-generated image) needs no proxying.
 */
function exportableSrc(src: string): string {
  if (src.startsWith('data:')) return src
  return `/api/proxy-media?url=${encodeURIComponent(src)}`
}

type PreloadedPage = { kind: 'image'; el: HTMLImageElement } | { kind: 'video'; el: HTMLVideoElement } | { kind: 'failed' }

/**
 * Fully loads one page's media (network-bound — through the proxy, possibly
 * a cold serverless start) before recording ever starts. Doing this loading
 * *during* the recording instead — as an earlier version did — let a slow
 * first fetch eat into that page's on-screen time, so it came out blank in
 * the exported video even though the page itself was fine.
 */
function preloadExportPage(src: string): Promise<PreloadedPage> {
  return new Promise((resolve) => {
    if (isVideoUrl(src)) {
      const el = document.createElement('video')
      el.muted = true
      el.playsInline = true
      el.preload = 'auto'
      el.onloadeddata = () => resolve({ kind: 'video', el })
      el.onerror = () => resolve({ kind: 'failed' })
      el.src = exportableSrc(src)
      return
    }
    const el = new Image()
    el.onload = () => resolve({ kind: 'image', el })
    el.onerror = () => resolve({ kind: 'failed' })
    el.src = exportableSrc(src)
  })
}

interface PageFraming {
  zoom: number
  offsetX: number
  offsetY: number
}

const DEFAULT_PAGE_FRAMING: PageFraming = { zoom: 1, offsetX: 0, offsetY: 0 }

/**
 * Fills the whole export frame with the media, cropping instead of
 * letterboxing — a plain "contain" fit left large white bars around any
 * picture that didn't already match the export's portrait shape, which is
 * the normal case since AI-generated art comes out square. Zoom/offset
 * mirror the same crop the panel preview shows in the editor (applied via
 * CSS transform there, replicated here in canvas-drawing terms), so the
 * export matches what was framed on screen.
 */
function drawContained(
  ctx: CanvasRenderingContext2D,
  media: HTMLImageElement | HTMLVideoElement,
  framing: PageFraming = DEFAULT_PAGE_FRAMING,
) {
  const mediaW = media instanceof HTMLVideoElement ? media.videoWidth : media.width
  const mediaH = media instanceof HTMLVideoElement ? media.videoHeight : media.height
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, EXPORT_VIDEO_W, EXPORT_VIDEO_H)
  const scale = Math.max(EXPORT_VIDEO_W / mediaW, EXPORT_VIDEO_H / mediaH) * framing.zoom
  const w = mediaW * scale
  const h = mediaH * scale
  const x = (EXPORT_VIDEO_W - w) / 2 + (framing.offsetX / 100) * EXPORT_VIDEO_W
  const y = (EXPORT_VIDEO_H - h) / 2 + (framing.offsetY / 100) * EXPORT_VIDEO_H
  ctx.drawImage(media, x, y, w, h)
}

/**
 * `canvas.captureStream()` only samples a new frame when the canvas actually
 * repaints — a single draw followed by an idle wait does not reliably
 * produce a full, correctly-ordered `IMAGE_PAGE_SECONDS` of recorded output
 * (verified live: a two-page export came out truncated to one page's worth
 * of duration with the pages' content scrambled). Keep repainting the same
 * frame on an interval for the whole hold, the same way video pages stay
 * correct via their requestAnimationFrame redraw loop.
 */
function holdStaticFrame(draw: () => void, seconds: number = IMAGE_PAGE_SECONDS): Promise<void> {
  draw()
  const interval = window.setInterval(draw, 100)
  return wait(seconds * 1000).then(() => window.clearInterval(interval))
}

/**
 * Renders one already-loaded page into the export canvas and resolves once
 * its on-screen time is up. `minSeconds` — a page's own recorded voiceover
 * duration, if any — stretches that time so the narration isn't cut off
 * partway through: an image page normally holds for IMAGE_PAGE_SECONDS, and
 * a video page normally plays for its own length (capped at
 * MAX_VIDEO_PANEL_SECONDS), but either extends to fit a longer voiceover.
 */
function renderExportPage(
  ctx: CanvasRenderingContext2D,
  page: PreloadedPage,
  framing: PageFraming,
  minSeconds = 0,
): Promise<void> {
  if (page.kind === 'failed') {
    return holdStaticFrame(() => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, EXPORT_VIDEO_W, EXPORT_VIDEO_H)
    }, Math.max(IMAGE_PAGE_SECONDS, minSeconds))
  }
  if (page.kind === 'image') {
    return holdStaticFrame(() => drawContained(ctx, page.el, framing), Math.max(IMAGE_PAGE_SECONDS, minSeconds))
  }

  const videoEl = page.el
  return new Promise((resolve) => {
    let raf = 0
    let done = false
    const finish = () => {
      if (done) return
      done = true
      window.cancelAnimationFrame(raf)
      videoEl.pause()
      resolve()
    }
    const draw = () => {
      if (done) return
      drawContained(ctx, videoEl, framing)
      raf = window.requestAnimationFrame(draw)
    }
    const seconds = Math.max(Math.min(videoEl.duration || MAX_VIDEO_PANEL_SECONDS, MAX_VIDEO_PANEL_SECONDS), minSeconds)
    videoEl.currentTime = 0
    videoEl
      .play()
      .then(() => {
        draw()
        window.setTimeout(finish, seconds * 1000)
      })
      .catch(finish)
  })
}

/**
 * Preloads one page's voiceover, same rationale as preloadExportPage: fully
 * fetched before recording starts, and proxied same-origin so capturing it
 * into the recorded stream doesn't get silently muted as tainted
 * cross-origin media.
 */
function preloadExportAudio(src: string): Promise<HTMLAudioElement | null> {
  if (!src) return Promise.resolve(null)
  return new Promise((resolve) => {
    const el = new Audio()
    el.preload = 'auto'
    el.onloadedmetadata = () => resolve(el)
    el.onerror = () => resolve(null)
    el.src = exportableSrc(src)
  })
}

interface TextBubble {
  id: string
  type: CaptionType
  text: string
  fontSize?: number
  // In pixels, not a percentage like the image offsets below — a text
  // bubble is much smaller than its panel, so a plain CSS translate(%)
  // on the bubble itself (relative to the bubble's own tiny size) would
  // barely move it. Pixels track the drag 1:1 regardless of bubble size.
  offsetX?: number
  offsetY?: number
  // Pixels, like the offsets above. Native CSS textarea resize handles
  // barely work with touch, so the box's height is dragged by hand instead
  // (see the grip below the text) and stored explicitly.
  height?: number
}

interface PanelState {
  image?: string
  audio?: string
  imageZoom?: number
  imageOffsetX?: number
  imageOffsetY?: number
  // A panel can hold any number of bubbles now, each independently placed,
  // sized, and removable — see addTextBox/updateTextBox/removeTextBox.
  textBoxes?: TextBubble[]
}
interface PageSticker {
  id: string
  src: string
  x: number
  y: number
  size: number
}
interface PageState {
  layout: LayoutKey
  panels: PanelState[]
  stickers: PageSticker[]
}

function makePage(layout: LayoutKey): PageState {
  return { layout, panels: Array.from({ length: LAYOUTS[layout].count }, () => ({ textBoxes: [] })), stickers: [] }
}

// A single legacy bubble, as every panel used to store it before a panel
// could hold more than one — read only by migratePanelTextBoxes below.
interface LegacyPanelTextFields {
  textType?: CaptionType
  text?: string
  fontSize?: number
  textOffsetX?: number
  textOffsetY?: number
  textHeight?: number
}

// A panel saved before textBoxes existed carries its one bubble in those
// singular fields instead — fold it into a single-item textBoxes array so
// reopening an old draft doesn't make that text disappear.
function migratePanelTextBoxes(panel: PanelState & LegacyPanelTextFields): PanelState {
  if (panel.textBoxes) return panel
  const { textType, text, fontSize, textOffsetX, textOffsetY, textHeight, ...rest } = panel
  if (!textType && !text) return { ...rest, textBoxes: [] }
  return {
    ...rest,
    textBoxes: [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: textType ?? 'speech',
        text: text ?? '',
        fontSize,
        offsetX: textOffsetX,
        offsetY: textOffsetY,
        height: textHeight,
      },
    ],
  }
}

// A draft saved to IndexedDB before the stickers field (or the textBoxes
// array) existed doesn't have them in the new shape — restoring it as-is
// crashes every reader that assumes them. Backfill/migrate once, right
// where old data re-enters state, instead of guarding every call site.
function normalizeDraftPages(pagesByStyle: Record<BuilderStyle, PageState[]>): Record<BuilderStyle, PageState[]> {
  const result = {} as Record<BuilderStyle, PageState[]>
  for (const key of Object.keys(pagesByStyle) as BuilderStyle[]) {
    result[key] = pagesByStyle[key].map((page) => ({
      ...page,
      stickers: page.stickers ?? [],
      panels: page.panels.map(migratePanelTextBoxes),
    }))
  }
  return result
}

const DEFAULT_STICKER_SIZE = 22
const MIN_STICKER_SIZE = 8
const MAX_STICKER_SIZE = 100
const MAX_STICKERS_PER_PAGE = 12

// A small ready-made gallery so adding a sticker doesn't always mean saving
// a picture somewhere first and then hunting for it in a file picker — tap
// one of these and it's on the page immediately. "Upload a picture" (below)
// still covers anything of your own.
const PRESET_STICKERS: { id: string; src: string; labelKey: string }[] = [
  { id: 'whistle', src: '/stickers/whistle.png', labelKey: 'stickerPreset.whistle' },
  { id: 'music-notes', src: '/stickers/music-notes.png', labelKey: 'stickerPreset.musicNotes' },
  { id: 'heart', src: '/stickers/heart.png', labelKey: 'stickerPreset.heart' },
  { id: 'crown', src: '/stickers/crown.png', labelKey: 'stickerPreset.crown' },
  { id: 'flower', src: '/stickers/flower.png', labelKey: 'stickerPreset.flower' },
]

function clampStickerSize(value: number): number {
  return Math.max(MIN_STICKER_SIZE, Math.min(MAX_STICKER_SIZE, value))
}

function clampStickerPos(value: number): number {
  return Math.max(0, Math.min(100, value))
}

// A generous ceiling, not a real-world target — it exists only to keep a
// panel from growing unbounded, the same way stickers are capped per page.
const MAX_TEXT_BOXES_PER_PANEL = 20

// Every bubble type anchors near the same spot by default, so a freshly
// added bubble would otherwise land exactly on top of the last one — buried,
// untappable, until someone thought to drag the one on top out of the way.
// These fan the first few bubbles out into visibly different corners; after
// that it wraps and some overlap is expected (a panel with that many bubbles
// already needs manual arranging).
const TEXT_BOX_CASCADE: Array<{ x: number; y: number }> = [
  { x: 0, y: 0 },
  { x: 70, y: 10 },
  { x: 10, y: 90 },
  { x: 80, y: 100 },
]

/**
 * Zoom/position adjust how a panel's picture is framed inside its own small
 * grid cell here in the editor. The video export replicates the same crop
 * in canvas-drawing terms (see drawContained/PageFraming above); the PDF
 * download and the published reader still show the whole picture uncropped.
 */
function panelImageStyle(panel: PanelState): React.CSSProperties {
  const zoom = panel.imageZoom ?? DEFAULT_IMAGE_ZOOM
  const x = panel.imageOffsetX ?? 0
  const y = panel.imageOffsetY ?? 0
  if (zoom === DEFAULT_IMAGE_ZOOM && x === 0 && y === 0) return {}
  return { transform: `scale(${zoom}) translate(${x}%, ${y}%)` }
}

const DRAFT_DB_NAME = 'storyburst-book-panel'
const DRAFT_STORE = 'drafts'
const DRAFT_KEY = 'current'

interface SavedDraft {
  style: BuilderStyle
  pagesByStyle: Record<BuilderStyle, PageState[]>
}

function draftPersistenceSupported(): boolean {
  return typeof indexedDB !== 'undefined'
}

function openDraftDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!draftPersistenceSupported()) {
      reject(new Error('IndexedDB unavailable'))
      return
    }
    const req = indexedDB.open(DRAFT_DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(DRAFT_STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// A book in progress can hold several freshly AI-generated images as raw
// data: URLs (not yet uploaded to Storage) — easily tens of megabytes across
// a whole book, well past what localStorage allows. IndexedDB has no such
// practical limit, so drafts live there instead.
async function saveDraftToDb(draft: SavedDraft): Promise<void> {
  const db = await openDraftDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DRAFT_STORE, 'readwrite')
    tx.objectStore(DRAFT_STORE).put(draft, DRAFT_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

async function loadDraftFromDb(): Promise<SavedDraft | undefined> {
  const db = await openDraftDb()
  const draft = await new Promise<SavedDraft | undefined>((resolve, reject) => {
    const tx = db.transaction(DRAFT_STORE, 'readonly')
    const req = tx.objectStore(DRAFT_STORE).get(DRAFT_KEY)
    req.onsuccess = () => resolve(req.result as SavedDraft | undefined)
    req.onerror = () => reject(req.error)
  })
  db.close()
  return draft
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
  const [importingPdf, setImportingPdf] = useState(false)
  const [importError, setImportError] = useState('')
  const [audioBusy, setAudioBusy] = useState(false)
  const [audioError, setAudioError] = useState('')
  const [recording, setRecording] = useState(false)
  const audioRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])

  const [userId, setUserId] = useState<string | null>(null)
  const [books, setBooks] = useState<PlannerBook[] | null>(null)
  const [selectedBookId, setSelectedBookId] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [publishedBookId, setPublishedBookId] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const [videoBusy, setVideoBusy] = useState(false)
  const [videoError, setVideoError] = useState('')
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved' | 'restored' | 'error'>('idle')
  const draftLoadedRef = useRef(false)
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null)
  const [stickerError, setStickerError] = useState('')
  const [selectedTextBox, setSelectedTextBox] = useState<string | null>(null)
  const [textBoxError, setTextBoxError] = useState('')
  const pageStageRef = useRef<HTMLDivElement | null>(null)

  // Tracks an in-progress drag-to-reposition on a panel's image, so a plain
  // tap can still select/deselect the panel while a real drag doesn't.
  const imageDragRef = useRef<{
    panelIndex: number
    pointerId: number
    startX: number
    startY: number
    startOffsetX: number
    startOffsetY: number
    boxWidth: number
    boxHeight: number
    canDrag: boolean
    moved: boolean
  } | null>(null)

  // Same idea, for dragging a sticker freely around the whole page.
  const stickerDragRef = useRef<{
    stickerId: string
    pointerId: number
    startX: number
    startY: number
    startPosX: number
    startPosY: number
    boxWidth: number
    boxHeight: number
    moved: boolean
  } | null>(null)

  // Same idea again, for dragging one of a panel's bubbles around inside
  // that panel — a panel can hold several now, so this tracks which one
  // (by id) alongside which panel it lives on.
  const textDragRef = useRef<{
    panelIndex: number
    id: string
    pointerId: number
    startX: number
    startY: number
    startOffsetX: number
    startOffsetY: number
    boxWidth: number
    boxHeight: number
    moved: boolean
  } | null>(null)

  // And once more, for dragging the grip below a bubble to make it taller
  // or shorter by hand — a plain CSS resize handle barely works with touch,
  // so this tracks the gesture itself instead.
  const textHeightDragRef = useRef<{
    panelIndex: number
    id: string
    pointerId: number
    startY: number
    startHeight: number
  } | null>(null)

  const theme = getBookFormatTheme(STYLE_TO_FORMAT[style])
  const rtl = STYLE_RTL[style]
  const pages = pagesByStyle[style]
  const currentPage = pages[pageIndex]
  const cells = layoutCells(currentPage.layout)
  const currentPanel = selectedPanel !== null ? currentPage.panels[selectedPanel] : undefined
  const currentSticker = selectedSticker ? currentPage.stickers.find((s) => s.id === selectedSticker) : undefined
  const currentTextBox = selectedTextBox ? currentPanel?.textBoxes?.find((b) => b.id === selectedTextBox) : undefined
  const currentPageIsBlank =
    currentPage.stickers.length === 0 &&
    currentPage.panels.every((p) => !p.image && !p.audio && (p.textBoxes?.length ?? 0) === 0)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  // The header's "Book Panel" tab lands on this page directly, but old
  // links/bookmarks may still point at these two anchors — honor them by
  // picking the matching style so they still land on the right tool.
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash === 'manga-planner') setStyle('manga')
    else if (hash === 'comic-planner') setStyle('comic')
  }, [])

  // Pick up any work left over from a previous visit before autosave can run,
  // so a restart doesn't silently overwrite a real draft with a fresh blank one.
  useEffect(() => {
    loadDraftFromDb()
      .then((draft) => {
        if (draft) {
          setPagesByStyle(normalizeDraftPages(draft.pagesByStyle))
          setStyle(draft.style)
          setDraftStatus('restored')
        }
      })
      .catch(() => {})
      .finally(() => {
        draftLoadedRef.current = true
      })
  }, [])

  // Quietly keep the draft up to date as the book changes, so closing the tab
  // or a refresh never loses more than a few seconds of work.
  useEffect(() => {
    if (!draftLoadedRef.current || !draftPersistenceSupported()) return
    const id = window.setTimeout(() => {
      setDraftStatus('saving')
      saveDraftToDb({ style, pagesByStyle })
        .then(() => setDraftStatus('saved'))
        .catch(() => setDraftStatus('error'))
    }, 1200)
    return () => window.clearTimeout(id)
  }, [style, pagesByStyle])

  async function handleSaveDraft() {
    setDraftStatus('saving')
    try {
      await saveDraftToDb({ style, pagesByStyle })
      setDraftStatus('saved')
    } catch {
      setDraftStatus('error')
    }
  }

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

  // Same update, but for a change expensive enough to be worth never losing
  // (a finished image/video/audio upload) — the regular autosave effect below
  // waits for 1200ms of quiet before writing to IndexedDB, so a refresh or
  // closed tab in that window right after an upload finishes would silently
  // lose it, making a just-added file look like it never stuck. This writes
  // the very next state immediately instead of waiting on that debounce.
  function updatePanelAndSaveNow(panelIndex: number, patch: Partial<PanelState>) {
    setPagesByStyle((prev) => {
      const pageList = [...prev[style]]
      const panels = [...pageList[pageIndex].panels]
      panels[panelIndex] = { ...panels[panelIndex], ...patch }
      pageList[pageIndex] = { ...pageList[pageIndex], panels }
      const next = { ...prev, [style]: pageList }
      if (draftLoadedRef.current && draftPersistenceSupported()) {
        setDraftStatus('saving')
        saveDraftToDb({ style, pagesByStyle: next })
          .then(() => setDraftStatus('saved'))
          .catch(() => setDraftStatus('error'))
      }
      return next
    })
  }

  // A tap still selects/deselects a panel, but a real drag on an already
  // selected panel's picture repositions it instead — distinguished by
  // whether the pointer moved past a small threshold before release.
  function handlePanelPointerDown(e: React.PointerEvent<HTMLDivElement>, panelIndex: number, panel: PanelState) {
    const box = e.currentTarget.getBoundingClientRect()
    imageDragRef.current = {
      panelIndex,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: panel.imageOffsetX ?? 0,
      startOffsetY: panel.imageOffsetY ?? 0,
      boxWidth: box.width,
      boxHeight: box.height,
      canDrag: selectedPanel === panelIndex && !!panel.image,
      moved: false,
    }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  function handlePanelPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = imageDragRef.current
    if (!drag || drag.pointerId !== e.pointerId || !drag.canDrag) return
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY
    if (!drag.moved && Math.hypot(dx, dy) < 4) return
    drag.moved = true
    updatePanel(drag.panelIndex, {
      imageOffsetX: clampImageOffset(drag.startOffsetX + (dx / drag.boxWidth) * 100),
      imageOffsetY: clampImageOffset(drag.startOffsetY + (dy / drag.boxHeight) * 100),
    })
  }

  function handlePanelPointerUp(e: React.PointerEvent<HTMLDivElement>, panelIndex: number) {
    const drag = imageDragRef.current
    imageDragRef.current = null
    if (!drag || drag.pointerId !== e.pointerId) return
    if (!drag.moved) {
      setSelectedPanel(selectedPanel === panelIndex ? null : panelIndex)
    }
  }

  function updateSticker(id: string, patch: Partial<PageSticker>) {
    setPagesByStyle((prev) => {
      const pageList = [...prev[style]]
      const stickers = pageList[pageIndex].stickers.map((s) => (s.id === id ? { ...s, ...patch } : s))
      pageList[pageIndex] = { ...pageList[pageIndex], stickers }
      return { ...prev, [style]: pageList }
    })
  }

  function removeSticker(id: string) {
    setPagesByStyle((prev) => {
      const pageList = [...prev[style]]
      pageList[pageIndex] = {
        ...pageList[pageIndex],
        stickers: pageList[pageIndex].stickers.filter((s) => s.id !== id),
      }
      return { ...prev, [style]: pageList }
    })
    setSelectedSticker(null)
  }

  async function handleAddSticker(file: File) {
    setStickerError('')
    if (currentPage.stickers.length >= MAX_STICKERS_PER_PAGE) {
      setStickerError(t('tooManyStickers'))
      return
    }
    if (!ACCEPTED_IMAGE.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
      setStickerError(t('imageFileError'))
      return
    }
    const src = await readFileAsDataUrl(file)
    const sticker: PageSticker = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, src, x: 50, y: 50, size: DEFAULT_STICKER_SIZE }
    setPagesByStyle((prev) => {
      const pageList = [...prev[style]]
      pageList[pageIndex] = { ...pageList[pageIndex], stickers: [...pageList[pageIndex].stickers, sticker] }
      return { ...prev, [style]: pageList }
    })
    setSelectedSticker(sticker.id)
  }

  function addPresetSticker(src: string) {
    setStickerError('')
    if (currentPage.stickers.length >= MAX_STICKERS_PER_PAGE) {
      setStickerError(t('tooManyStickers'))
      return
    }
    const sticker: PageSticker = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, src, x: 50, y: 50, size: DEFAULT_STICKER_SIZE }
    setPagesByStyle((prev) => {
      const pageList = [...prev[style]]
      pageList[pageIndex] = { ...pageList[pageIndex], stickers: [...pageList[pageIndex].stickers, sticker] }
      return { ...prev, [style]: pageList }
    })
    setSelectedSticker(sticker.id)
  }

  // Same tap-vs-drag distinction as panel images, but positioning is relative
  // to the whole page stage instead of a single panel.
  function handleStickerPointerDown(e: React.PointerEvent<HTMLImageElement>, sticker: PageSticker) {
    const box = pageStageRef.current?.getBoundingClientRect()
    if (!box) return
    stickerDragRef.current = {
      stickerId: sticker.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: sticker.x,
      startPosY: sticker.y,
      boxWidth: box.width,
      boxHeight: box.height,
      moved: false,
    }
    e.currentTarget.setPointerCapture?.(e.pointerId)
    e.stopPropagation()
  }

  function handleStickerPointerMove(e: React.PointerEvent<HTMLImageElement>) {
    const drag = stickerDragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY
    if (!drag.moved && Math.hypot(dx, dy) < 4) return
    drag.moved = true
    updateSticker(drag.stickerId, {
      x: clampStickerPos(drag.startPosX + (dx / drag.boxWidth) * 100),
      y: clampStickerPos(drag.startPosY + (dy / drag.boxHeight) * 100),
    })
  }

  function handleStickerPointerUp(e: React.PointerEvent<HTMLImageElement>, id: string) {
    const drag = stickerDragRef.current
    stickerDragRef.current = null
    if (!drag || drag.pointerId !== e.pointerId) return
    if (!drag.moved) {
      setSelectedSticker(selectedSticker === id ? null : id)
    }
  }

  function addTextBox(panelIndex: number, type: CaptionType) {
    const existing = currentPage.panels[panelIndex].textBoxes ?? []
    if (existing.length >= MAX_TEXT_BOXES_PER_PANEL) {
      setTextBoxError(t('tooManyTextBoxes'))
      return
    }
    setTextBoxError('')
    const cascade = TEXT_BOX_CASCADE[existing.length % TEXT_BOX_CASCADE.length]
    // A caption bar already spans the panel's full width, anchored to the
    // bottom edge — shifting it sideways just clips it, and shifting it
    // *down* pushes it further off-panel instead of into view, so it only
    // cascades upward, off the bottom, never sideways.
    const bubble: TextBubble = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      text: '',
      offsetX: type === 'caption' ? 0 : cascade.x,
      offsetY: type === 'caption' ? -cascade.y : cascade.y,
    }
    setPagesByStyle((prev) => {
      const pageList = [...prev[style]]
      const panels = [...pageList[pageIndex].panels]
      panels[panelIndex] = { ...panels[panelIndex], textBoxes: [...(panels[panelIndex].textBoxes ?? []), bubble] }
      pageList[pageIndex] = { ...pageList[pageIndex], panels }
      return { ...prev, [style]: pageList }
    })
    setSelectedTextBox(bubble.id)
  }

  function updateTextBox(panelIndex: number, id: string, patch: Partial<TextBubble>) {
    setPagesByStyle((prev) => {
      const pageList = [...prev[style]]
      const panels = [...pageList[pageIndex].panels]
      const textBoxes = (panels[panelIndex].textBoxes ?? []).map((b) => (b.id === id ? { ...b, ...patch } : b))
      panels[panelIndex] = { ...panels[panelIndex], textBoxes }
      pageList[pageIndex] = { ...pageList[pageIndex], panels }
      return { ...prev, [style]: pageList }
    })
  }

  function removeTextBox(panelIndex: number, id: string) {
    setPagesByStyle((prev) => {
      const pageList = [...prev[style]]
      const panels = [...pageList[pageIndex].panels]
      panels[panelIndex] = { ...panels[panelIndex], textBoxes: (panels[panelIndex].textBoxes ?? []).filter((b) => b.id !== id) }
      pageList[pageIndex] = { ...pageList[pageIndex], panels }
      return { ...prev, [style]: pageList }
    })
    setSelectedTextBox(null)
  }

  // A text bubble's own padding/background already stops propagation before
  // the panel cell underneath sees the event (see TextBox below), so this
  // never fights the panel's own tap-to-select or image drag — it's a fully
  // separate gesture, tracked the same tap-vs-drag way as the others. A tap
  // (no movement) selects that one bubble, the same way tapping a sticker
  // does — a panel can hold several now, so which one is "current" has to
  // be tracked explicitly instead of there only ever being one to mean.
  function handleTextPointerDown(e: React.PointerEvent<HTMLDivElement>, panelIndex: number, bubble: TextBubble) {
    // The bubble's own panel cell is its DOM parent (see TextBox below) —
    // measuring that, not the bubble itself, is what lets the drag range
    // scale to however big this particular panel actually is.
    const box = e.currentTarget.parentElement?.getBoundingClientRect()
    textDragRef.current = {
      panelIndex,
      id: bubble.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: bubble.offsetX ?? 0,
      startOffsetY: bubble.offsetY ?? 0,
      boxWidth: box?.width || FALLBACK_TEXT_OFFSET_BASIS,
      boxHeight: box?.height || FALLBACK_TEXT_OFFSET_BASIS,
      moved: false,
    }
    e.currentTarget.setPointerCapture?.(e.pointerId)
    e.stopPropagation()
  }

  function handleTextPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = textDragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY
    if (!drag.moved && Math.hypot(dx, dy) < 4) return
    drag.moved = true
    updateTextBox(drag.panelIndex, drag.id, {
      offsetX: clampTextOffset(drag.startOffsetX + dx, drag.boxWidth),
      offsetY: clampTextOffset(drag.startOffsetY + dy, drag.boxHeight),
    })
  }

  function handleTextPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const drag = textDragRef.current
    textDragRef.current = null
    if (!drag || drag.pointerId !== e.pointerId) return
    e.stopPropagation()
    if (!drag.moved) {
      setSelectedPanel(drag.panelIndex)
      setSelectedTextBox(selectedTextBox === drag.id ? null : drag.id)
    }
  }

  // The little grip below a bubble — drag it down to make the box taller,
  // up to make it shorter. No tap-vs-drag distinction needed here: this
  // handle has no other purpose, so any press on it means resize.
  function handleTextHeightPointerDown(e: React.PointerEvent<HTMLDivElement>, panelIndex: number, bubble: TextBubble) {
    textHeightDragRef.current = {
      panelIndex,
      id: bubble.id,
      pointerId: e.pointerId,
      startY: e.clientY,
      startHeight: bubble.height ?? DEFAULT_TEXT_HEIGHT,
    }
    e.currentTarget.setPointerCapture?.(e.pointerId)
    e.stopPropagation()
  }

  function handleTextHeightPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = textHeightDragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    updateTextBox(drag.panelIndex, drag.id, { height: clampTextHeight(drag.startHeight + (e.clientY - drag.startY)) })
  }

  function handleTextHeightPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const drag = textHeightDragRef.current
    textHeightDragRef.current = null
    if (!drag || drag.pointerId !== e.pointerId) return
    e.stopPropagation()
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

  function insertPageBefore() {
    if (pages.length >= MAX_PAGES) return
    setPagesByStyle((prev) => {
      const pageList = [...prev[style]]
      pageList.splice(pageIndex, 0, makePage(currentPage.layout))
      return { ...prev, [style]: pageList }
    })
    setSelectedPanel(null)
  }

  function removeCurrentPage() {
    if (pages.length <= 1) return
    if (!confirm(t('deletePageConfirm'))) return
    const removedIndex = pageIndex
    setPagesByStyle((prev) => ({ ...prev, [style]: prev[style].filter((_, i) => i !== removedIndex) }))
    setPageIndex(Math.min(removedIndex, pages.length - 2))
    setSelectedPanel(null)
  }

  // Wipes every panel and sticker on this page back to blank, but keeps the
  // page itself in place (same layout, same spot in the book) — unlike
  // removeCurrentPage, which drops the page slot entirely.
  function clearCurrentPage() {
    if (!confirm(t('clearPageConfirm'))) return
    setPagesByStyle((prev) => {
      const pageList = [...prev[style]]
      pageList[pageIndex] = makePage(pageList[pageIndex].layout)
      return { ...prev, [style]: pageList }
    })
    setSelectedPanel(null)
    setSelectedSticker(null)
  }

  function movePage(direction: -1 | 1) {
    const targetIndex = pageIndex + direction
    if (targetIndex < 0 || targetIndex >= pages.length) return
    setPagesByStyle((prev) => {
      const pageList = [...prev[style]]
      ;[pageList[pageIndex], pageList[targetIndex]] = [pageList[targetIndex], pageList[pageIndex]]
      return { ...prev, [style]: pageList }
    })
    setTurnDir(direction === 1 ? 'next' : 'prev')
    setPageIndex(targetIndex)
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
    if (selectedPanel === null || convertingPdf) return
    setImageError('')
    if (!ACCEPTED_UPLOAD.includes(file.type)) {
      setImageError(t('imageFileError'))
      return
    }

    // Anyone can add a plain photo without an account — it's kept as a data:
    // URL in the browser rather than uploaded to Storage, which needs a
    // signed-in owner. PDFs (need server-side rasterizing) and video (large
    // enough to bloat a published page as inline data) still need sign-in.
    if (!userId) {
      if (!ACCEPTED_IMAGE.includes(file.type)) {
        setImageError(t('signInForUpload'))
        return
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setImageError(t('imageFileError'))
        return
      }
      const dataUrl = await readFileAsDataUrl(file)
      updatePanel(selectedPanel, { image: dataUrl })
      return
    }

    const isVideo = ACCEPTED_VIDEO.includes(file.type)
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

    if (uploadFile.size > (isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES)) {
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
    updatePanelAndSaveNow(selectedPanel, { image: url })
  }

  async function uploadAudioFile(file: File) {
    if (selectedPanel === null || !userId) return
    const supabase = createClient()
    if (!supabase) return
    setAudioBusy(true)
    try {
      const ext = file.name.split('.').pop() || 'webm'
      const path = `${userId}/builder-${style}-${pageIndex}-${selectedPanel}-audio-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('books')
        .upload(path, file, { contentType: file.type })
      if (uploadError) {
        setAudioError(uploadError.message)
        return
      }
      const url = supabase.storage.from('books').getPublicUrl(path).data.publicUrl
      updatePanelAndSaveNow(selectedPanel, { audio: url })
    } finally {
      setAudioBusy(false)
    }
  }

  async function handleUploadAudio(file: File) {
    if (selectedPanel === null || !userId || recording) return
    setAudioError('')
    if (!isAcceptedAudioType(file.type) || file.size > MAX_AUDIO_BYTES) {
      setAudioError(t('audioFileError'))
      return
    }
    await uploadAudioFile(file)
  }

  async function startRecording() {
    if (selectedPanel === null || !userId || recording) return
    setAudioError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioChunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        const mimeType = recorder.mimeType || 'audio/webm'
        const blob = new Blob(audioChunksRef.current, { type: mimeType })
        const ext = mimeType.split('/')[1]?.split(';')[0] || 'webm'
        void uploadAudioFile(new File([blob], `voiceover-${Date.now()}.${ext}`, { type: mimeType }))
      }
      audioRecorderRef.current = recorder
      recorder.start()
      setRecording(true)
      window.setTimeout(() => {
        if (audioRecorderRef.current === recorder && recorder.state === 'recording') stopRecording()
      }, MAX_RECORDING_MS)
    } catch {
      setAudioError(t('micError'))
    }
  }

  function stopRecording() {
    audioRecorderRef.current?.stop()
    setRecording(false)
  }

  async function handleImportPdf(file: File) {
    if (!userId || importingPdf) return
    setImportError('')

    let rasterized: File[]
    try {
      rasterized = await rasterizePdfPages(file, MAX_PAGES)
      if (rasterized.length === 0) throw new Error('empty')
    } catch {
      setImportError(t('pdfConvertError'))
      return
    }

    setImportingPdf(true)
    try {
      const supabase = createClient()
      if (!supabase) throw new Error('unavailable')
      const urls: string[] = []
      for (let i = 0; i < rasterized.length; i++) {
        const path = `${userId}/builder-import-${style}-${Date.now()}-${i}.png`
        const { error: uploadError } = await supabase.storage
          .from('books')
          .upload(path, rasterized[i], { contentType: rasterized[i].type })
        if (uploadError) throw uploadError
        urls.push(supabase.storage.from('books').getPublicUrl(path).data.publicUrl)
      }

      setPagesByStyle((prev) => ({
        ...prev,
        [style]: urls.map((url) => {
          const page = makePage('oneBig')
          page.panels[0] = { image: url, textBoxes: [] }
          return page
        }),
      }))
      setPageIndex(0)
      setSelectedPanel(null)
      setPublishedBookId(null)
    } catch {
      setImportError(t('importSaveError'))
    } finally {
      setImportingPdf(false)
    }
  }

  const filledPanels = pages.flatMap((page) => page.panels.filter((p) => p.image))

  function flattenPages() {
    const orderedPanels = pages.flatMap((page) => {
      const panelCells = layoutCells(page.layout)
      const ordered = rtl ? [...panelCells].reverse() : panelCells
      return ordered.map((c) => page.panels[c.n - 1]).filter((p) => p.image)
    })
    const pagesOut = orderedPanels.map((p) => p.image!)
    const pageCaptions = orderedPanels.map((p) => encodeCaptionList((p.textBoxes ?? []).map((b) => ({ type: b.type, text: b.text }))))
    const pageAudio = orderedPanels.map((p) => p.audio ?? '')
    const pageFraming: PageFraming[] = orderedPanels.map((p) => ({
      zoom: p.imageZoom ?? DEFAULT_IMAGE_ZOOM,
      offsetX: p.imageOffsetX ?? 0,
      offsetY: p.imageOffsetY ?? 0,
    }))
    return { pagesOut, pageCaptions, pageAudio, pageFraming }
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
      const { pagesOut, pageCaptions, pageAudio } = flattenPages()
      const { error: insertError } = await supabase.from('book_chapters').insert({
        book_id: selectedBookId,
        chapter_number: nextNumber,
        title: null,
        pages: pagesOut,
        page_captions: pageCaptions,
        page_audio: pageAudio,
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
      const { pagesOut, pageCaptions, pageAudio } = flattenPages()
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
            pageAudio,
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

  async function handleDownloadVideo() {
    if (filledPanels.length === 0 || videoBusy) return
    setVideoBusy(true)
    setVideoError('')
    let audioCtx: AudioContext | undefined
    try {
      const { pagesOut, pageFraming, pageAudio } = flattenPages()

      const canvas = document.createElement('canvas')
      canvas.width = EXPORT_VIDEO_W
      canvas.height = EXPORT_VIDEO_H
      const ctx = canvas.getContext('2d')
      if (!ctx || typeof canvas.captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
        setVideoError(t('videoUnsupported'))
        return
      }

      const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((type) =>
        MediaRecorder.isTypeSupported(type),
      )
      if (!mimeType) {
        setVideoError(t('videoUnsupported'))
        return
      }

      // Load every page's media fully — this is the network-bound step,
      // slowest on a cold serverless start — before recording starts at all,
      // so no page's on-screen time gets silently eaten by its own loading.
      const [pages, audioEls] = await Promise.all([
        Promise.all(pagesOut.map(preloadExportPage)),
        Promise.all(pageAudio.map(preloadExportAudio)),
      ])

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, EXPORT_VIDEO_W, EXPORT_VIDEO_H)
      const videoTracks = canvas.captureStream(EXPORT_VIDEO_FPS).getVideoTracks()

      // Only a page with an actual recorded voiceover needs the Web Audio
      // graph at all — a book nobody narrated keeps today's silent export
      // (and a real player hides the volume control entirely for a track
      // with no audio, which is exactly what a silent book should show).
      let audioTracks: MediaStreamTrack[] = []
      const audioSources = new Map<number, MediaElementAudioSourceNode>()
      if (audioEls.some((el) => el !== null)) {
        audioCtx = new AudioContext()
        await audioCtx.resume()
        const dest = audioCtx.createMediaStreamDestination()
        audioEls.forEach((el, i) => {
          if (!el) return
          const source = audioCtx!.createMediaElementSource(el)
          source.connect(dest)
          audioSources.set(i, source)
        })
        audioTracks = dest.stream.getAudioTracks()
      }

      const recorder = new MediaRecorder(new MediaStream([...videoTracks, ...audioTracks]), {
        mimeType,
        videoBitsPerSecond: EXPORT_VIDEO_BITRATE,
      })
      const chunks: BlobPart[] = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }
      const finished = new Promise<void>((resolve) => {
        recorder.onstop = () => resolve()
      })

      recorder.start()
      for (let i = 0; i < pages.length; i++) {
        const voiceover = audioEls[i]
        if (voiceover && audioSources.has(i)) {
          voiceover.currentTime = 0
          void voiceover.play()
        }
        await renderExportPage(ctx, pages[i], pageFraming[i], voiceover?.duration || 0)
        voiceover?.pause()
      }
      recorder.stop()
      await finished

      const blob = new Blob(chunks, { type: mimeType })
      const url = URL.createObjectURL(blob)
      const title = books?.find((b) => b.id === selectedBookId)?.title || t('downloadDefaultTitle')
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.webm`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch {
      setVideoError(t('videoError'))
    } finally {
      await audioCtx?.close()
      setVideoBusy(false)
    }
  }

  const selectedBookTitle = books?.find((b) => b.id === publishedBookId)?.title

  return (
    <section id="panel-builder" className="scroll-mt-[116px] px-4 py-16 sm:px-6 lg:scroll-mt-20">
      <span id="comic-planner" className="sr-only scroll-mt-[116px] lg:scroll-mt-20" aria-hidden="true" />
      <span id="manga-planner" className="sr-only scroll-mt-[116px] lg:scroll-mt-20" aria-hidden="true" />
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

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => void handleSaveDraft()}
            disabled={draftStatus === 'saving'}
            className="rounded-full border-2 border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-page disabled:cursor-not-allowed disabled:opacity-60"
          >
            💾 {t('saveDraft')}
          </button>
          <span className="text-xs font-semibold" style={{ color: theme.soft }} role="status">
            {draftStatus === 'saving' && t('draftSaving')}
            {draftStatus === 'saved' && `✓ ${t('draftSaved')}`}
            {draftStatus === 'restored' && `✓ ${t('draftRestored')}`}
            {draftStatus === 'error' && t('draftError')}
          </span>
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

        <div className="mt-6 rounded-2xl border-2 border-dashed border-ink/20 bg-white/60 p-4 text-center sm:p-5">
          <p className="text-sm font-extrabold text-ink">{t('importHeading')}</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-ink/60">{t('importLead')}</p>
          <div className="mt-3 flex flex-col items-center gap-1.5">
            {userId ? (
              <label
                className={`rounded-full border-2 border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink ${
                  importingPdf ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-page'
                }`}
              >
                {importingPdf ? t('importingButton') : `📄 ${t('importButton')}`}
                <input
                  type="file"
                  accept={PDF_TYPE}
                  disabled={importingPdf}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleImportPdf(file)
                    e.target.value = ''
                  }}
                />
              </label>
            ) : (
              <p className="text-xs font-semibold text-ink/45">{t('importSignIn')}</p>
            )}
            {importError && <p className="text-xs font-semibold text-red-600">{importError}</p>}
          </div>
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
            ref={pageStageRef}
            onPointerDown={() => setSelectedSticker(null)}
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
              return (
                <div
                  key={n}
                  onPointerDown={(e) => handlePanelPointerDown(e, n - 1, panel)}
                  onPointerMove={handlePanelPointerMove}
                  onPointerUp={(e) => handlePanelPointerUp(e, n - 1)}
                  className={`relative cursor-pointer overflow-hidden ${isSelected && panel.image ? 'touch-none' : ''}`}
                  style={{
                    gridColumn,
                    gridRow,
                    background: `${theme.ink}0d`,
                    border: isSelected ? `2.5px solid ${theme.accent}` : `1.5px solid ${theme.ink}22`,
                  }}
                >
                  {panel.image ? (
                    <>
                      {isVideoUrl(panel.image) ? (
                        <video
                          src={panel.image}
                          autoPlay
                          loop
                          muted
                          playsInline
                          draggable={false}
                          className="absolute inset-0 h-full w-full object-cover"
                          style={{ ...panelImageStyle(panel), ...(theme.grayscale ? { filter: 'grayscale(1) contrast(1.05)' } : {}) }}
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={panel.image}
                          alt=""
                          draggable={false}
                          className="absolute inset-0 h-full w-full object-cover"
                          style={{ ...panelImageStyle(panel), ...(theme.grayscale ? { filter: 'grayscale(1) contrast(1.05)' } : {}) }}
                        />
                      )}
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

                  {panel.audio && (
                    <span
                      aria-label={t('panelHasAudio')}
                      title={t('panelHasAudio')}
                      className="absolute bottom-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px]"
                      style={{ [rtl ? 'left' : 'right']: 4, background: `${theme.pageBg}cc` } as React.CSSProperties}
                    >
                      🎙️
                    </span>
                  )}

                  {(panel.textBoxes ?? []).map((bubble) => (
                    <TextBox
                      key={bubble.id}
                      type={bubble.type}
                      value={bubble.text}
                      onChange={(text) => updateTextBox(n - 1, bubble.id, { text })}
                      theme={theme}
                      rtl={rtl}
                      manga={style === 'manga'}
                      placeholder={t('textPlaceholder')}
                      fontSizePx={bubble.fontSize ?? DEFAULT_FONT_SIZE}
                      offsetX={bubble.offsetX ?? 0}
                      offsetY={bubble.offsetY ?? 0}
                      selected={selectedTextBox === bubble.id}
                      onDragPointerDown={(e) => handleTextPointerDown(e, n - 1, bubble)}
                      onDragPointerMove={handleTextPointerMove}
                      onDragPointerUp={handleTextPointerUp}
                      height={bubble.height ?? DEFAULT_TEXT_HEIGHT}
                      onHeightDragPointerDown={(e) => handleTextHeightPointerDown(e, n - 1, bubble)}
                      onHeightDragPointerMove={handleTextHeightPointerMove}
                      onHeightDragPointerUp={handleTextHeightPointerUp}
                    />
                  ))}
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

            {currentPage.stickers.map((sticker) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={sticker.id}
                src={sticker.src}
                alt=""
                draggable={false}
                onPointerDown={(e) => handleStickerPointerDown(e, sticker)}
                onPointerMove={handleStickerPointerMove}
                onPointerUp={(e) => handleStickerPointerUp(e, sticker.id)}
                className="absolute z-20 touch-none select-none"
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  width: `${sticker.size}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'move',
                  outline: selectedSticker === sticker.id ? `2.5px solid ${theme.accent}` : 'none',
                  outlineOffset: 2,
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

        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => movePage(-1)}
            disabled={pageIndex === 0}
            className="rounded-full border-2 border-ink/15 bg-white px-3 py-1 text-xs font-bold text-ink/60 transition-colors hover:bg-page disabled:cursor-not-allowed disabled:opacity-40"
          >
            ⬅ {t('movePageEarlier')}
          </button>
          <button
            type="button"
            onClick={insertPageBefore}
            disabled={pages.length >= MAX_PAGES}
            className="rounded-full border-2 border-ink/15 bg-white px-3 py-1 text-xs font-bold text-ink/60 transition-colors hover:bg-page disabled:cursor-not-allowed disabled:opacity-40"
          >
            ➕ {t('insertPageBefore')}
          </button>
          <button
            type="button"
            onClick={clearCurrentPage}
            disabled={currentPageIsBlank}
            className="rounded-full border-2 border-red-400/50 bg-white px-3 py-1 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            🧹 {t('clearPage')}
          </button>
          <button
            type="button"
            onClick={removeCurrentPage}
            disabled={pages.length <= 1}
            className="rounded-full border-2 border-red-400/50 bg-white px-3 py-1 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            🗑️ {t('deletePage')}
          </button>
          <button
            type="button"
            onClick={() => movePage(1)}
            disabled={pageIndex >= pages.length - 1}
            className="rounded-full border-2 border-ink/15 bg-white px-3 py-1 text-xs font-bold text-ink/60 transition-colors hover:bg-page disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('movePageLater')} ➡
          </button>
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
                  onClick={() => addTextBox(selectedPanel, typeKey)}
                  disabled={(currentPanel?.textBoxes?.length ?? 0) >= MAX_TEXT_BOXES_PER_PANEL}
                  className="rounded-full border-2 border-ink/15 bg-white px-3 py-1.5 text-xs font-bold text-ink/70 hover:bg-page disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {TEXT_TYPE_ICON[typeKey]} {t('addBubble')} {t(`textType.${typeKey}`)}
                </button>
              ))}
              {(currentPanel?.image || (currentPanel?.textBoxes?.length ?? 0) > 0 || currentPanel?.audio) && (
                <button
                  type="button"
                  onClick={() => {
                    updatePanel(selectedPanel, { image: undefined, textBoxes: [], audio: undefined })
                    setSelectedTextBox(null)
                  }}
                  className="rounded-full border-2 border-red-400/50 bg-white px-3 py-1.5 text-xs font-bold text-red-600"
                >
                  ✕ {t('clearPanel')}
                </button>
              )}
            </div>
            {textBoxError && <p className="mt-1.5 text-xs font-semibold text-red-600">{textBoxError}</p>}

            {(currentPanel?.textBoxes?.length ?? 0) > 0 && (
              <p className="mt-1.5 text-[10px] font-semibold text-ink/40">{t('dragTextHint')}</p>
            )}

            {currentTextBox && (
              <div className="mt-2 rounded-lg border-2 border-ink/10 bg-white/70 p-2.5">
                <div className="flex items-center gap-2">
                  <label htmlFor="panel-font-size" className="text-xs font-bold text-ink/50">
                    {t('fontSizeLabel')}
                  </label>
                  <input
                    id="panel-font-size"
                    type="range"
                    min={MIN_FONT_SIZE}
                    max={MAX_FONT_SIZE}
                    step={0.5}
                    value={currentTextBox.fontSize ?? DEFAULT_FONT_SIZE}
                    onChange={(e) => updateTextBox(selectedPanel, currentTextBox.id, { fontSize: Number(e.target.value) })}
                    className="h-2 flex-1 accent-primary"
                  />
                  <span className="w-12 shrink-0 text-right text-xs font-bold text-ink/60">
                    {Math.round(currentTextBox.fontSize ?? DEFAULT_FONT_SIZE)}px
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between gap-2">
                  {(currentTextBox.offsetX ?? 0) !== 0 || (currentTextBox.offsetY ?? 0) !== 0 ? (
                    <button
                      type="button"
                      onClick={() => updateTextBox(selectedPanel, currentTextBox.id, { offsetX: undefined, offsetY: undefined })}
                      className="text-xs font-semibold text-ink/50 underline underline-offset-2 hover:text-ink"
                    >
                      {t('resetPosition')}
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => removeTextBox(selectedPanel, currentTextBox.id)}
                    className="shrink-0 rounded-full border-2 border-red-400/50 bg-white px-3 py-1 text-xs font-bold text-red-600"
                  >
                    ✕ {t('removeTextBox')}
                  </button>
                </div>

                <div className="mt-1.5">
                  <ReadAloud
                    text={currentTextBox.text}
                    className="rounded-full border-2 border-ink/15 bg-white px-3 py-1.5 text-xs font-bold text-ink/70 hover:bg-page"
                  />
                </div>
              </div>
            )}

            {!currentPanel?.image && (
              <div className="mt-3 rounded-lg border-2 border-ink/10 bg-white/70 p-2.5">
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold text-ink/60">{t('panelImageLabel')}</p>
                  <a
                    href="https://unsplash.com/s/photos/free-images"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-ink/50 underline underline-offset-2 hover:text-ink"
                  >
                    {t('unsplashLink')}
                  </a>
                </div>
                <label
                  className={`rounded-full border-2 border-ink/15 bg-white px-3 py-1 text-xs font-bold text-ink/70 ${
                    convertingPdf ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-page'
                  }`}
                >
                  {convertingPdf ? t('convertingPdf') : userId ? t('uploadImage') : t('uploadImageOnly')}
                  <input
                    type="file"
                    accept={(userId ? ACCEPTED_UPLOAD : ACCEPTED_IMAGE).join(',')}
                    disabled={convertingPdf}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void handleUploadImage(file)
                      e.target.value = ''
                    }}
                  />
                </label>
                {!userId && <p className="mt-1 text-[10px] font-semibold text-ink/45">{t('uploadMoreSignIn')}</p>}
                <p className="mt-1 text-[10px] font-semibold text-ink/40">{t('videoPanelHint')}</p>
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

            {currentPanel?.image && (
              <div className="mt-3 rounded-lg border-2 border-ink/10 bg-white/70 p-2.5">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-ink/60">{t('panelPositionLabel')}</p>
                  {((currentPanel.imageZoom ?? DEFAULT_IMAGE_ZOOM) !== DEFAULT_IMAGE_ZOOM ||
                    (currentPanel.imageOffsetX ?? 0) !== 0 ||
                    (currentPanel.imageOffsetY ?? 0) !== 0) && (
                    <button
                      type="button"
                      onClick={() =>
                        updatePanel(selectedPanel, { imageZoom: undefined, imageOffsetX: undefined, imageOffsetY: undefined })
                      }
                      className="text-xs font-semibold text-ink/50 underline underline-offset-2 hover:text-ink"
                    >
                      {t('resetPosition')}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="panel-image-zoom" className="text-xs">
                    🔍
                  </label>
                  <input
                    id="panel-image-zoom"
                    type="range"
                    min={MIN_IMAGE_ZOOM}
                    max={MAX_IMAGE_ZOOM}
                    step={0.05}
                    value={currentPanel.imageZoom ?? DEFAULT_IMAGE_ZOOM}
                    onChange={(e) => updatePanel(selectedPanel, { imageZoom: Number(e.target.value) })}
                    className="h-2 flex-1 accent-primary"
                    aria-label={t('zoomLabel')}
                  />
                  <span className="w-12 shrink-0 text-right text-xs font-bold text-ink/60">
                    {Math.round((currentPanel.imageZoom ?? DEFAULT_IMAGE_ZOOM) * 100)}%
                  </span>
                </div>
                <p className="mt-1.5 text-[10px] font-semibold text-ink/40">{t('dragToReposition')}</p>
              </div>
            )}

            <div className="mt-3 rounded-lg border-2 border-ink/10 bg-white/70 p-2.5">
              <p className="mb-1.5 text-xs font-bold text-ink/60">{t('panelAudioLabel')}</p>
              {currentPanel?.audio ? (
                <div className="flex flex-wrap items-center gap-2">
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <audio controls src={currentPanel.audio} className="h-8 max-w-full" />
                  <button
                    type="button"
                    onClick={() => updatePanel(selectedPanel, { audio: undefined })}
                    className="rounded-full border-2 border-ink/15 bg-white px-3 py-1 text-xs font-bold text-ink/70 hover:bg-page"
                  >
                    {t('removeAudio')}
                  </button>
                </div>
              ) : userId ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => (recording ? stopRecording() : void startRecording())}
                    disabled={audioBusy}
                    className={`rounded-full border-2 px-3 py-1 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
                      recording ? 'border-red-400 bg-red-50 text-red-600' : 'border-ink/15 bg-white text-ink/70 hover:bg-page'
                    }`}
                  >
                    {recording ? `⏹ ${t('stopRecording')}` : `🎙️ ${t('recordVoiceover')}`}
                  </button>
                  <label
                    className={`rounded-full border-2 border-ink/15 bg-white px-3 py-1 text-xs font-bold text-ink/70 ${
                      audioBusy || recording ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-page'
                    }`}
                  >
                    {audioBusy ? t('uploadingAudio') : t('uploadAudio')}
                    <input
                      type="file"
                      accept={ACCEPTED_AUDIO_ACCEPT}
                      disabled={audioBusy || recording}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) void handleUploadAudio(file)
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>
              ) : (
                <p className="text-xs font-semibold text-ink/45">{t('signInForAudio')}</p>
              )}
              {audioError && <p className="mt-1.5 text-xs font-semibold text-red-600">{audioError}</p>}
            </div>
          </div>
        )}

        <div className="mx-auto mt-4 max-w-xl rounded-2xl border-2 border-ink/10 bg-white/70 p-4 sm:p-5">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">{t('stickersHeading')}</h3>
            <label
              className={`rounded-full border-2 border-ink/15 bg-white px-3 py-1 text-xs font-bold text-ink/70 ${
                currentPage.stickers.length >= MAX_STICKERS_PER_PAGE ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-page'
              }`}
            >
              ✨ {t('addSticker')}
              <input
                type="file"
                accept={ACCEPTED_IMAGE.join(',')}
                disabled={currentPage.stickers.length >= MAX_STICKERS_PER_PAGE}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleAddSticker(file)
                  e.target.value = ''
                }}
              />
            </label>
          </div>

          <p className="text-[10px] font-semibold text-ink/40">{t('stickerPresetsLabel')}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {PRESET_STICKERS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => addPresetSticker(preset.src)}
                disabled={currentPage.stickers.length >= MAX_STICKERS_PER_PAGE}
                aria-label={t(preset.labelKey)}
                title={t(preset.labelKey)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink/15 bg-white p-1.5 hover:bg-page disabled:cursor-not-allowed disabled:opacity-40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preset.src} alt="" className="h-full w-full object-contain" draggable={false} />
              </button>
            ))}
          </div>

          <p className="mt-2 text-[10px] font-semibold text-ink/40">{t('dragStickerHint')}</p>
          {stickerError && <p className="mt-1.5 text-xs font-semibold text-red-600">{stickerError}</p>}

          {currentSticker && (
            <div className="mt-3 flex items-center gap-2 border-t-2 border-ink/10 pt-3">
              <label htmlFor="sticker-size" className="text-xs">
                ↔️
              </label>
              <input
                id="sticker-size"
                type="range"
                min={MIN_STICKER_SIZE}
                max={MAX_STICKER_SIZE}
                step={1}
                value={currentSticker.size}
                onChange={(e) => updateSticker(currentSticker.id, { size: clampStickerSize(Number(e.target.value)) })}
                className="h-2 flex-1 accent-primary"
                aria-label={t('stickerSizeLabel')}
              />
              <span className="w-10 shrink-0 text-right text-xs font-bold text-ink/60">
                {Math.round(currentSticker.size)}%
              </span>
              <button
                type="button"
                onClick={() => removeSticker(currentSticker.id)}
                className="rounded-full border-2 border-red-400/50 bg-white px-3 py-1 text-xs font-bold text-red-600"
              >
                ✕ {t('removeSticker')}
              </button>
            </div>
          )}
        </div>

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
            <button
              type="button"
              onClick={() => void handleDownloadVideo()}
              disabled={videoBusy}
              className="flex items-center gap-2 rounded-full border-2 border-primary bg-white px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {videoBusy ? t('downloadingVideoButton') : `🎬 ${t('downloadVideoButton')}`}
            </button>
            {downloadError && <p className="text-xs font-semibold text-red-600">{downloadError}</p>}
            {videoError && <p className="text-xs font-semibold text-red-600">{videoError}</p>}
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
                  {t('publishSuccess', { title: selectedBookTitle ?? '' })}{' '}
                  <Link href={`/library/book/${publishedBookId}`} className="underline underline-offset-2">
                    {t('publishViewBook')}
                  </Link>
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
  fontSizePx,
  offsetX,
  offsetY,
  selected,
  onDragPointerDown,
  onDragPointerMove,
  onDragPointerUp,
  height,
  onHeightDragPointerDown,
  onHeightDragPointerMove,
  onHeightDragPointerUp,
}: {
  type: CaptionType
  value: string
  onChange: (text: string) => void
  theme: ReturnType<typeof getBookFormatTheme>
  rtl: boolean
  manga: boolean
  placeholder: string
  fontSizePx: number
  offsetX: number
  offsetY: number
  selected: boolean
  onDragPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onDragPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  onDragPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
  height: number
  onHeightDragPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onHeightDragPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  onHeightDragPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
}) {
  const radius = manga ? 3 : 14
  const side: 'left' | 'right' = rtl ? 'right' : 'left'
  const dragStyle: React.CSSProperties = {
    ...(offsetX === 0 && offsetY === 0 ? {} : { transform: `translate(${offsetX}px, ${offsetY}px)` }),
    ...(selected ? { outline: `2.5px solid ${theme.accent}`, outlineOffset: 2 } : {}),
  }
  // A drag starts on the bubble's own padding/background, not the textarea —
  // the textarea already stops its own pointerdown from bubbling here, so
  // typing and text selection inside it are completely unaffected.
  const dragHandlers = {
    onPointerDown: onDragPointerDown,
    onPointerMove: onDragPointerMove,
    onPointerUp: onDragPointerUp,
  }
  const textarea = (
    <textarea
      value={value}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="block w-full resize-none border-0 bg-transparent p-0 font-bold leading-snug text-ink placeholder:font-semibold placeholder:italic placeholder:text-ink/40 focus:outline-none focus:ring-0"
      style={{ fontFamily: theme.bodyFont, fontSize: fontSizePx, height }}
    />
  )
  // A native CSS resize handle barely works with touch, so this small grip
  // below the text is dragged by hand instead — same pointer-drag pattern
  // as everything else draggable in this editor.
  const resizeGrip = (
    <div
      onPointerDown={onHeightDragPointerDown}
      onPointerMove={onHeightDragPointerMove}
      onPointerUp={onHeightDragPointerUp}
      className="-mb-0.5 mt-1 flex h-4 cursor-ns-resize touch-none items-center justify-center"
      aria-hidden="true"
    >
      <span className="h-1 w-8 rounded-full" style={{ background: `${theme.ink}33` }} />
    </div>
  )

  if (type === 'caption') {
    return (
      <div
        className="absolute inset-x-0 bottom-0 z-[2] cursor-move touch-none px-2.5 py-2"
        style={{ background: 'rgba(255,255,255,.93)', borderTop: `2px solid ${theme.ink}`, ...dragStyle }}
        onClick={(e) => e.stopPropagation()}
        {...dragHandlers}
      >
        {textarea}
        {resizeGrip}
      </div>
    )
  }

  if (type === 'thought') {
    return (
      <div
        className="absolute top-1.5 z-[2] max-w-[80%] cursor-move touch-none px-3 py-2.5"
        style={
          {
            [side]: 6,
            background: '#fff',
            border: `2px solid ${theme.ink}`,
            borderRadius: '46% 54% 58% 42% / 58% 48% 52% 42%',
            ...dragStyle,
          } as React.CSSProperties
        }
        onClick={(e) => e.stopPropagation()}
        {...dragHandlers}
      >
        {textarea}
        {resizeGrip}
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
      className="absolute top-1.5 z-[2] max-w-[80%] cursor-move touch-none px-2.5 py-1.5"
      style={{ [side]: 6, background: '#fff', border: `2px solid ${theme.ink}`, borderRadius: radius, ...dragStyle } as React.CSSProperties}
      onClick={(e) => e.stopPropagation()}
      {...dragHandlers}
    >
      {textarea}
      {resizeGrip}
      <span
        className="absolute -bottom-[5px] h-[9px] w-[9px] rotate-45"
        style={{ [side]: 12, background: '#fff', borderRight: `2px solid ${theme.ink}`, borderBottom: `2px solid ${theme.ink}` } as React.CSSProperties}
      />
    </div>
  )
}
