import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithIntl } from '../test/renderWithIntl'
import PanelBuilder from './PanelBuilder'

const getUserMock = vi.fn()

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
  createClient: () => ({ auth: { getUser: getUserMock }, from: () => chainableEmptyQuery() }),
}))

function getStage() {
  return screen.getByRole('button', { name: /previous page/i }).parentElement!
}

describe('PanelBuilder', () => {
  afterEach(() => vi.clearAllMocks())

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
})
