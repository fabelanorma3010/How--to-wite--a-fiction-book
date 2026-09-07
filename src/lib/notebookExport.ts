import { escapeHtml, printHtml } from './printHtml'

export type NotebookFormat = 'pdf' | 'docx'

const DOC_TITLE = 'Story Notebook'

function longDate(): string {
  return new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function fileDate(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/**
 * Exports the notebook's current text in the chosen format. Reads straight from
 * the in-memory value, so it works signed-in or not. No-ops on empty text.
 */
export async function exportNotebook(text: string, format: NotebookFormat): Promise<void> {
  const body = text.replace(/\r\n/g, '\n').replace(/[ \t\n]+$/, '')
  if (!body.trim()) return
  if (format === 'pdf') {
    await printAsPdf(body)
    return
  }
  await downloadDocx(body)
}

/**
 * Prints a clean, formatted copy of the notebook so the reader can pick
 * "Save as PDF". Keeps full font and Unicode fidelity — whatever script or
 * emoji they wrote in — which a bundled PDF engine on standard fonts would
 * drop, and it adds no dependency.
 */
function printAsPdf(body: string): Promise<void> {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
    .join('')

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${DOC_TITLE}</title>
<style>
  @page { margin: 24mm 20mm; }
  html, body { margin: 0; }
  body { font: 12pt/1.65 Georgia, "Times New Roman", serif; color: #1a1a1a; }
  h1 { font-size: 20pt; margin: 0 0 2pt; }
  .date { margin: 0 0 20pt; color: #666; font-size: 10pt; }
  p { margin: 0 0 10pt; orphans: 2; widows: 2; }
</style></head><body>
<h1>${DOC_TITLE}</h1>
<p class="date">${escapeHtml(longDate())}</p>
${paragraphs}
</body></html>`

  return printHtml(html)
}

/** Builds a real .docx in the browser and triggers a download. */
async function downloadDocx(body: string): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx')

  const bodyParagraphs = body
    .split('\n')
    .map(
      (line) =>
        new Paragraph({
          spacing: { after: 160 },
          children: line ? [new TextRun(line)] : [],
        }),
    )

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun(DOC_TITLE)],
          }),
          new Paragraph({
            spacing: { after: 320 },
            children: [new TextRun({ text: longDate(), italics: true, color: '808080' })],
          }),
          ...bodyParagraphs,
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Storyburst Notebook ${fileDate()}.docx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2000)
}
