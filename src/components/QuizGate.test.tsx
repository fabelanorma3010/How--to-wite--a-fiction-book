import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithIntl } from '../test/renderWithIntl'
import QuizGate from './QuizGate'

const replaceMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}))

describe('QuizGate', () => {
  afterEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
  })

  it('sends a visitor who has not finished the quiz back to /quiz, without showing the page', async () => {
    renderWithIntl(
      <QuizGate>
        <p>Protected</p>
      </QuizGate>,
    )
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/quiz'))
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
  })

  it('shows an underage notice for a completed under-13 reader instead of the page', async () => {
    window.localStorage.setItem(
      'storyburst:quiz-age-gate',
      JSON.stringify({ age: 9, parentApproved: false, completed: true }),
    )
    renderWithIntl(
      <QuizGate>
        <p>Protected</p>
      </QuizGate>,
    )
    expect(await screen.findByText('Storyburst Is for Teens and Adults')).toBeInTheDocument()
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
    expect(replaceMock).not.toHaveBeenCalled()
  })

  it('shows the page for a visitor who finished the quiz at 13 or older', async () => {
    window.localStorage.setItem(
      'storyburst:quiz-age-gate',
      JSON.stringify({ age: 25, parentApproved: false, completed: true }),
    )
    renderWithIntl(
      <QuizGate>
        <p>Protected</p>
      </QuizGate>,
    )
    expect(await screen.findByText('Protected')).toBeInTheDocument()
    expect(replaceMock).not.toHaveBeenCalled()
  })
})
