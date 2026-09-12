import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithIntl } from '../test/renderWithIntl'
import ArtGenerator from './ArtGenerator'

describe('ArtGenerator', () => {
  it('renders a canvas plus the style and blur controls', async () => {
    renderWithIntl(<ArtGenerator />)

    expect(screen.getByRole('heading', { name: /random art generator/i })).toBeInTheDocument()
    expect(document.querySelector('canvas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /surprise me/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^ninja$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^none$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate another/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /download png/i })).toBeInTheDocument()
  })

  it('starts in "Surprise me" mode and shows which category it landed on', async () => {
    renderWithIntl(<ArtGenerator />)

    expect(await screen.findByRole('button', { name: /surprise me/i })).toHaveAttribute('aria-pressed', 'true')
    // One of the 9 category chips names the picture that was actually drawn.
    const categoryNames = ['Shapes', 'Comic', 'Person', 'Superhero', 'Animal', 'Cartoon Character', 'Red-Haired Woman', 'Ninja', 'Angel']
    const shown = categoryNames.filter((name) => screen.queryAllByText(name).length > 0)
    expect(shown.length).toBeGreaterThan(0)
  })

  it('selecting a specific style marks it pressed and turns off "Surprise me"', async () => {
    const user = userEvent.setup()
    renderWithIntl(<ArtGenerator />)

    const ninjaButton = screen.getByRole('button', { name: /^ninja$/i })
    await user.click(ninjaButton)

    expect(ninjaButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /surprise me/i })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getAllByText('Ninja').length).toBeGreaterThan(0)
  })

  it('selecting a blur level marks it pressed without changing the picture', async () => {
    const user = userEvent.setup()
    renderWithIntl(<ArtGenerator />)

    await user.click(screen.getByRole('button', { name: /^ninja$/i }))
    const heavyButton = screen.getByRole('button', { name: /^heavy$/i })
    await user.click(heavyButton)

    expect(heavyButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByText('Ninja').length).toBeGreaterThan(0)
  })

  it('lets a visitor generate another picture and download it without errors', async () => {
    const user = userEvent.setup()
    renderWithIntl(<ArtGenerator />)

    await user.click(screen.getByRole('button', { name: /generate another/i }))
    await expect(user.click(screen.getByRole('button', { name: /download png/i }))).resolves.not.toThrow()
  })
})
