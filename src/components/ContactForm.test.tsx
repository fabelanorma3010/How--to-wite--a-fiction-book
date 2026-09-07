import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithIntl } from '../test/renderWithIntl'
import ContactForm from './ContactForm'

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/name/i), 'Ada Lovelace')
  await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
  await user.type(screen.getByLabelText(/message/i), 'Hello there')
  await user.click(screen.getByRole('button', { name: /send message/i }))
}

describe('ContactForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts the form fields as JSON and shows the sent confirmation on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()

    renderWithIntl(<ContactForm />)
    await fillAndSubmit(user)

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello there' }),
      }),
    )
    expect(await screen.findByRole('status')).toHaveTextContent(/sent/i)
  })

  it('clears the fields after a successful send', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }))
    const user = userEvent.setup()

    renderWithIntl(<ContactForm />)
    await fillAndSubmit(user)

    await screen.findByRole('status')
    expect(screen.getByLabelText(/name/i)).toHaveValue('')
    expect(screen.getByLabelText(/email/i)).toHaveValue('')
    expect(screen.getByLabelText(/message/i)).toHaveValue('')
  })

  it('shows the server-provided error message on failure, without clearing the form', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Rate limit exceeded' }) }),
    )
    const user = userEvent.setup()

    renderWithIntl(<ContactForm />)
    await fillAndSubmit(user)

    expect(await screen.findByRole('alert')).toHaveTextContent('Rate limit exceeded')
    expect(screen.getByLabelText(/name/i)).toHaveValue('Ada Lovelace')
  })

  it('disables the submit button while the request is in flight', async () => {
    let resolveFetch!: (value: unknown) => void
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
      ),
    )
    const user = userEvent.setup()

    renderWithIntl(<ContactForm />)
    await user.type(screen.getByLabelText(/name/i), 'Ada')
    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Hi')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled()

    resolveFetch({ ok: true, json: async () => ({ success: true }) })
    await screen.findByRole('status')
  })
})
