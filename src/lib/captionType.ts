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
