import { describe, expect, it } from 'vitest'
import { decodeCaptionList, decodeCaptionType, encodeCaptionList, encodeCaptionType } from './captionType'

describe('captionType', () => {
  it('encodes speech with no prefix, and caption/thought with one', () => {
    expect(encodeCaptionType('speech', 'Hello')).toBe('Hello')
    expect(encodeCaptionType('caption', 'Once upon a time')).toBe('caption::Once upon a time')
    expect(encodeCaptionType('thought', 'I wonder...')).toBe('thought::I wonder...')
  })

  it('decodes each type back, and un-prefixed legacy text as speech', () => {
    expect(decodeCaptionType('Hello')).toEqual({ type: 'speech', text: 'Hello' })
    expect(decodeCaptionType('caption::Once upon a time')).toEqual({ type: 'caption', text: 'Once upon a time' })
    expect(decodeCaptionType('thought::I wonder...')).toEqual({ type: 'thought', text: 'I wonder...' })
  })

  it('encodes zero or one bubble exactly like encodeCaptionType, for full backward compatibility', () => {
    expect(encodeCaptionList([])).toBe('')
    expect(encodeCaptionList([{ type: 'speech', text: 'Hi there' }])).toBe(encodeCaptionType('speech', 'Hi there'))
    expect(encodeCaptionList([{ type: 'caption', text: 'Narration' }])).toBe(encodeCaptionType('caption', 'Narration'))
  })

  it('drops empty-text bubbles before encoding', () => {
    expect(encodeCaptionList([{ type: 'speech', text: '   ' }, { type: 'caption', text: 'Real text' }])).toBe(
      encodeCaptionType('caption', 'Real text'),
    )
  })

  it('round-trips multiple bubbles through a JSON list form', () => {
    const items = [
      { type: 'speech' as const, text: 'Hello there!' },
      { type: 'thought' as const, text: 'What now?' },
      { type: 'caption' as const, text: 'Meanwhile...' },
    ]
    const encoded = encodeCaptionList(items)
    expect(encoded.startsWith('multi::')).toBe(true)
    expect(decodeCaptionList(encoded)).toEqual(items)
  })

  it('reads a plain legacy caption (single bubble, pre-existing chapters) as a one-item list', () => {
    expect(decodeCaptionList('Hello there')).toEqual([{ type: 'speech', text: 'Hello there' }])
    expect(decodeCaptionList('caption::Once upon a time')).toEqual([{ type: 'caption', text: 'Once upon a time' }])
    expect(decodeCaptionList('')).toEqual([])
  })

  it('falls back to reading malformed multi-list text as a single legacy caption instead of throwing', () => {
    expect(decodeCaptionList('multi::not valid json')).toEqual([{ type: 'speech', text: 'multi::not valid json' }])
  })
})
