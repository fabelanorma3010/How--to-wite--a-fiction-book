import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChapterReaderClient from './ChapterReaderClient'
import type { Chapter, BookFormat } from '@/lib/books'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

type ChapterData = Chapter & { bookTitle: string; bookType: BookFormat | null }

function makeChapter(overrides: Partial<ChapterData> = {}): ChapterData {
  return {
    id: 'c1',
    bookId: 'b1',
    chapterNumber: 1,
    title: null,
    body: null,
    pages: ['/a.png', '/b.png', '/c.png'],
    pageCaptions: [],
    publishedAt: '2026-01-01',
    bookTitle: 'Test Book',
    bookType: 'comic',
    ...overrides,
  }
}

describe('ChapterReaderClient image pages', () => {
  it('shows one page at a time, and Next walks through pages, then the end card', async () => {
    const user = userEvent.setup()
    render(<ChapterReaderClient chapter={makeChapter()} prev={null} next={null} />)

    expect(screen.getByRole('img', { name: 'Page 1' })).toBeInTheDocument()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous Page' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Next Page' }))
    expect(screen.getByRole('img', { name: 'Page 2' })).toBeInTheDocument()
    expect(screen.getByText('2 / 3')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next Page' }))
    expect(screen.getByRole('img', { name: 'Page 3' })).toBeInTheDocument()

    // One more Next past the last real page reaches the end card, not another chapter.
    await user.click(screen.getByRole('button', { name: 'Next Page' }))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('To Be Continued')).toBeInTheDocument()
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
  })

  it('Previous walks back from the end card to the last real page', async () => {
    const user = userEvent.setup()
    render(<ChapterReaderClient chapter={makeChapter({ pages: ['/a.png'] })} prev={null} next={null} />)

    await user.click(screen.getByRole('button', { name: 'Next Page' }))
    expect(screen.getByText('To Be Continued')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Previous Page' }))
    expect(screen.getByRole('img', { name: 'Page 1' })).toBeInTheDocument()
  })

  it('reverses page order for manga', () => {
    render(
      <ChapterReaderClient
        chapter={makeChapter({ bookType: 'manga', pages: ['/first.png', '/second.png'] })}
        prev={null}
        next={null}
      />,
    )
    expect(screen.getByRole('img')).toHaveAttribute('src', '/second.png')
  })

  it('shows "no pages yet" with no page-nav controls when the chapter is empty', () => {
    render(<ChapterReaderClient chapter={makeChapter({ pages: [] })} prev={null} next={null} />)
    expect(screen.getByText(/no pages yet/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next Page' })).not.toBeInTheDocument()
  })

  it('shows a page caption as a speech-bubble overlay for comic/manga formats', () => {
    render(
      <ChapterReaderClient
        chapter={makeChapter({ pages: ['/a.png'], pageCaptions: ['The vault door creaks open.'] })}
        prev={null}
        next={null}
      />,
    )
    expect(screen.getByText('The vault door creaks open.')).toBeInTheDocument()
  })

  it('shows a page caption as a bottom caption bar for the children’s picture-book format', () => {
    render(
      <ChapterReaderClient
        chapter={makeChapter({
          bookType: 'childrens',
          pages: ['/a.png'],
          pageCaptions: ['Once there was a very small dragon.'],
        })}
        prev={null}
        next={null}
      />,
    )
    expect(screen.getByText('Once there was a very small dragon.')).toBeInTheDocument()
  })

  it('shows no caption UI at all when a page has no caption', () => {
    render(<ChapterReaderClient chapter={makeChapter({ pages: ['/a.png'], pageCaptions: [''] })} prev={null} next={null} />)
    expect(screen.getByRole('img', { name: 'Page 1' })).toBeInTheDocument()
    // The page-1 image is the only element with this alt/text — nothing extra got rendered.
    expect(screen.queryByText(/./, { selector: 'p' })).not.toBeInTheDocument()
  })
})

describe('ChapterReaderClient text chapters', () => {
  it('renders prose paragraphs and keeps the chapter-level nav footer instead of page nav', () => {
    render(
      <ChapterReaderClient
        chapter={makeChapter({ body: 'First paragraph.\n\nSecond paragraph.', pages: [] })}
        prev={{ id: 'p0', chapterNumber: 0 }}
        next={{ id: 'c2', chapterNumber: 2 }}
      />,
    )
    expect(screen.getByText('First paragraph.')).toBeInTheDocument()
    expect(screen.getByText('Second paragraph.')).toBeInTheDocument()
    // Both the in-content end card and the persistent footer nav offer a way
    // to the next chapter — that duplication is intentional, pre-existing UX.
    for (const link of screen.getAllByRole('link', { name: 'Next Chapter' })) {
      expect(link).toHaveAttribute('href', '/library/read/c2')
    }
    expect(screen.queryByRole('button', { name: 'Next Page' })).not.toBeInTheDocument()
  })
})
