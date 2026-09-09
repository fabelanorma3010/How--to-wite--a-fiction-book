import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithIntl } from '../test/renderWithIntl'
import PanelBuilder from './PanelBuilder'

const getUserMock = vi.fn()
const uploadMock = vi.fn().mockResolvedValue({ error: null })
const getPublicUrlMock = vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/rasterized.png' } })
const rasterizeMock = vi.fn()

// Chainable query stub: every builder method returns itself, and awaiting
// (or `.then`-ing) it resolves with an empty list — enough for the signed-in
// books-fetch effect to settle without throwing.
function chainableEmptyQuery() {
  const builder: Record<string, unknown> = {}
  const self = () => builder
  builder.select = self
  builder.eq = self
  builder.order = self
  builder.limit = self
  builder.then = (resolve: (v: { data: unknown[]; error: null }) => void) => resolve({ data: [], error: null })
  return builder
}

vi.mock('../lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser: getUserMock },
    from: () => chainableEmptyQuery(),
    storage: { from: () => ({ upload: uploadMock, getPublicUrl: getPublicUrlMock }) },
  }),
}))

vi.mock('../lib/pdfToImage', () => ({
  rasterizePdfFirstPage: (file: File) => rasterizeMock(file),
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

  it('lets a signed-out visitor generate images, but prompts them to log in to upload', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    expect(await screen.findByText(/log in to upload/i)).toBeInTheDocument()
    expect(screen.queryByText(/^upload image$/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
  })

  it('shows upload tools for a signed-in visitor', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const user = userEvent.setup()
    renderWithIntl(<PanelBuilder />)
    const stage = getStage()

    await user.click(within(stage).getByText('Panel 1'))
    expect(await screen.findByText(/upload image/i)).toBeInTheDocument()
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
})
