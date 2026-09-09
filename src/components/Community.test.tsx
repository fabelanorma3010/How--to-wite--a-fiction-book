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

// A minimal, per-table chainable query builder for the read side (feed
// loading still goes straight to Supabase from the browser).
function chainableFor(table: string) {
  const builder: Record<string, unknown> = {}
  const self = () => builder
  ;['select', 'eq', 'in', 'order', 'limit', 'not', 'lte'].forEach((method) => {
    builder[method] = self
  })
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

// Mutations now go through Server Actions — mock the module directly.
const toggleLikeMock = vi.fn()
const addCommentMock = vi.fn()
vi.mock('../lib/communityActions', () => ({
  toggleLike: (...args: unknown[]) => toggleLikeMock(...args),
  addComment: (...args: unknown[]) => addCommentMock(...args),
  deleteComment: vi.fn().mockResolvedValue({ ok: true }),
  submitReport: vi.fn().mockResolvedValue({ ok: true }),
  createPost: vi.fn(),
}))

describe('Community', () => {
  afterEach(() => vi.clearAllMocks())

  it('shows the real error when liking a post fails, instead of failing silently', async () => {
    toggleLikeMock.mockResolvedValue({ error: 'relation "post_likes" does not exist' })
    const user = userEvent.setup()
    renderWithIntl(<Community />)

    const likeButton = await screen.findByRole('button', { name: /0 likes/i })
    await user.click(likeButton)

    expect(await screen.findByRole('alert')).toHaveTextContent('relation "post_likes" does not exist')
    expect(toggleLikeMock).toHaveBeenCalledWith('post-1', true)
  })

  it('keeps the like showing once the Server Action confirms it', async () => {
    toggleLikeMock.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    renderWithIntl(<Community />)

    const likeButton = await screen.findByRole('button', { name: /0 likes/i })
    await user.click(likeButton)

    await waitFor(() => expect(likeButton).toHaveAttribute('aria-pressed', 'true'))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('posts a comment via the Server Action and shows it in the thread', async () => {
    addCommentMock.mockResolvedValue({
      ok: true,
      comment: { id: 'c1', post_id: 'post-1', user_id: 'u1', body: 'Nice work!', created_at: '2026-01-01T00:01:00.000Z' },
    })
    const user = userEvent.setup()
    renderWithIntl(<Community />)

    const commentToggle = await screen.findByRole('button', { name: /0 comments/i })
    await user.click(commentToggle)

    const textarea = screen.getByPlaceholderText(/reply/i)
    await user.type(textarea, 'Nice work!')
    await user.click(screen.getByRole('button', { name: 'Reply' }))

    expect(await screen.findByText('Nice work!')).toBeInTheDocument()
    expect(addCommentMock).toHaveBeenCalledWith('post-1', 'Nice work!')
  })
})
