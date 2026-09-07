import { describe, expect, it } from 'vitest'
import { parseChapterBody } from './parseChapterBody'

describe('parseChapterBody', () => {
  it('splits blank-line-separated text into paragraph blocks', () => {
    const blocks = parseChapterBody('First paragraph.\n\nSecond paragraph.')
    expect(blocks).toEqual([
      { kind: 'text', text: 'First paragraph.' },
      { kind: 'text', text: 'Second paragraph.' },
    ])
  })

  it('treats a lone markdown image line as an image block', () => {
    const blocks = parseChapterBody('Some text.\n\n![a dragon](https://example.com/dragon.png)\n\nMore text.')
    expect(blocks).toEqual([
      { kind: 'text', text: 'Some text.' },
      { kind: 'image', alt: 'a dragon', src: 'https://example.com/dragon.png' },
      { kind: 'text', text: 'More text.' },
    ])
  })

  it('does not treat an image reference mixed into a paragraph as its own image block', () => {
    const blocks = parseChapterBody('Look: ![a dragon](https://example.com/dragon.png) she said.')
    expect(blocks).toEqual([{ kind: 'text', text: 'Look: ![a dragon](https://example.com/dragon.png) she said.' }])
  })

  it('drops blank/whitespace-only blocks and trims surrounding whitespace', () => {
    expect(parseChapterBody('\n\n  Hello.  \n\n\n\n')).toEqual([{ kind: 'text', text: 'Hello.' }])
  })

  it('returns an empty array for empty input', () => {
    expect(parseChapterBody('')).toEqual([])
  })
})
