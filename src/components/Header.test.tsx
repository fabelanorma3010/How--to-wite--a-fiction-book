import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderWithIntl } from '../test/renderWithIntl'
import Header from './Header'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('../lib/supabase/client', () => ({
  createClient: () => null,
}))

describe('Header logo link', () => {
  afterEach(() => vi.clearAllMocks())

  it('always links back to the homepage', () => {
    renderWithIntl(<Header />)
    expect(screen.getByRole('link', { name: /storyburst/i })).toHaveAttribute('href', '/')
  })
})

describe('Header section tabs', () => {
  afterEach(() => vi.clearAllMocks())

  it('link to each tool\'s own page', () => {
    renderWithIntl(<Header />)
    const primaryNav = within(screen.getByRole('navigation', { name: 'Primary' }))
    expect(primaryNav.getByRole('link', { name: 'Quiz' })).toHaveAttribute('href', '/quiz')
    expect(primaryNav.getByRole('link', { name: 'Notebook' })).toHaveAttribute('href', '/notebook')
    expect(primaryNav.getByRole('link', { name: 'Publish' })).toHaveAttribute('href', '/publish')
  })
})
