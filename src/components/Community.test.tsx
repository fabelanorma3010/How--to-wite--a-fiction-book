import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithIntl } from '../test/renderWithIntl'
import Community from './Community'

const getUserMock = vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } })
const onAuthStateChangeMock = vi.fn((callback: (event: string, session: unknown) => void) => {
  callback('SIGNED_IN', { user: { id: 'u1', email: 'writer@example.com', user_metadata: { name: 'Writer One' } } })
  return { data: { subscription: { unsubscribe: vi.fn() } } }
})

const post = {
  id: 'post-1',
  title: 'My first chapter',
  body: 'Just shared something new!',
  category: 'comic',
  published_at: '2026-01-01T00:00:00.000Z',
  user_id: 'author-1',
}

const likeInsertMock = vi.fn()

// A minimal, per-table chainable query builder: every method returns itself so
// any chain shape resolves, and awaiting it resolves with that table's canned
// response (or an empty list by default).
function chainableFor(table: string) {
  const builder: Record<string, unknown> = {}
  const self = () => builder
  ;['select', 'eq', 'in', 'order', 'limit', 'not', 'lte'].forEach((method) => {
    builder[method] = self
  })
  builder.single = () => Promise.resolve({ data: null, error: null })
  builder.insert = (row: unknown) => {
    if (table === 'post_likes') return likeInsertMock(row)
    return { select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }
  }
  builder.delete = self
  builder.then = (resolve: (v: { data: unknown[]; error: null }) => void) => {
    if (table === 'posts') return resolve({ data: [post], error: null })
    if (table === 'public_profiles') return resolve({ data: [{ id: 'author-1', name: 'Author One' }], error: null })
    return resolve({ data: [], error: null })
  }
  return builder
}

vi.mock('../lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser: getUserMock, onAuthStateChange: onAuthStateChangeMock },
    from: (table: string) => chainableFor(table),
  }),
}))

describe('Community', () => {
  afterEach(() => vi.clearAllMocks())

  it('shows the real error when liking a post fails, instead of failing silently', async () => {
    likeInsertMock.mockResolvedValue({ error: new Error('relation "post_likes" does not exist') })
    const user = userEvent.setup()
    renderWithIntl(<Community />)

    const likeButton = await screen.findByRole('button', { name: /0 likes/i })
    await user.click(likeButton)

    expect(await screen.findByRole('alert')).toHaveTextContent('relation "post_likes" does not exist')
  })

  it('keeps the like showing once the backend confirms it', async () => {
    likeInsertMock.mockResolvedValue({ error: null })
    const user = userEvent.setup()
    renderWithIntl(<Community />)

    const likeButton = await screen.findByRole('button', { name: /0 likes/i })
    await user.click(likeButton)

    await waitFor(() => expect(likeButton).toHaveAttribute('aria-pressed', 'true'))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
