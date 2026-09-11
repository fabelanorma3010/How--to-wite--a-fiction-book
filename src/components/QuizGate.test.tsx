import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
    render(
      <QuizGate>
        <p>Protected</p>
      </QuizGate>,
    )
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/quiz'))
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
  })

  it('sends a completed under-13 reader to Kids Corner instead of showing the page', async () => {
    window.localStorage.setItem(
      'storyburst:quiz-age-gate',
      JSON.stringify({ age: 9, parentApproved: true, completed: true }),
    )
    render(
      <QuizGate>
        <p>Protected</p>
      </QuizGate>,
    )
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/kids'))
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
  })

  it('shows the page for a visitor who finished the quiz at 13 or older', async () => {
    window.localStorage.setItem(
      'storyburst:quiz-age-gate',
      JSON.stringify({ age: 25, parentApproved: false, completed: true }),
    )
    render(
      <QuizGate>
        <p>Protected</p>
      </QuizGate>,
    )
    expect(await screen.findByText('Protected')).toBeInTheDocument()
    expect(replaceMock).not.toHaveBeenCalled()
  })
})
