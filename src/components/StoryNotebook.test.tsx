import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithIntl } from '../test/renderWithIntl'
import StoryNotebook from './StoryNotebook'

function makeNotebooksTable(content = '') {
  const selectChain = {
    eq: vi.fn(() => selectChain),
    maybeSingle: vi.fn().mockResolvedValue({ data: content ? { content } : null }),
  }
  return {
    select: vi.fn(() => selectChain),
    upsert: vi.fn().mockResolvedValue({ error: null }),
  }
}

function makeVersionsTable(seed: { content: string; created_at: string } | null, list: unknown[]) {
  const selectChain = {
    eq: vi.fn(() => selectChain),
    order: vi.fn(() => selectChain),
    limit: vi.fn(() => selectChain),
    maybeSingle: vi.fn().mockResolvedValue({ data: seed }),
    then: (resolve: (value: { data: unknown[] }) => void) => Promise.resolve({ data: list }).then(resolve),
  }
  return {
    select: vi.fn(() => selectChain),
    insert: vi.fn().mockResolvedValue({ error: null }),
    _selectChain: selectChain,
  }
}

function makeImagesTable() {
  return {
    select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn().mockResolvedValue({ data: [] }) })) })),
    insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: null, error: null }) })) })),
    delete: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({}) })),
  }
}

function mockSupabaseClient({
  signedIn = false,
  notebookContent = '',
  seedVersion = null as { content: string; created_at: string } | null,
  versions = [] as unknown[],
} = {}) {
  const notebooks = makeNotebooksTable(notebookContent)
  const notebookVersions = makeVersionsTable(seedVersion, versions)
  const notebookImages = makeImagesTable()
  const tables: Record<string, unknown> = { notebooks, notebook_versions: notebookVersions, notebook_images: notebookImages }

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: signedIn ? { id: 'user-1' } : null } }),
    },
    from: vi.fn((table: string) => tables[table]),
    storage: {
      from: vi.fn(() => ({
        createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://example.com/x.png' } }),
        upload: vi.fn().mockResolvedValue({ error: null }),
        remove: vi.fn().mockResolvedValue({}),
      })),
    },
    _notebooks: notebooks,
    _notebookVersions: notebookVersions,
  }
}

vi.mock('../lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

describe('StoryNotebook history', () => {
  afterEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
  })

  it('shows no History button when signed out', async () => {
    const { createClient } = await import('../lib/supabase/client')
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient({ signedIn: false }) as never)

    renderWithIntl(<StoryNotebook />)

    await waitFor(() => expect(screen.getByPlaceholderText(/once upon a time/i)).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: /history/i })).not.toBeInTheDocument()
  })

  it('shows the History button once signed in, with an empty state when there are no earlier drafts', async () => {
    const { createClient } = await import('../lib/supabase/client')
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient({ signedIn: true, versions: [] }) as never)

    renderWithIntl(<StoryNotebook />)

    const historyButton = await screen.findByRole('button', { name: /history/i })
    await userEvent.click(historyButton)

    expect(await screen.findByText(/no earlier drafts yet/i)).toBeInTheDocument()
  })

  it('lists earlier drafts and restores one back into the notebook', async () => {
    const { createClient } = await import('../lib/supabase/client')
    const supabase = mockSupabaseClient({
      signedIn: true,
      notebookContent: 'Today’s draft',
      versions: [{ id: 1, content: 'Yesterday’s draft', created_at: '2026-09-01T12:00:00.000Z' }],
    })
    vi.mocked(createClient).mockReturnValue(supabase as never)
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderWithIntl(<StoryNotebook />)

    const textarea = (await screen.findByPlaceholderText(/once upon a time/i)) as HTMLTextAreaElement
    await waitFor(() => expect(textarea.value).toBe('Today’s draft'))

    const historyButton = await screen.findByRole('button', { name: /history/i })
    await userEvent.click(historyButton)

    expect(await screen.findByText(/yesterday.s draft/i)).toBeInTheDocument()

    const restoreButton = screen.getByRole('button', { name: /restore/i })
    await userEvent.click(restoreButton)

    await waitFor(() => expect(textarea.value).toBe('Yesterday’s draft'))
    await waitFor(() =>
      expect(supabase._notebooks.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'user-1', content: 'Yesterday’s draft' }),
      ),
    )
  })

  it('snapshots a version shortly after the very first save for a signed-in member', async () => {
    const { createClient } = await import('../lib/supabase/client')
    const supabase = mockSupabaseClient({ signedIn: true, seedVersion: null })
    vi.mocked(createClient).mockReturnValue(supabase as never)

    renderWithIntl(<StoryNotebook />)
    const textarea = await screen.findByPlaceholderText(/once upon a time/i)

    fireEvent.change(textarea, { target: { value: 'A brand new line' } })

    await waitFor(
      () =>
        expect(supabase._notebookVersions.insert).toHaveBeenCalledWith(
          expect.objectContaining({ user_id: 'user-1', content: 'A brand new line' }),
        ),
      { timeout: 2000 },
    )
  })
})
