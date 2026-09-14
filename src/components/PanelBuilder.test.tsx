import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IDBFactory } from 'fake-indexeddb'
import { renderWithIntl } from '../test/renderWithIntl'
import PanelBuilder from './PanelBuilder'

const getUserMock = vi.fn()
const uploadMock = vi.fn().mockResolvedValue({ error: null })
const getPublicUrlMock = vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/rasterized.png' } })
const rasterizeMock = vi.fn()
const rasterizePagesMock = vi.fn()

// Chainable query stub: every builder method returns itself. Awaiting (or
// `.then`-ing) it resolves per-table — an empty list by default, except
// 'books' (so the signed-in books-fetch effect has something to select) and
// 'book_chapters' inserts (so a real publish can succeed in tests).
function chainableFor(table: string) {
  const builder: Record<string, unknown> = {}
  const self = () => builder
  ;['select', 'eq', 'order', 'limit'].forEach((method) => {
    builder[method] = self
  })
  builder.insert = () => Promise.resolve({ error: null })
  builder.then = (resolve: (v: { data: unknown[]; error: null }) => void) => {
    if (table === 'books') return resolve({ data: [{ id: 'book-1', title: 'My Test Book' }], error: null })
    return resolve({ data: [], error: null })
  }
  return builder
}

vi.mock('../lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser: getUserMock },
    from: (table: string) => chainableFor(table),
    storage: { from: () => ({ upload: uploadMock, getPublicUrl: getPublicUrlMock }) },
  }),
}))

vi.mock('../lib/pdfToImage', () => ({
  rasterizePdfFirstPage: (file: File) => rasterizeMock(file),
  rasterizePdfPages: (file: File, maxPages: number) => rasterizePagesMock(file, maxPages),
}))

const downloadBookAsPdfMock = vi.fn().mockResolvedValue(undefined)
vi.mock('../lib/downloadBookPdf', () => ({
  downloadBookAsPdf: (...args: unknown[]) => downloadBookAsPdfMock(...args),
}))

function getStage() {
  return screen.getByRole('button', { name: /previous page/i }).parentElement!
}

describe('PanelBuilder', () => {
  afterEach(() => {
    vi.clearAllMocks()
    window.location.hash = ''
  })

  it('opens on Comic with the 3-across layout, showing 3 numbered panels', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    expect(within(stage).getByText('Panel 1')).toBeInTheDocument()
    expect(within(stage).getByText('Panel 2')).toBeInTheDocument()
    expect(within(stage).getByText('Panel 3')).toBeInTheDocument()
    expect(screen.getByText('Page 1 of 30')).toBeInTheDocument()
  })

  it('switching to "1 big panel" leaves only Panel 1 on the page', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(screen.getByRole('button', { name: '1 big panel' }))
    expect(within(stage).getByText('Panel 1')).toBeInTheDocument()
    expect(within(stage).queryByText('Panel 2')).not.toBeInTheDocument()
  })

  it('tapping a panel reveals the text-type and image tools, and typing a caption keeps it after switching type', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    await user.click(screen.getByRole('button', { name: /💬 Speech/ }))

    const box = screen.getByPlaceholderText('Type here…')
    await user.type(box, 'The vault door creaks open.')
    expect(screen.getByDisplayValue('The vault door creaks open.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /📝 Caption/ }))
    expect(screen.getByDisplayValue('The vault door creaks open.')).toBeInTheDocument()
  })

  it('lets the panel text size be changed anywhere from 1 to 75px, defaulting to 10.5px', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    await user.click(screen.getByRole('button', { name: /💬 Speech/ }))

    const slider = screen.getByLabelText('Text size') as HTMLInputElement
    expect(slider).toHaveAttribute('min', '1')
    expect(slider).toHaveAttribute('max', '75')
    expect(slider.value).toBe('10.5')

    const box = screen.getByPlaceholderText('Type here…')
    expect(box).toHaveStyle({ fontSize: '10.5px' })
    expect(screen.getByText('11px')).toBeInTheDocument()

    fireEvent.change(slider, { target: { value: '60' } })
    expect(box).toHaveStyle({ fontSize: '60px' })
    expect(screen.getByText('60px')).toBeInTheDocument()
  })

  it('clearing a panel removes its text tools', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    await user.click(screen.getByRole('button', { name: /💭 Thought/ }))
    expect(screen.getByPlaceholderText('Type here…')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Clear panel/ }))
    expect(screen.queryByPlaceholderText('Type here…')).not.toBeInTheDocument()
  })

  it('Next adds fresh pages up to 30 and then disables, with a live page count', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const next = screen.getByRole('button', { name: /next page/i })

    for (let i = 0; i < 29; i++) {
      await user.click(next)
    }
    expect(screen.getByText('Page 30 of 30')).toBeInTheDocument()
    expect(next).toBeDisabled()
  })

  it('inserts a blank page before the current one without disturbing pages already written', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    // Page 1 gets "First page", then a fresh page 2 gets "Second page".
    await user.click(within(stage).getByText('Panel 1'))
    await user.click(screen.getByRole('button', { name: /💬 Speech/ }))
    await user.type(screen.getByPlaceholderText('Type here…'), 'First page')

    await user.click(screen.getByRole('button', { name: /next page/i }))
    await user.click(within(stage).getByText('Panel 1'))
    await user.click(screen.getByRole('button', { name: /💬 Speech/ }))
    await user.type(screen.getByPlaceholderText('Type here…'), 'Second page')
    expect(screen.getByText('Page 2 of 30')).toBeInTheDocument()

    // Back to page 1, then insert a page before it.
    await user.click(screen.getByRole('button', { name: /previous page/i }))
    expect(screen.getByDisplayValue('First page')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /insert page before/i }))

    // Still page index 1 (the counter always shows "of 30", the cap — not a
    // live count), but it's now the fresh blank page: the old page 1's text
    // moved to page 2, and the old page 2 to page 3.
    expect(screen.getByText('Page 1 of 30')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('First page')).not.toBeInTheDocument()
    expect(within(stage).queryByPlaceholderText('Type here…')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /next page/i }))
    expect(screen.getByText('Page 2 of 30')).toBeInTheDocument()
    expect(screen.getByDisplayValue('First page')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /next page/i }))
    expect(screen.getByText('Page 3 of 30')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Second page')).toBeInTheDocument()
  })

  it('disables inserting a page once at the 30-page cap', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const next = screen.getByRole('button', { name: /next page/i })

    for (let i = 0; i < 29; i++) {
      await user.click(next)
    }
    expect(screen.getByRole('button', { name: /insert page before/i })).toBeDisabled()
  })

  it('keeps separate layouts per drawing style', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(screen.getByRole('button', { name: '1 big panel' }))
    expect(within(stage).queryByText('Panel 2')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Manga' }))
    expect(within(stage).getByText('Panel 1')).toBeInTheDocument()
    expect(within(stage).getByText('Panel 3')).toBeInTheDocument() // still 3-across, untouched by the Comic change

    await user.click(screen.getByRole('button', { name: 'Comic book' }))
    expect(within(stage).queryByText('Panel 2')).not.toBeInTheDocument() // Comic's 1-big-panel choice was preserved
  })

  it('lets a signed-out visitor generate images and upload their own picture, but prompts them to log in for PDFs/video', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    expect(await screen.findByText(/upload a picture/i)).toBeInTheDocument()
    expect(screen.getByText(/log in to also upload pdfs/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()

    const input = screen.getByLabelText(/upload a picture/i) as HTMLInputElement
    expect(input.accept).toBe('image/png,image/jpeg,image/webp')
  })

  it('lets a signed-out visitor upload their own picture without an account', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    const input = screen.getByLabelText(/upload a picture/i) as HTMLInputElement
    const imageFile = new File([new Uint8Array(1024)], 'photo.png', { type: 'image/png' })
    await user.upload(input, imageFile)

    // Kept as a data: URL in the browser rather than uploaded to Storage,
    // which needs a signed-in owner — so no network call happens at all.
    const img = await within(stage).findByAltText('')
    expect(img.getAttribute('src')).toMatch(/^data:image\/png/)
    expect(uploadMock).not.toHaveBeenCalled()
  })

  it('still asks a signed-out visitor to log in for a PDF or video file', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    const input = screen.getByLabelText(/upload a picture/i) as HTMLInputElement
    // The picker's accept filter would normally steer a signed-out visitor
    // away from a PDF, but a determined user (drag-and-drop, "all files")
    // can still hand one to the input — the app must reject it itself.
    Object.defineProperty(input, 'files', {
      value: [new File([new Uint8Array(1024)], 'story.pdf', { type: 'application/pdf' })],
      configurable: true,
    })
    fireEvent.change(input)

    expect(await screen.findByText(/log in to upload a pdf or video/i)).toBeInTheDocument()
    expect(within(stage).queryByAltText('')).not.toBeInTheDocument()
    expect(uploadMock).not.toHaveBeenCalled()
  })

  it('shows upload tools for a signed-in visitor', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    expect(await screen.findByText(/upload image/i)).toBeInTheDocument()
  })

  it('links to Unsplash for free reference photos, even signed out', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    const link = await screen.findByRole('link', { name: /unsplash/i })
    expect(link).toHaveAttribute('href', 'https://unsplash.com/s/photos/free-images')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('offers a Download button once a panel has art, and it works while signed out', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ image: 'https://example.com/generated.png' }),
    }) as unknown as typeof fetch
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    expect(screen.queryByRole('button', { name: /download pdf/i })).not.toBeInTheDocument()

    await user.click(within(stage).getByText('Panel 1'))
    await user.type(screen.getByPlaceholderText(/describe an image/i), 'a dragon')
    await user.click(screen.getByRole('button', { name: /generate/i }))

    const downloadBtn = await screen.findByRole('button', { name: /download pdf/i })
    await user.click(downloadBtn)

    await waitFor(() => expect(downloadBookAsPdfMock).toHaveBeenCalled())
    const [book, chapters] = downloadBookAsPdfMock.mock.calls[0]
    expect(book.title).toBe('My Book Panel')
    expect(chapters[0].pages).toEqual(['https://example.com/generated.png'])
  })

  it('offers a Download-as-Video button once a panel has art, failing gracefully where the browser has no video-export support', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ image: 'https://example.com/generated.png' }),
    }) as unknown as typeof fetch
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    expect(screen.queryByRole('button', { name: /download as video/i })).not.toBeInTheDocument()

    await user.click(within(stage).getByText('Panel 1'))
    await user.type(screen.getByPlaceholderText(/describe an image/i), 'a dragon')
    await user.click(screen.getByRole('button', { name: /generate/i }))

    const videoBtn = await screen.findByRole('button', { name: /download as video/i })
    await user.click(videoBtn)

    // jsdom has neither HTMLCanvasElement.captureStream nor MediaRecorder, so
    // this exercises the exact same "unsupported" fallback a real Safari
    // visitor without those APIs would hit — not a mock standing in for them.
    expect(await screen.findByText(/video export isn't supported/i)).toBeInTheDocument()
  })

  it('shows a link to the book after a successful publish', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ image: 'https://example.com/generated.png' }),
    }) as unknown as typeof fetch
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    await user.type(screen.getByPlaceholderText(/describe an image/i), 'a dragon')
    await user.click(screen.getByRole('button', { name: /generate/i }))
    await screen.findByRole('button', { name: /download pdf/i })

    const publishButton = await screen.findByRole('button', { name: /publish as new chapter/i })
    await user.click(publishButton)

    expect(await screen.findByText(/published to "my test book"\./i)).toBeInTheDocument()
    const viewBookLink = screen.getByRole('link', { name: /view your book/i })
    expect(viewBookLink).toHaveAttribute('href', '/library/book/book-1')
  })

  it('accepts a PDF in the panel-art file picker', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    const input = (await screen.findByLabelText(/upload image/i)) as HTMLInputElement
    expect(input.accept).toContain('application/pdf')
  })

  it('rasterizes an uploaded PDF and stores the resulting image as the panel art', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const rasterizedFile = new File(['png-bytes'], 'reference.png', { type: 'image/png' })
    rasterizeMock.mockResolvedValue(rasterizedFile)
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    const input = (await screen.findByLabelText(/upload image/i)) as HTMLInputElement
    const pdfFile = new File(['%PDF-1.4'], 'reference.pdf', { type: 'application/pdf' })
    await user.upload(input, pdfFile)

    await waitFor(() => expect(rasterizeMock).toHaveBeenCalledWith(pdfFile))
    await waitFor(() => expect(uploadMock).toHaveBeenCalled())
    const [, uploadedFile] = uploadMock.mock.calls[0]
    expect(uploadedFile).toBe(rasterizedFile)
    expect(await within(stage).findByAltText('')).toHaveAttribute('src', 'https://example.com/rasterized.png')
  })

  it('exposes #comic-planner and #manga-planner anchors so the header tabs land here', () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const { container } = renderWithIntl(<PanelBuilder />)
    expect(container.querySelector('#comic-planner')).toBeInTheDocument()
    expect(container.querySelector('#manga-planner')).toBeInTheDocument()
  })

  it('pre-selects Manga when landing via the #manga-planner anchor', () => {
    window.location.hash = '#manga-planner'
    getUserMock.mockResolvedValue({ data: { user: null } })
    renderWithIntl(<PanelBuilder />)

    expect(screen.getByRole('button', { name: 'Manga' })).toHaveStyle({ color: '#fff' })
    expect(screen.getByRole('button', { name: 'Comic book' })).not.toHaveStyle({ color: '#fff' })
  })

  it('shows a translated error and skips upload when the PDF cannot be read', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    rasterizeMock.mockRejectedValue(new Error('broken pdf'))
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    const input = (await screen.findByLabelText(/upload image/i)) as HTMLInputElement
    const pdfFile = new File(['%PDF-1.4'], 'reference.pdf', { type: 'application/pdf' })
    await user.upload(input, pdfFile)

    expect(await screen.findByText(/could not read that pdf/i)).toBeInTheDocument()
    expect(uploadMock).not.toHaveBeenCalled()
  })

  it('prompts a signed-out visitor to log in instead of showing the PDF-import control', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    renderWithIntl(<PanelBuilder />)

    expect(await screen.findByText(/log in to import a pdf/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/upload a pdf/i)).not.toBeInTheDocument()
  })

  it('shows the PDF-import control for a signed-in visitor', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    renderWithIntl(<PanelBuilder />)

    expect(await screen.findByLabelText(/upload a pdf/i)).toBeInTheDocument()
  })

  it('imports every page of a whole PDF as its own single-panel page', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const pages = [
      new File(['p1'], 'book-1.png', { type: 'image/png' }),
      new File(['p2'], 'book-2.png', { type: 'image/png' }),
      new File(['p3'], 'book-3.png', { type: 'image/png' }),
    ]
    rasterizePagesMock.mockResolvedValue(pages)
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    const input = (await screen.findByLabelText(/upload a pdf/i)) as HTMLInputElement
    const pdfFile = new File(['%PDF-1.4'], 'my-book.pdf', { type: 'application/pdf' })
    await user.upload(input, pdfFile)

    await waitFor(() => expect(rasterizePagesMock).toHaveBeenCalledWith(pdfFile, 30))
    await waitFor(() => expect(uploadMock).toHaveBeenCalledTimes(3))
    expect(await within(stage).findByAltText('')).toHaveAttribute('src', 'https://example.com/rasterized.png')
    expect(within(stage).queryByText('Panel 2')).not.toBeInTheDocument()
  })

  it('shows a translated error and imports nothing when the whole-PDF import cannot be read', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    rasterizePagesMock.mockRejectedValue(new Error('broken pdf'))
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)

    const input = (await screen.findByLabelText(/upload a pdf/i)) as HTMLInputElement
    const pdfFile = new File(['%PDF-1.4'], 'my-book.pdf', { type: 'application/pdf' })
    await user.upload(input, pdfFile)

    expect(await screen.findByText(/could not read that pdf/i)).toBeInTheDocument()
    expect(uploadMock).not.toHaveBeenCalled()
  })

  it('shows a translated error when an imported page fails to save', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    rasterizePagesMock.mockResolvedValue([new File(['p1'], 'book-1.png', { type: 'image/png' })])
    uploadMock.mockResolvedValueOnce({ error: { message: 'boom' } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)

    const input = (await screen.findByLabelText(/upload a pdf/i)) as HTMLInputElement
    const pdfFile = new File(['%PDF-1.4'], 'my-book.pdf', { type: 'application/pdf' })
    await user.upload(input, pdfFile)

    expect(await screen.findByText(/could not save those pages/i)).toBeInTheDocument()
  })

  it('accepts video files in the panel-art file picker', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    const input = (await screen.findByLabelText(/upload image/i)) as HTMLInputElement
    expect(input.accept).toContain('video/mp4')
    expect(input.accept).toContain('video/webm')
  })

  it('uploads a video as panel art and renders it as a looping, muted video instead of a static image', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    getPublicUrlMock.mockReturnValueOnce({ data: { publicUrl: 'https://example.com/panel-clip.mp4' } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    const input = (await screen.findByLabelText(/upload image/i)) as HTMLInputElement
    const videoFile = new File([new Uint8Array(1024)], 'clip.mp4', { type: 'video/mp4' })
    await user.upload(input, videoFile)

    await waitFor(() => expect(uploadMock).toHaveBeenCalled())
    const video = stage.querySelector('video') as HTMLVideoElement
    expect(video).toBeTruthy()
    expect(video).toHaveAttribute('src', 'https://example.com/panel-clip.mp4')
    expect(video).toHaveAttribute('autoplay')
    expect(video).toHaveAttribute('loop')
    // React sets `muted` as a live DOM property rather than an HTML attribute
    // (the attribute only controls the *default* muted state) — so check the
    // property, not `hasAttribute`.
    expect(video.muted).toBe(true)
    expect(within(stage).queryByAltText('')).not.toBeInTheDocument()
  })

  it('accepts a video bigger than the 10MB image cap, up to its own 50MB limit', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    const input = (await screen.findByLabelText(/upload image/i)) as HTMLInputElement
    const bigVideo = new File([new Uint8Array(20 * 1024 * 1024)], 'clip.mp4', { type: 'video/mp4' })
    await user.upload(input, bigVideo)

    await waitFor(() => expect(uploadMock).toHaveBeenCalled())
    expect(screen.queryByText(/must be a png/i)).not.toBeInTheDocument()
  })

  it('rejects a video over its 50MB limit', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    const input = (await screen.findByLabelText(/upload image/i)) as HTMLInputElement
    const hugeVideo = new File([new Uint8Array(51 * 1024 * 1024)], 'clip.mp4', { type: 'video/mp4' })
    await user.upload(input, hugeVideo)

    expect(await screen.findByText(/must be a png/i)).toBeInTheDocument()
    expect(uploadMock).not.toHaveBeenCalled()
  })

  it('prompts a signed-out visitor to log in instead of showing voiceover controls', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    expect(await screen.findByText(/log in to add a voiceover/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /record voiceover/i })).not.toBeInTheDocument()
  })

  it('uploads a voiceover audio file and shows a playback control for it', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    getPublicUrlMock.mockReturnValueOnce({ data: { publicUrl: 'https://example.com/voiceover.mp3' } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    const input = (await screen.findByLabelText(/upload audio/i)) as HTMLInputElement
    expect(input.accept).toContain('audio/mpeg')

    const audioFile = new File([new Uint8Array(1024)], 'line.mp3', { type: 'audio/mpeg' })
    await user.upload(input, audioFile)

    await waitFor(() => expect(uploadMock).toHaveBeenCalled())
    const player = document.querySelector('audio') as HTMLAudioElement
    expect(player).toBeTruthy()
    expect(player).toHaveAttribute('src', 'https://example.com/voiceover.mp3')
    expect(screen.getByRole('button', { name: /remove audio/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^upload audio$/i })).not.toBeInTheDocument()
  })

  it('rejects an audio file of the wrong type', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    const input = (await screen.findByLabelText(/upload audio/i)) as HTMLInputElement
    // `accept` is only a client-side hint — userEvent.upload itself enforces
    // it and would silently drop this file, so bypass it the same way a
    // picker set to "All Files" would, to test the component's own check.
    const badFile = new File(['not audio'], 'notes.txt', { type: 'text/plain' })
    Object.defineProperty(input, 'files', { value: [badFile], configurable: true })
    fireEvent.change(input)

    expect(await screen.findByText(/must be an mp3/i)).toBeInTheDocument()
    expect(uploadMock).not.toHaveBeenCalled()
  })

  it('records a voiceover from the microphone and uploads it once stopped', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    getPublicUrlMock.mockReturnValueOnce({ data: { publicUrl: 'https://example.com/recorded.webm' } })

    const stopTrack = vi.fn()
    const getUserMedia = vi.fn().mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] })
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true })

    class FakeMediaRecorder {
      state: 'inactive' | 'recording' = 'inactive'
      mimeType = 'audio/webm'
      ondataavailable: ((e: { data: Blob }) => void) | null = null
      onstop: (() => void) | null = null
      start() {
        this.state = 'recording'
      }
      stop() {
        this.state = 'inactive'
        this.ondataavailable?.({ data: new Blob(['fake-audio'], { type: 'audio/webm' }) })
        this.onstop?.()
      }
    }
    vi.stubGlobal('MediaRecorder', FakeMediaRecorder)

    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    const recordButton = await screen.findByRole('button', { name: /record voiceover/i })
    await user.click(recordButton)

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true })
    const stopButton = await screen.findByRole('button', { name: /stop recording/i })
    await user.click(stopButton)

    await waitFor(() => expect(uploadMock).toHaveBeenCalled())
    expect(stopTrack).toHaveBeenCalled()
    const player = document.querySelector('audio') as HTMLAudioElement
    expect(player).toHaveAttribute('src', 'https://example.com/recorded.webm')

    vi.unstubAllGlobals()
  })

  it('shows a friendly error when microphone access is denied', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const getUserMedia = vi.fn().mockRejectedValue(new Error('Permission denied'))
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true })

    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    await user.click(await screen.findByRole('button', { name: /record voiceover/i }))

    expect(await screen.findByText(/couldn't access your microphone/i)).toBeInTheDocument()
    expect(uploadMock).not.toHaveBeenCalled()
  })

  it('clearing a panel also removes its voiceover', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    getPublicUrlMock.mockReturnValueOnce({ data: { publicUrl: 'https://example.com/voiceover.mp3' } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    const input = (await screen.findByLabelText(/upload audio/i)) as HTMLInputElement
    await user.upload(input, new File([new Uint8Array(1024)], 'line.mp3', { type: 'audio/mpeg' }))
    await waitFor(() => expect(document.querySelector('audio')).toBeTruthy())

    await user.click(screen.getByRole('button', { name: /clear panel/i }))
    expect(document.querySelector('audio')).not.toBeInTheDocument()
  })

  async function generateImageOnPanel1(user: ReturnType<typeof userEvent.setup>, stage: HTMLElement) {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ image: 'https://example.com/generated.png' }),
    }) as unknown as typeof fetch
    await user.click(within(stage).getByText('Panel 1'))
    await user.type(screen.getByPlaceholderText(/describe an image/i), 'a dragon')
    await user.click(screen.getByRole('button', { name: /generate/i }))
    await screen.findByLabelText('Zoom')
  }

  it('zooms a panel picture with the zoom slider, and resets it back', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()
    await generateImageOnPanel1(user, stage)

    expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument()

    const zoomSlider = screen.getByLabelText('Zoom') as HTMLInputElement
    expect(zoomSlider.value).toBe('1')

    fireEvent.change(zoomSlider, { target: { value: '2' } })
    expect(screen.getByText('200%')).toBeInTheDocument()
    const img = within(stage).getByAltText('')
    expect(img).toHaveStyle({ transform: 'scale(2) translate(0%, 0%)' })

    await user.click(screen.getByRole('button', { name: /reset/i }))
    expect((screen.getByLabelText('Zoom') as HTMLInputElement).value).toBe('1')
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('drags a panel picture to reposition it, without deselecting the panel', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()
    await generateImageOnPanel1(user, stage)

    const panelDiv = within(stage).getByText('Panel 1').closest('div')!
    panelDiv.getBoundingClientRect = () =>
      ({ width: 100, height: 100, x: 0, y: 0, top: 0, left: 0, right: 100, bottom: 100, toJSON: () => {} }) as DOMRect

    fireEvent.pointerDown(panelDiv, { pointerId: 7, clientX: 50, clientY: 50 })
    fireEvent.pointerMove(panelDiv, { pointerId: 7, clientX: 70, clientY: 40 })
    fireEvent.pointerUp(panelDiv, { pointerId: 7, clientX: 70, clientY: 40 })

    const img = within(stage).getByAltText('')
    expect(img).toHaveStyle({ transform: 'scale(1) translate(20%, -10%)' })
    // Images are natively draggable in browsers by default, which hijacks
    // pointer events mid-gesture and silently breaks this feature — confirmed
    // live in a real browser, where a real mouse drag stalled after ~12px
    // instead of tracking the full movement, until this was set.
    expect(img).toHaveAttribute('draggable', 'false')
    // A real drag repositions the picture — it should not also deselect the
    // panel, which would hide the very controls used to reposition it.
    expect(screen.getByLabelText('Zoom')).toBeInTheDocument()
  })

  it('a plain tap (no movement) still selects and deselects a panel with a picture', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()
    await generateImageOnPanel1(user, stage)

    const panelDiv = within(stage).getByText('Panel 1').closest('div')!
    panelDiv.getBoundingClientRect = () =>
      ({ width: 100, height: 100, x: 0, y: 0, top: 0, left: 0, right: 100, bottom: 100, toJSON: () => {} }) as DOMRect

    fireEvent.pointerDown(panelDiv, { pointerId: 9, clientX: 50, clientY: 50 })
    fireEvent.pointerUp(panelDiv, { pointerId: 9, clientX: 50, clientY: 50 })
    expect(screen.queryByLabelText('Zoom')).not.toBeInTheDocument()
  })

  async function addSticker(user: ReturnType<typeof userEvent.setup>, fileName = 'sticker.png') {
    const input = screen.getByLabelText(/add sticker/i) as HTMLInputElement
    await user.upload(input, new File([new Uint8Array(64)], fileName, { type: 'image/png' }))
    await screen.findByLabelText(/sticker size/i)
  }

  it('adds a sticker to the page, centered and auto-selected', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await addSticker(user)

    const img = within(stage).getByAltText('')
    expect(img.getAttribute('src')).toMatch(/^data:image\/png/)
    expect(img).toHaveAttribute('draggable', 'false')
    expect(img).toHaveStyle({ left: '50%', top: '50%', width: '22%' })
    expect((screen.getByLabelText(/sticker size/i) as HTMLInputElement).value).toBe('22')
  })

  it('drags a sticker to reposition it, without deselecting it', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()
    await addSticker(user)

    const img = within(stage).getByAltText('')
    const pageDiv = img.parentElement!
    pageDiv.getBoundingClientRect = () =>
      ({ width: 200, height: 200, x: 0, y: 0, top: 0, left: 0, right: 200, bottom: 200, toJSON: () => {} }) as DOMRect

    fireEvent.pointerDown(img, { pointerId: 5, clientX: 100, clientY: 100 })
    fireEvent.pointerMove(img, { pointerId: 5, clientX: 120, clientY: 80 })
    fireEvent.pointerUp(img, { pointerId: 5, clientX: 120, clientY: 80 })

    expect(img).toHaveStyle({ left: '60%', top: '40%' })
    expect(screen.getByLabelText(/sticker size/i)).toBeInTheDocument()
  })

  it('a plain tap (no movement) toggles a sticker selected, and tapping the page background deselects it', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()
    await addSticker(user)

    const img = within(stage).getByAltText('')
    fireEvent.pointerDown(img, { pointerId: 3, clientX: 50, clientY: 50 })
    fireEvent.pointerUp(img, { pointerId: 3, clientX: 50, clientY: 50 })
    expect(screen.queryByLabelText(/sticker size/i)).not.toBeInTheDocument()

    fireEvent.pointerDown(img, { pointerId: 4, clientX: 50, clientY: 50 })
    fireEvent.pointerUp(img, { pointerId: 4, clientX: 50, clientY: 50 })
    expect(screen.getByLabelText(/sticker size/i)).toBeInTheDocument()

    fireEvent.pointerDown(img.parentElement!)
    expect(screen.queryByLabelText(/sticker size/i)).not.toBeInTheDocument()
  })

  it('resizes a sticker with the size slider', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()
    await addSticker(user)

    const sizeSlider = screen.getByLabelText(/sticker size/i) as HTMLInputElement
    fireEvent.change(sizeSlider, { target: { value: '40' } })

    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(within(stage).getByAltText('')).toHaveStyle({ width: '40%' })
  })

  it('removes a sticker', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()
    await addSticker(user)

    await user.click(screen.getByRole('button', { name: /remove sticker/i }))

    expect(within(stage).queryByAltText('')).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/sticker size/i)).not.toBeInTheDocument()
  })

  it('caps stickers at 12 per page', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    const input = screen.getByLabelText(/add sticker/i) as HTMLInputElement
    for (let i = 0; i < 12; i++) {
      Object.defineProperty(input, 'files', {
        value: [new File([new Uint8Array(8)], `s${i}.png`, { type: 'image/png' })],
        configurable: true,
      })
      fireEvent.change(input)
      // eslint-disable-next-line no-await-in-loop
      await waitFor(() => expect(within(stage).getAllByAltText('')).toHaveLength(i + 1))
    }
    expect(input).toBeDisabled()

    Object.defineProperty(input, 'files', {
      value: [new File([new Uint8Array(8)], 'extra.png', { type: 'image/png' })],
      configurable: true,
    })
    fireEvent.change(input)

    expect(await screen.findByText(/up to 12 stickers/i)).toBeInTheDocument()
    expect(within(stage).getAllByAltText('')).toHaveLength(12)
  })

  it('deletes the current page, shifting later pages up, without touching the others', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    async function writeOnCurrentPage(text: string) {
      await user.click(within(stage).getByText('Panel 1'))
      await user.click(screen.getByRole('button', { name: /💬 Speech/ }))
      await user.type(screen.getByPlaceholderText('Type here…'), text)
    }

    await writeOnCurrentPage('First page')
    await user.click(screen.getByRole('button', { name: /next page/i }))
    await writeOnCurrentPage('Second page')
    await user.click(screen.getByRole('button', { name: /next page/i }))
    await writeOnCurrentPage('Third page')

    await user.click(screen.getByRole('button', { name: /previous page/i }))
    expect(screen.getByDisplayValue('Second page')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /delete page/i }))
    expect(window.confirm).toHaveBeenCalled()

    // "Second page" is gone for good, and "Third page" slid up into its slot —
    // page 1 is untouched, proving this removes one page, not the whole book.
    expect(screen.queryByDisplayValue('Second page')).not.toBeInTheDocument()
    expect(screen.getByDisplayValue('Third page')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /previous page/i }))
    expect(screen.getByDisplayValue('First page')).toBeInTheDocument()
  })

  it('does not delete the last remaining page', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    renderWithIntl(<PanelBuilder />)
    expect(screen.getByRole('button', { name: /delete page/i })).toBeDisabled()
  })

  it('shifts a page earlier or later, moving its content along with it', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    async function writeOnCurrentPage(text: string) {
      await user.click(within(stage).getByText('Panel 1'))
      await user.click(screen.getByRole('button', { name: /💬 Speech/ }))
      await user.type(screen.getByPlaceholderText('Type here…'), text)
    }

    await writeOnCurrentPage('First page')
    await user.click(screen.getByRole('button', { name: /next page/i }))
    await writeOnCurrentPage('Second page')
    await user.click(screen.getByRole('button', { name: /next page/i }))
    await writeOnCurrentPage('Third page')

    // Move the middle page ("Second page") one slot earlier.
    await user.click(screen.getByRole('button', { name: /previous page/i }))
    expect(screen.getByDisplayValue('Second page')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /move earlier/i }))

    // The move follows the page: still on "Second page", now leading at position 1.
    expect(screen.getByDisplayValue('Second page')).toBeInTheDocument()

    // "First page" and "Second page" swapped places; "Third page" is untouched.
    await user.click(screen.getByRole('button', { name: /next page/i }))
    expect(screen.getByDisplayValue('First page')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /next page/i }))
    expect(screen.getByDisplayValue('Third page')).toBeInTheDocument()
  })

  it('disables moving a page past either end', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)

    // A single page has nowhere to move in either direction.
    expect(screen.getByRole('button', { name: /move earlier/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /move later/i })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /next page/i }))
    // Now on page 2 of 2: later has nothing after it, earlier does.
    expect(screen.getByRole('button', { name: /move later/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /move earlier/i })).not.toBeDisabled()

    await user.click(screen.getByRole('button', { name: /previous page/i }))
    // Back on page 1 of 2: earlier has nothing before it, later does.
    expect(screen.getByRole('button', { name: /move earlier/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /move later/i })).not.toBeDisabled()
  })

  describe('draft save and restore', () => {
    beforeEach(() => {
      // A fresh in-memory IndexedDB per test — jsdom has none built in, and
      // this keeps each test's saved draft from leaking into the next.
      Object.defineProperty(window, 'indexedDB', { value: new IDBFactory(), configurable: true })
    })

    afterEach(() => {
      Reflect.deleteProperty(window, 'indexedDB')
    })

    it('saves a draft on demand and restores it after remounting, like after a refresh', async () => {
      getUserMock.mockResolvedValue({ data: { user: null } })
      const user = userEvent.setup()
      const { unmount } = renderWithIntl(<PanelBuilder />)
      const stage = getStage()

      await user.click(within(stage).getByText('Panel 1'))
      await user.click(screen.getByRole('button', { name: /💬 Speech/ }))
      await user.type(screen.getByPlaceholderText('Type here…'), 'Remember me')

      await user.click(screen.getByRole('button', { name: '💾 Save' }))
      expect(await screen.findByText(/saved/i)).toBeInTheDocument()

      unmount()

      renderWithIntl(<PanelBuilder />)
      expect(await screen.findByDisplayValue('Remember me')).toBeInTheDocument()
    })

    it('automatically saves in the background, without needing the button', async () => {
      getUserMock.mockResolvedValue({ data: { user: null } })
      const user = userEvent.setup()
      const { unmount } = renderWithIntl(<PanelBuilder />)
      const stage = getStage()

      await user.click(within(stage).getByText('Panel 1'))
      await user.click(screen.getByRole('button', { name: /💬 Speech/ }))
      await user.type(screen.getByPlaceholderText('Type here…'), 'Autosaved line')
      expect(screen.getByDisplayValue('Autosaved line')).toBeInTheDocument()

      // The autosave is debounced 1200ms after the last keystroke — wait past
      // that (real time, not a fake timer) so the full, final text is what
      // actually lands in the background save, not an in-progress keystroke.
      await new Promise((resolve) => setTimeout(resolve, 1500))
      expect(screen.getByText(/✓ Saved/)).toBeInTheDocument()

      unmount()

      renderWithIntl(<PanelBuilder />)
      expect(await screen.findByDisplayValue('Autosaved line')).toBeInTheDocument()
    })
  })
})
