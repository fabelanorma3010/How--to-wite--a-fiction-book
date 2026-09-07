function waitForImages(doc: Document): Promise<void> {
  const pending = Array.from(doc.images).filter((img) => !img.complete)
  if (pending.length === 0) return Promise.resolve()
  return Promise.race([
    Promise.all(
      pending.map(
        (img) =>
          new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true })
            img.addEventListener('error', () => resolve(), { once: true })
          }),
      ),
    ).then(() => undefined),
    new Promise<void>((resolve) => window.setTimeout(resolve, 8000)),
  ])
}

/**
 * Opens the browser's print dialog on the given HTML document, rendered
 * inside a hidden iframe so pop-up blockers never see it. The reader picks
 * "Save as PDF". This keeps full font/Unicode/image fidelity with zero new
 * dependencies. Waits for any images in the document to finish loading
 * first (bounded by a timeout) so they aren't blank in the printed output.
 */
export async function printHtml(html: string): Promise<void> {
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  Object.assign(frame.style, {
    position: 'fixed',
    right: '0',
    bottom: '0',
    width: '0',
    height: '0',
    border: '0',
  })
  document.body.appendChild(frame)

  const win = frame.contentWindow
  const doc = frame.contentDocument
  if (!win || !doc) {
    frame.remove()
    throw new Error('Could not open the print view.')
  }

  let cleanedUp = false
  const cleanUp = () => {
    if (cleanedUp) return
    cleanedUp = true
    frame.remove()
  }
  const cleanUpSoon = () => window.setTimeout(cleanUp, 500)

  doc.open()
  doc.write(html)
  doc.close()

  // afterprint fires on the iframe window in most browsers and on the parent in
  // a few — listen on both, and keep a long fallback in case neither fires.
  win.addEventListener('afterprint', cleanUpSoon)
  window.addEventListener('afterprint', cleanUpSoon, { once: true })

  await waitForImages(doc)
  await new Promise((resolve) => window.setTimeout(resolve, 150))

  win.focus()
  win.print()
  window.setTimeout(cleanUp, 60_000)
}

export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
