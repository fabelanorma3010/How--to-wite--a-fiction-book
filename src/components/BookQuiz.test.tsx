import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithIntl } from '../test/renderWithIntl'
import BookQuiz from './BookQuiz'
import { QUIZ_QUESTION_COUNT } from '../data/quiz'

describe('BookQuiz', () => {
  it('shows the first question with a progress indicator', () => {
    renderWithIntl(<BookQuiz onSelect={vi.fn()} />)
    expect(screen.getByText(`1 of ${QUIZ_QUESTION_COUNT}`, { exact: false })).toBeInTheDocument()
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4)
  })

  it('shows a result after answering every question, and calls onSelect when following it', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderWithIntl(<BookQuiz onSelect={onSelect} />)

    for (let i = 0; i < QUIZ_QUESTION_COUNT; i++) {
      const fieldset = document.querySelector('fieldset')
      expect(fieldset).not.toBeNull()
      const options = within(fieldset as HTMLElement).getAllByRole('button')
      await user.click(options[0])
    }

    // The result screen replaces the question fieldset.
    expect(document.querySelector('fieldset')).toBeNull()
    const seeTipsLink = screen.getByRole('link')
    await user.click(seeTipsLink)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('retaking the quiz returns to question 1', async () => {
    const user = userEvent.setup()
    renderWithIntl(<BookQuiz onSelect={vi.fn()} />)

    for (let i = 0; i < QUIZ_QUESTION_COUNT; i++) {
      const fieldset = document.querySelector('fieldset') as HTMLElement
      await user.click(within(fieldset).getAllByRole('button')[0])
    }

    const retakeButton = screen.getAllByRole('button').find((b) => b.textContent?.match(/retake/i))
    expect(retakeButton).toBeDefined()
    await user.click(retakeButton!)

    expect(screen.getByText(`1 of ${QUIZ_QUESTION_COUNT}`, { exact: false })).toBeInTheDocument()
  })

  it('always picking the same option produces that book type as the result', async () => {
    const user = userEvent.setup()
    renderWithIntl(<BookQuiz onSelect={vi.fn()} />)

    // The first option in each question is always the "comic" answer
    // (QUIZ_OPTION_ORDER[0]), so a straight-line comic answerer should win comic.
    for (let i = 0; i < QUIZ_QUESTION_COUNT; i++) {
      const fieldset = document.querySelector('fieldset') as HTMLElement
      await user.click(within(fieldset).getAllByRole('button')[0])
    }

    expect(screen.getByText('Comic Book')).toBeInTheDocument()
  })
})
