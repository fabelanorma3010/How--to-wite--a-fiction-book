import type { PDFPageProxy } from 'pdfjs-dist'

const RENDER_SCALE = 2

declare global {
  interface Map<K, V> {
    getOrInsertComputed(key: K, callback: (key: K) => V): V
  }
}

// pdfjs-dist 6.x calls the newly-standardized Map.prototype.getOrInsertComputed
// internally. Browsers that don't yet ship it need this tiny, spec-accurate
// shim, or rendering throws with "getOrInsertComputed is not a function".
function polyfillMapUpsert() {
  if (typeof Map.prototype.getOrInsertComputed === 'function') return
  Map.prototype.getOrInsertComputed = function (key, callback) {
    if (this.has(key)) return this.get(key)!
    const value = callback(key)
    this.set(key, value)
    return value
  }
}

async function loadPdfjs() {
  polyfillMapUpsert()
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()
  return pdfjsLib
}

async function renderPageToPng(page: PDFPageProxy): Promise<Blob> {
  const viewport = page.getViewport({ scale: RENDER_SCALE })

  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const canvasContext = canvas.getContext('2d')
  if (!canvasContext) throw new Error('Canvas rendering is not supported in this browser.')

  await page.render({ canvas, canvasContext, viewport }).promise

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('Could not convert that PDF page to an image.')
  return blob
}

/**
 * Renders a PDF's first page onto a canvas and returns it as a real PNG
 * File, so it can flow through an existing image-upload pipeline unchanged.
 */
export async function rasterizePdfFirstPage(file: File): Promise<File> {
  const pdfjsLib = await loadPdfjs()
  const data = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data })
  try {
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1)
    const blob = await renderPageToPng(page)
    const name = file.name.replace(/\.pdf$/i, '') || 'page'
    return new File([blob], `${name}.png`, { type: 'image/png' })
  } finally {
    await loadingTask.destroy()
  }
}

/**
 * Renders every page of a PDF (up to maxPages) onto a canvas and returns
 * each as a real PNG File, in page order — lets a whole finished PDF be
 * dropped in as a book's pages in one go.
 */
export async function rasterizePdfPages(file: File, maxPages: number): Promise<File[]> {
  const pdfjsLib = await loadPdfjs()
  const data = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data })
  try {
    const pdf = await loadingTask.promise
    const name = file.name.replace(/\.pdf$/i, '') || 'page'
    const pageCount = Math.min(pdf.numPages, maxPages)
    const files: File[] = []
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i)
      const blob = await renderPageToPng(page)
      files.push(new File([blob], `${name}-${i}.png`, { type: 'image/png' }))
    }
    return files
  } finally {
    await loadingTask.destroy()
  }
}
