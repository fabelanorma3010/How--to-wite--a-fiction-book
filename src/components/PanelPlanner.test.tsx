import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithIntl } from '../test/renderWithIntl'
import PanelPlanner from './PanelPlanner'

const getUserMock = vi.fn()

// Chainable query stub: every builder method returns itself, and awaiting
// (or `.then`-ing) it resolves with an empty books list — enough for the
// signed-in books-fetch effect to settle without throwing.
function chainableEmptyQuery() {
  const builder: Record<string, unknown> = {}
  const self = () => builder
  builder.select = self
  builder.eq = self
  builder.order = self
  builder.then = (resolve: (v: { data: unknown[]; error: null }) => void) => resolve({ data: [], error: null })
  return builder
}

vi.mock('../lib/supabase/client', () => ({
  createClient: () => ({ auth: { getUser: getUserMock }, from: () => chainableEmptyQuery() }),
}))

describe('PanelPlanner', () => {
  afterEach(() => vi.clearAllMocks())

  it('selecting a panel opens its editor, and a second click on it closes it', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelPlanner mode="comic" />)

    const panelOne = screen.getByRole('button', { name: /edit panel 1/i })
    await user.click(panelOne)
    expect(await screen.findByText(/editing panel 1/i)).toBeInTheDocument()

    await user.click(panelOne)
    expect(screen.queryByText(/editing panel 1/i)).not.toBeInTheDocument()
  })

  it('toggles a sticker onto the selected panel from its editor, and removes it on a second click', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelPlanner mode="comic" />)

    const panelOne = screen.getByRole('button', { name: /edit panel 1/i })
    await user.click(panelOne)
    expect(panelOne).not.toHaveTextContent('💥')

    const stickerButton = screen.getAllByRole('button', { name: '💥' })[0]
    await user.click(stickerButton)
    expect(panelOne).toHaveTextContent('💥')

    await user.click(stickerButton)
    expect(panelOne).not.toHaveTextContent('💥')
  })

  it('clears stickers and closes the editor when switching to a different example', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelPlanner mode="comic" />)

    await user.click(screen.getByRole('button', { name: /edit panel 1/i }))
    await user.click(screen.getAllByRole('button', { name: '⭐' })[0])
    expect(screen.getByRole('button', { name: /edit panel 1/i })).toHaveTextContent('⭐')

    await user.click(screen.getByRole('button', { name: 'Rooftop chase' }))
    expect(screen.queryByText(/editing panel/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit panel 1/i })).not.toHaveTextContent('⭐')
  })

  it("editing a panel's text in its editor updates what the panel shows", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelPlanner mode="comic" />)

    await user.click(screen.getByRole('button', { name: /edit panel 1/i }))
    const box = screen.getByLabelText(/panel text/i)
    await user.clear(box)
    await user.type(box, 'A brand new caption for this panel.')
    await user.tab() // blur commits the edit

    expect(screen.getByRole('button', { name: /edit panel 1/i })).toHaveTextContent(
      'A brand new caption for this panel.',
    )
  })

  it('lets a signed-out visitor generate images, but prompts them to log in to upload', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelPlanner mode="comic" />)

    await user.click(screen.getByRole('button', { name: /edit panel 1/i }))
    expect(await screen.findByText(/log in to upload/i)).toBeInTheDocument()
    expect(screen.queryByText(/^upload image$/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
  })

  it('shows image tools for a signed-in visitor', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const user = userEvent.setup()
    renderWithIntl(<PanelPlanner mode="comic" />)

    await user.click(screen.getByRole('button', { name: /edit panel 1/i }))
    expect(await screen.findByText(/upload image/i)).toBeInTheDocument()
  })
})
