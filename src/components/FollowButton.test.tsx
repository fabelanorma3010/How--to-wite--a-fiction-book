import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithIntl } from '../test/renderWithIntl'
import FollowButton from './FollowButton'

const fromMock = vi.fn()

vi.mock('../lib/supabase/client', () => ({
  createClient: () => ({ from: fromMock }),
}))

describe('FollowButton', () => {
  afterEach(() => vi.clearAllMocks())

  it('renders nothing for a signed-out visitor or on your own profile', () => {
    const { container: signedOut } = renderWithIntl(
      <FollowButton viewerId={null} profileId="p1" initialFollowing={false} />,
    )
    expect(signedOut).toBeEmptyDOMElement()

    const { container: ownProfile } = renderWithIntl(
      <FollowButton viewerId="p1" profileId="p1" initialFollowing={false} />,
    )
    expect(ownProfile).toBeEmptyDOMElement()
  })

  it('follows on click, optimistically, when the insert succeeds', async () => {
    fromMock.mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) })
    const user = userEvent.setup()
    renderWithIntl(<FollowButton viewerId="viewer1" profileId="p1" initialFollowing={false} />)

    await user.click(screen.getByRole('button', { name: /^follow$/i }))
    expect(await screen.findByRole('button', { name: /following/i })).toBeInTheDocument()
  })

  it('shows an error and reverts the button when the insert fails', async () => {
    // Supabase's PostgrestError is a real Error subclass (not a plain object),
    // so the component's `err instanceof Error` check is what actually runs.
    fromMock.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: new Error('permission denied') }),
    })
    const user = userEvent.setup()
    renderWithIntl(<FollowButton viewerId="viewer1" profileId="p1" initialFollowing={false} />)

    await user.click(screen.getByRole('button', { name: /^follow$/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('permission denied')
    expect(screen.getByRole('button', { name: /^follow$/i })).toBeInTheDocument()
  })
})
