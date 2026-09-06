import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithIntl } from '../test/renderWithIntl'
import PricingTiers from './PricingTiers'

const getUserMock = vi.fn()

vi.mock('../lib/supabase/client', () => ({
  createClient: () => ({ auth: { getUser: getUserMock } }),
}))

describe('PricingTiers', () => {
  afterEach(() => vi.clearAllMocks())

  it('shows the disabled "Coming soon" button by default, before auth state resolves', () => {
    getUserMock.mockReturnValue(new Promise(() => {})) // never resolves during this test
    renderWithIntl(<PricingTiers />)
    const button = screen.getByRole('button', { name: /coming soon/i })
    expect(button).toBeDisabled()
  })

  it('keeps "Coming soon" for a signed-in member (billing is not built yet either way)', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    renderWithIntl(<PricingTiers />)
    await waitFor(() => expect(getUserMock).toHaveBeenCalled())
    expect(await screen.findByRole('button', { name: /coming soon/i })).toBeDisabled()
  })

  it('shows an enabled "Sign up first" link to /signup for a signed-out visitor', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    renderWithIntl(<PricingTiers />)

    const link = await screen.findByRole('link', { name: /sign up first/i })
    expect(link).toHaveAttribute('href', '/signup')
    expect(screen.queryByRole('button', { name: /coming soon/i })).not.toBeInTheDocument()
  })

  it('always shows the Free tier as available with no sign-in gating', () => {
    getUserMock.mockReturnValue(new Promise(() => {}))
    renderWithIntl(<PricingTiers />)
    expect(screen.getByRole('link', { name: /start writing/i })).toBeInTheDocument()
  })
})
