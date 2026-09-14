export type CaptionType = 'speech' | 'caption' | 'thought'

const PREFIX: Record<Exclude<CaptionType, 'speech'>, string> = {
  caption: 'caption::',
  thought: 'thought::',
}

/** Speech has no prefix — it's the default, and the only type older chapters (written
 *  before caption/thought existed) can have, so un-prefixed text must keep reading as speech. */
export function encodeCaptionType(type: CaptionType, text: string): string {
  if (type === 'caption') return `${PREFIX.caption}${text}`
  if (type === 'thought') return `${PREFIX.thought}${text}`
  return text
}

export function decodeCaptionType(raw: string): { type: CaptionType; text: string } {
  if (raw.startsWith(PREFIX.caption)) return { type: 'caption', text: raw.slice(PREFIX.caption.length) }
  if (raw.startsWith(PREFIX.thought)) return { type: 'thought', text: raw.slice(PREFIX.thought.length) }
  return { type: 'speech', text: raw }
}

export interface CaptionItem {
  type: CaptionType
  text: string
}

const MULTI_PREFIX = 'multi::'

/**
 * A panel can carry more than one bubble now. The common case — zero or one
 * bubble — still encodes exactly as encodeCaptionType always has, so every
 * chapter published before multi-bubble panels existed keeps decoding the
 * same way. Only two-or-more bubbles need the new JSON-list form.
 */
export function encodeCaptionList(items: CaptionItem[]): string {
  const nonEmpty = items.filter((item) => item.text.trim().length > 0)
  if (nonEmpty.length === 0) return ''
  if (nonEmpty.length === 1) return encodeCaptionType(nonEmpty[0].type, nonEmpty[0].text)
  return MULTI_PREFIX + JSON.stringify(nonEmpty)
}

export function decodeCaptionList(raw: string): CaptionItem[] {
  if (!raw) return []
  if (raw.startsWith(MULTI_PREFIX)) {
    try {
      const parsed: unknown = JSON.parse(raw.slice(MULTI_PREFIX.length))
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is CaptionItem =>
            !!item && typeof item === 'object' && typeof (item as CaptionItem).text === 'string' && typeof (item as CaptionItem).type === 'string',
        )
      }
    } catch {
      // Not valid JSON after all — fall through and read it as one legacy caption.
    }
  }
  const single = decodeCaptionType(raw)
  return single.text ? [single] : []
}
