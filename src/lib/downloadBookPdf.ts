import { escapeHtml, printHtml } from './printHtml'
import { parseChapterBody } from './parseChapterBody'
import type { Chapter } from './books'

function longDate(): string {
  return new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function chapterHeading(chapter: Chapter): string {
  return escapeHtml(chapter.title || `Chapter ${chapter.chapterNumber}`)
}

function chapterHtml(chapter: Chapter): string {
  const heading = `<h2>${chapterHeading(chapter)}</h2>`

  if (chapter.body) {
    const blocks = parseChapterBody(chapter.body)
      .map((block) =>
        block.kind === 'image'
          ? `<img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}">`
          : `<p>${escapeHtml(block.text).replace(/\n/g, '<br>')}</p>`,
      )
      .join('')
    return `<section class="chapter">${heading}${blocks}</section>`
  }

  if (chapter.pages.length > 0) {
    const pages = chapter.pages
      .map((url, i) => `<div class="page"><img src="${escapeHtml(url)}" alt="Page ${i + 1}"></div>`)
      .join('')
    return `<section class="chapter">${heading}${pages}</section>`
  }

  return `<section class="chapter">${heading}<p class="empty">No pages yet.</p></section>`
}

/**
 * Prints the whole book — cover, description, and every chapter in order —
 * so the reader can pick "Save as PDF". Reuses the same dependency-free
 * browser-print technique as the notebook export.
 */
export function downloadBookAsPdf(book: { title: string; description: string }, chapters: Chapter[]): Promise<void> {
  const chaptersHtml = chapters.length
    ? chapters.map(chapterHtml).join('')
    : '<section class="chapter"><p class="empty">No chapters published yet.</p></section>'

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(book.title)}</title>
<style>
  @page { margin: 20mm 18mm; }
  html, body { margin: 0; }
  body { font: 12pt/1.65 Georgia, "Times New Roman", serif; color: #1a1a1a; }
  .cover { min-height: 90vh; display: flex; flex-direction: column; justify-content: center; break-after: page; }
  .cover h1 { font-size: 32pt; margin: 0 0 8pt; }
  .cover .date { margin: 0 0 24pt; color: #666; font-size: 10pt; }
  .cover .description { font-size: 13pt; color: #333; max-width: 32em; }
  .chapter { break-after: page; }
  .chapter:last-child { break-after: auto; }
  .chapter h2 { font-size: 18pt; margin: 0 0 14pt; }
  .chapter p { margin: 0 0 10pt; orphans: 2; widows: 2; }
  .chapter p.empty { color: #666; font-style: italic; }
  .chapter img { max-width: 100%; display: block; margin: 0 0 12pt; }
  .page { break-after: page; }
  .page:last-child { break-after: auto; }
  .page img { max-width: 100%; max-height: 85vh; display: block; margin: 0 auto; }
</style></head><body>
<div class="cover">
  <h1>${escapeHtml(book.title)}</h1>
  <p class="date">${escapeHtml(longDate())}</p>
  ${book.description ? `<p class="description">${escapeHtml(book.description)}</p>` : ''}
</div>
${chaptersHtml}
</body></html>`

  return printHtml(html)
}
