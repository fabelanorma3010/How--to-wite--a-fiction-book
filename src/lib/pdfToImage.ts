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

/**
 * Renders a PDF's first page onto a canvas and returns it as a real PNG
 * File, so it can flow through an existing image-upload pipeline unchanged.
 */
export async function rasterizePdfFirstPage(file: File): Promise<File> {
  polyfillMapUpsert()
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()

  const data = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data })
  try {
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: RENDER_SCALE })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const canvasContext = canvas.getContext('2d')
    if (!canvasContext) throw new Error('Canvas rendering is not supported in this browser.')

    await page.render({ canvas, canvasContext, viewport }).promise

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('Could not convert that PDF page to an image.')

    const name = file.name.replace(/\.pdf$/i, '') || 'page'
    return new File([blob], `${name}.png`, { type: 'image/png' })
  } finally {
    await loadingTask.destroy()
  }
}
