import { describe, expect, it } from 'vitest'
import { bookTypes, bookTypeIds, bookTypeEmoji, bookFormatEmoji } from './bookTypes'

describe('bookTypes', () => {
  it('has a non-empty list of book types', () => {
    expect(bookTypes.length).toBeGreaterThan(0)
  })

  it('every type has a unique id, an emoji, and no blank fields', () => {
    const ids = bookTypes.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const type of bookTypes) {
      expect(type.id.trim()).not.toBe('')
      expect(type.emoji.trim()).not.toBe('')
    }
  })

  it('bookTypeEmoji returns the matching emoji for a known id', () => {
    const first = bookTypes[0]
    expect(bookTypeEmoji(first.id)).toBe(first.emoji)
  })

  it('bookTypeEmoji falls back to a default for an unknown id', () => {
    expect(bookTypeEmoji('not-a-real-type' as never)).toBeTruthy()
  })

  it('bookFormatEmoji has its own emoji for chapterbook, which is not a BookTypeId', () => {
    expect(bookTypeIds).not.toContain('chapterbook')
    expect(bookFormatEmoji('chapterbook')).toBe('📗')
  })

  it('bookFormatEmoji otherwise defers to bookTypeEmoji', () => {
    const first = bookTypes[0]
    expect(bookFormatEmoji(first.id)).toBe(first.emoji)
    expect(bookFormatEmoji(null)).toBe(bookTypeEmoji(''))
  })
})
