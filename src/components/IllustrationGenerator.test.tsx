import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithIntl } from '../test/renderWithIntl'
import IllustrationGenerator from './IllustrationGenerator'

const getUserMock = vi.fn()

vi.mock('../lib/supabase/client', () => ({
  createClient: () => ({ auth: { getUser: getUserMock } }),
}))

function renderGenerator() {
  return renderWithIntl(<IllustrationGenerator selected="comic" onSelect={vi.fn()} />)
}

describe('IllustrationGenerator', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('shows a disabled sign-in prompt and never calls the image API when signed out', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    renderGenerator()

    const button = await screen.findByRole('button', { name: /log in/i })
    expect(button).toBeDisabled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('generates and displays an image for a signed-in visitor', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ image: 'data:image/png;base64,abc123' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()

    const { container } = renderGenerator()
    const button = await screen.findByRole('button', { name: /generate image/i })
    const idea = container.querySelector('p.text-lg')?.textContent

    await user.click(button)

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/generate-illustration',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ prompt: idea }),
      }),
    )
    expect(await screen.findByRole('img')).toHaveAttribute('src', 'data:image/png;base64,abc123')
  })

  it('shows the server-provided error message on failure', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Daily image limit reached' }) }),
    )
    const user = userEvent.setup()

    renderGenerator()
    await user.click(await screen.findByRole('button', { name: /generate image/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Daily image limit reached')
  })
})
