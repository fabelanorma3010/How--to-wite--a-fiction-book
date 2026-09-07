import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithIntl } from '../test/renderWithIntl'
import JourneySteps from './JourneySteps'

describe('JourneySteps', () => {
  it('shows all four steps as links to the right sections, in order', () => {
    renderWithIntl(<JourneySteps />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(4)
    expect(links[0]).toHaveAttribute('href', '#quiz')
    expect(links[1]).toHaveAttribute('href', '#action-generator')
    expect(links[2]).toHaveAttribute('href', '#notebook')
    expect(links[3]).toHaveAttribute('href', '/account')
  })
})
