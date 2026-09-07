export type ChapterBodyBlock = { kind: 'image'; src: string; alt: string } | { kind: 'text'; text: string }

/**
 * Splits a chapter's prose into blank-line-separated blocks. A block that's
 * purely a markdown image reference (`![alt](url)`, as inserted by the
 * chapter editor's "Upload image" / "Generate" buttons) becomes an image
 * block; everything else is a text paragraph.
 */
export function parseChapterBody(body: string): ChapterBodyBlock[] {
  const blocks: ChapterBodyBlock[] = []
  for (const part of body.split(/\n{2,}/)) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const match = /^!\[(.*)\]\((\S+)\)$/.exec(trimmed)
    blocks.push(match ? { kind: 'image', alt: match[1], src: match[2] } : { kind: 'text', text: trimmed })
  }
  return blocks
}
