import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
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

// The current panel's text also always appears again, further down, inside the
// copyable "Panel breakdown" script (which always lists every panel). Scoping
// to the slideshow stage itself keeps assertions about what's on screen right
// now unambiguous.
function getStage() {
  return screen.getByRole('button', { name: /previous panel/i }).parentElement!
}

describe('PanelPlanner', () => {
  afterEach(() => vi.clearAllMocks())

  it('shows the first panel by default, with a cover one step back, and steps through panels with Next/Previous', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelPlanner mode="comic" />)
    const stage = getStage()

    expect(within(stage).getByPlaceholderText(/the vault/i)).toBeInTheDocument()
    const prev = within(stage).getByRole('button', { name: /previous panel/i })
    const next = within(stage).getByRole('button', { name: /next panel/i })
    expect(prev).not.toBeDisabled() // one step back reaches the cover slide
    expect(next).not.toBeDisabled()

    await user.click(next)
    expect(within(stage).getByPlaceholderText(/the drop/i)).toBeInTheDocument()
    expect(within(stage).queryByPlaceholderText(/the vault/i)).not.toBeInTheDocument()

    await user.click(prev)
    expect(within(stage).getByPlaceholderText(/the vault/i)).toBeInTheDocument()

    await user.click(prev)
    expect(within(stage).getByText(/cover/i)).toBeInTheDocument()
    expect(screen.getByText(/cover art/i)).toBeInTheDocument()
    expect(prev).toBeDisabled()
  })

  it('toggles a sticker onto the current panel from its editor, and removes it on a second click', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelPlanner mode="comic" />)

    const stickerButton = screen.getAllByRole('button', { name: '💥' })[0]
    expect(screen.getAllByText('💥')).toHaveLength(1)

    await user.click(stickerButton)
    expect(stickerButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByText('💥').length).toBeGreaterThan(1)

    await user.click(stickerButton)
    expect(stickerButton).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getAllByText('💥')).toHaveLength(1)
  })

  it('clears stickers and returns to the first panel when switching to a different example', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelPlanner mode="comic" />)
    const stage = getStage()

    await user.click(screen.getAllByRole('button', { name: '⭐' })[0])
    expect(screen.getAllByText('⭐').length).toBeGreaterThan(1)

    await user.click(screen.getByRole('button', { name: 'Rooftop chase' }))
    expect(screen.getAllByText('⭐')).toHaveLength(1)
    expect(within(stage).getByPlaceholderText(/rooftops/i)).toBeInTheDocument()
  })

  it("editing a panel's text updates what the current panel shows", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelPlanner mode="comic" />)
    const stage = getStage()

    const box = screen.getByLabelText(/panel text/i)
    await user.clear(box)
    await user.type(box, 'A brand new caption for this panel.')
    await user.tab() // blur commits the edit

    expect(within(stage).getByDisplayValue('A brand new caption for this panel.')).toBeInTheDocument()
  })

  it('does not commit the generated example as real text just from viewing and navigating away', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const user = userEvent.setup()
    renderWithIntl(<PanelPlanner mode="comic" />)

    const box = screen.getByLabelText<HTMLTextAreaElement>(/panel text/i)
    expect(box.value).toBe('')
    expect(box.placeholder.length).toBeGreaterThan(0)

    await user.tab() // blur without typing anything
    await user.click(screen.getByRole('button', { name: /next panel/i }))
    await user.click(screen.getByRole('button', { name: /previous panel/i }))

    // Back on the first panel, the draft should still be empty, not the example re-committed as if typed.
    expect(screen.getByLabelText<HTMLTextAreaElement>(/panel text/i).value).toBe('')
  })

  it('lets a signed-out visitor generate images, but prompts them to log in to upload', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    renderWithIntl(<PanelPlanner mode="comic" />)

    expect(await screen.findByText(/log in to upload/i)).toBeInTheDocument()
    expect(screen.queryByText(/^upload image$/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
  })

  it('shows image tools for a signed-in visitor', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    renderWithIntl(<PanelPlanner mode="comic" />)

    expect(await screen.findByText(/upload image/i)).toBeInTheDocument()
  })
})
