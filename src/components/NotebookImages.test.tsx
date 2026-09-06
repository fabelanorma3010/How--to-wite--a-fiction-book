import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import NotebookImages from './NotebookImages'

/**
 * `userEvent.upload` itself enforces the input's `accept` filter and silently
 * drops a non-matching file before any React handler runs — useful for
 * testing that the *browser* filters files, useless for testing this
 * component's own defense-in-depth type check, which exists precisely because
 * `accept` is a client-side hint a user can bypass (e.g. picking "All Files").
 * This fires the change event directly, the same way a bypassed picker would.
 */
function uploadBypassingAccept(input: HTMLInputElement, file: File) {
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  fireEvent.change(input)
}

const messages = {
  NotebookImages: {
    addPictures: 'Add pictures',
    signInPrompt: 'Log in to attach reference pictures to your notebook.',
    remove: 'Remove picture',
    tooMany: 'You can attach up to {max} pictures.',
    invalidType: 'Please choose a PNG, JPEG, WebP image, or PDF file.',
    tooLarge: "That file is too large — 5MB max.",
    unavailable: 'Uploads are unavailable right now.',
  },
}

function renderNotebookImages(userId: string | null) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <NotebookImages userId={userId} />
    </NextIntlClientProvider>,
  )
}

function mockSupabaseClient() {
  // `.from(...)` / `.storage.from(...)` must return the SAME object on every
  // call — the component and the test's own assertions call them separately,
  // and a fresh mock per call would silently check a spy the component never
  // touched.
  const tableApi = {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ data: [] }),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ data: { id: 'img-1' }, error: null }),
      })),
    })),
    delete: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({}) })),
  }
  const storageApi = {
    createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://example.com/signed.png' } }),
    upload: vi.fn().mockResolvedValue({ error: null }),
    remove: vi.fn().mockResolvedValue({}),
  }
  return {
    from: vi.fn(() => tableApi),
    storage: { from: vi.fn(() => storageApi) },
    // Exposed directly so tests can assert on the exact spies the component used.
    _tableApi: tableApi,
    _storageApi: storageApi,
  }
}

vi.mock('../lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

describe('NotebookImages', () => {
  afterEach(() => vi.clearAllMocks())

  it('shows a sign-in prompt and no upload control when logged out', () => {
    renderNotebookImages(null)
    expect(screen.getByText(/log in to attach reference pictures/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add pictures/i })).not.toBeInTheDocument()
  })

  it("accepts PDFs alongside images in the file input's accept attribute", async () => {
    const { createClient } = await import('../lib/supabase/client')
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient() as never)

    const { container } = renderNotebookImages('user-1')
    await waitFor(() => expect(container.querySelector('input[type="file"]')).toBeInTheDocument())

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(input.accept).toContain('application/pdf')
    expect(input.accept).toContain('image/png')
    expect(input.multiple).toBe(true)
  })

  it('rejects a file of an unsupported type with an error message', async () => {
    const { createClient } = await import('../lib/supabase/client')
    const supabase = mockSupabaseClient()
    vi.mocked(createClient).mockReturnValue(supabase as never)

    const { container } = renderNotebookImages('user-1')
    await waitFor(() => expect(container.querySelector('input[type="file"]')).toBeInTheDocument())

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const badFile = new File(['x'], 'notes.txt', { type: 'text/plain' })
    uploadBypassingAccept(input, badFile)

    expect(await screen.findByText(/png, jpeg, webp image, or pdf/i)).toBeInTheDocument()
    expect(supabase._storageApi.upload).not.toHaveBeenCalled()
  })

  it('rejects a file over the size limit with an error message', async () => {
    const { createClient } = await import('../lib/supabase/client')
    const supabase = mockSupabaseClient()
    vi.mocked(createClient).mockReturnValue(supabase as never)

    const { container } = renderNotebookImages('user-1')
    await waitFor(() => expect(container.querySelector('input[type="file"]')).toBeInTheDocument())

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const bigFile = new File([new Uint8Array(6 * 1024 * 1024)], 'big.png', { type: 'image/png' })
    const user = userEvent.setup()
    await user.upload(input, bigFile)

    expect(await screen.findByText(/too large/i)).toBeInTheDocument()
    expect(supabase._storageApi.upload).not.toHaveBeenCalled()
  })

  it('uploads a valid PDF and records its content type', async () => {
    const { createClient } = await import('../lib/supabase/client')
    const supabase = mockSupabaseClient()
    vi.mocked(createClient).mockReturnValue(supabase as never)

    const { container } = renderNotebookImages('user-1')
    await waitFor(() => expect(container.querySelector('input[type="file"]')).toBeInTheDocument())

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const pdfFile = new File(['%PDF-1.4'], 'reference.pdf', { type: 'application/pdf' })
    const user = userEvent.setup()
    await user.upload(input, pdfFile)

    await waitFor(() => expect(supabase._storageApi.upload).toHaveBeenCalled())
    expect(supabase._tableApi.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', content_type: 'application/pdf' }),
    )
  })
})
