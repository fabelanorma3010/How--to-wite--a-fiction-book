import { describe, expect, it } from 'vitest'
import { isVideoUrl } from './isVideoUrl'

describe('isVideoUrl', () => {
  it('recognizes mp4, webm, and mov URLs', () => {
    expect(isVideoUrl('https://example.com/a/clip.mp4')).toBe(true)
    expect(isVideoUrl('https://example.com/a/clip.webm')).toBe(true)
    expect(isVideoUrl('https://example.com/a/clip.mov')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(isVideoUrl('https://example.com/CLIP.MP4')).toBe(true)
  })

  it('ignores a trailing query string or hash', () => {
    expect(isVideoUrl('https://example.com/clip.mp4?token=abc')).toBe(true)
    expect(isVideoUrl('https://example.com/clip.webm#t=5')).toBe(true)
  })

  it('rejects image, document, and extension-less URLs', () => {
    expect(isVideoUrl('https://example.com/page.png')).toBe(false)
    expect(isVideoUrl('https://example.com/book.pdf')).toBe(false)
    expect(isVideoUrl('https://example.com/book.epub')).toBe(false)
    expect(isVideoUrl('https://example.com/no-extension')).toBe(false)
  })

  it('rejects a filename that merely contains "mp4" without it being the extension', () => {
    expect(isVideoUrl('https://example.com/mp4-tutorial.png')).toBe(false)
  })

  it('handles null, undefined, and empty input', () => {
    expect(isVideoUrl(null)).toBe(false)
    expect(isVideoUrl(undefined)).toBe(false)
    expect(isVideoUrl('')).toBe(false)
  })
})
