export type BookTypeId = 'comic' | 'manga' | 'cartoon' | 'childrens'

export interface BookType {
  id: BookTypeId
  emoji: string
}

/**
 * Structural only — the id and its emoji. All the copy (name, tagline, blurb,
 * tips) lives in messages/<locale>.json under `BookTypes.types.<id>` and is
 * read with next-intl, so it translates with the rest of the site.
 */
export const bookTypes: BookType[] = [
  { id: 'comic', emoji: '💥' },
  { id: 'manga', emoji: '🌸' },
  { id: 'cartoon', emoji: '🎈' },
  { id: 'childrens', emoji: '🧸' },
]

export const bookTypeIds: BookTypeId[] = bookTypes.map((b) => b.id)

export function bookTypeEmoji(id: string): string {
  return bookTypes.find((b) => b.id === id)?.emoji ?? '📘'
}

/**
 * Like bookTypeEmoji, but also covers 'chapterbook' — a books.book_type
 * value that isn't a BookTypeId (see src/lib/books.ts's BookFormat).
 */
export function bookFormatEmoji(id: string | null | undefined): string {
  if (id === 'chapterbook') return '📗'
  return bookTypeEmoji(id ?? '')
}
