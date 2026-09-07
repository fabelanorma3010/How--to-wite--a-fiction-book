import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithIntl } from '../test/renderWithIntl'
import { PRICES, STARTER_PRICE } from '../data/pricing'
import PricingTiers from './PricingTiers'

const getUserMock = vi.fn()

vi.mock('../lib/supabase/client', () => ({
  createClient: () => ({ auth: { getUser: getUserMock } }),
}))

describe('PricingTiers', () => {
  afterEach(() => vi.clearAllMocks())

  it('shows a disabled "Join Membership" placeholder before auth state resolves', () => {
    getUserMock.mockReturnValue(new Promise(() => {})) // never resolves during this test
    renderWithIntl(<PricingTiers />)
    const button = screen.getByRole('button', { name: /join membership/i })
    expect(button).toBeDisabled()
  })

  it('links a signed-in member straight to the Whop checkout for the selected plan', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    renderWithIntl(<PricingTiers />)

    // Annual is selected by default.
    const link = await screen.findByRole('link', { name: /join membership/i })
    expect(link).toHaveAttribute('href', PRICES.annual.checkoutUrl)
    expect(link).toHaveAttribute('target', '_blank')

    await userEvent.click(screen.getByRole('button', { name: /monthly/i }))
    expect(await screen.findByRole('link', { name: /join membership/i })).toHaveAttribute(
      'href',
      PRICES.monthly.checkoutUrl,
    )
  })

  it('shows an enabled "Sign up first" link to /signup for a signed-out visitor', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    renderWithIntl(<PricingTiers />)

    const link = await screen.findByRole('link', { name: /sign up first/i })
    expect(link).toHaveAttribute('href', '/signup')
    expect(screen.queryByRole('link', { name: /join membership/i })).not.toBeInTheDocument()
    await waitFor(() => expect(getUserMock).toHaveBeenCalled())
  })

  it('links the Starter tier straight to its $1 Whop checkout with no sign-in gating', () => {
    getUserMock.mockReturnValue(new Promise(() => {}))
    renderWithIntl(<PricingTiers />)
    const link = screen.getByRole('link', { name: /get started/i })
    expect(link).toHaveAttribute('href', STARTER_PRICE.checkoutUrl)
    expect(link).toHaveAttribute('target', '_blank')
  })
})
