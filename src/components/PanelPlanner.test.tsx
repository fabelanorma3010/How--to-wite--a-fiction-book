import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithIntl } from '../test/renderWithIntl'
import PanelPlanner from './PanelPlanner'

describe('PanelPlanner stickers', () => {
  it('sticks the armed sticker onto a clicked panel, and removes it on a second click', async () => {
    const user = userEvent.setup()
    renderWithIntl(<PanelPlanner mode="comic" />)

    await user.click(screen.getByRole('button', { name: '💥' }))
    const panelOne = screen.getByRole('button', { name: /panel 1/i })
    expect(panelOne).not.toHaveTextContent('💥')

    await user.click(panelOne)
    expect(panelOne).toHaveTextContent('💥')

    await user.click(panelOne)
    expect(panelOne).not.toHaveTextContent('💥')
  })

  it('clears stickers when switching to a different example', async () => {
    const user = userEvent.setup()
    renderWithIntl(<PanelPlanner mode="comic" />)

    await user.click(screen.getByRole('button', { name: '⭐' }))
    const panelOne = screen.getByRole('button', { name: /panel 1/i })
    await user.click(panelOne)
    expect(panelOne).toHaveTextContent('⭐')

    await user.click(screen.getByRole('button', { name: 'Rooftop chase' }))
    expect(screen.getByRole('button', { name: /panel 1/i })).not.toHaveTextContent('⭐')
  })
})
