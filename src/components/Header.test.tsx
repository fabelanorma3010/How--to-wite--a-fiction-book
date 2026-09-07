import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithIntl } from '../test/renderWithIntl'
import Header from './Header'

const pathnameMock = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameMock(),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('../lib/supabase/client', () => ({
  createClient: () => null,
}))

describe('Header logo link', () => {
  afterEach(() => vi.clearAllMocks())

  it('scrolls to the top section when already on the homepage', () => {
    pathnameMock.mockReturnValue('/')
    renderWithIntl(<Header />)
    expect(screen.getByRole('link', { name: /storyburst/i })).toHaveAttribute('href', '#top')
  })

  it('links back to the homepage from any other page, instead of a dead "#top" anchor', () => {
    pathnameMock.mockReturnValue('/creators')
    renderWithIntl(<Header />)
    expect(screen.getByRole('link', { name: /storyburst/i })).toHaveAttribute('href', '/')
  })
})
