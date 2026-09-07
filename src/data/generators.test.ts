import { describe, expect, it } from 'vitest'
import { generateActionText, generateIllustrationIdea } from './generators'
import { bookTypeIds } from './bookTypes'

describe('generateActionText', () => {
  it.each(bookTypeIds)('produces a well-formed line for %s', (genre) => {
    for (let i = 0; i < 20; i++) {
      const text = generateActionText(genre)
      expect(text).toMatch(/^[A-Za-z !-]+! [A-Z]/)
      expect(text.endsWith('!')).toBe(true)
    }
  })
})

describe('generateIllustrationIdea', () => {
  it.each(bookTypeIds)('produces a well-formed prompt for %s', (genre) => {
    for (let i = 0; i < 20; i++) {
      const text = generateIllustrationIdea(genre)
      expect(text.startsWith('Draw ')).toBe(true)
      expect(text).toContain('Color palette:')
    }
  })
})
