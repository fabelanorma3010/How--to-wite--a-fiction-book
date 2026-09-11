import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithIntl } from '../test/renderWithIntl'
import BookQuiz from './BookQuiz'
import { QUIZ_QUESTION_COUNT } from '../data/quiz'

async function enterAge(user: ReturnType<typeof userEvent.setup>, age: string) {
  await user.type(screen.getByLabelText(/how old is the reader/i), age)
  await user.click(screen.getByRole('button', { name: /continue/i }))
}

function renderQuiz(onSelect = vi.fn(), onUnderage = vi.fn()) {
  return { ...renderWithIntl(<BookQuiz onSelect={onSelect} onUnderage={onUnderage} />), onSelect, onUnderage }
}

describe('BookQuiz', () => {
  afterEach(() => {
    window.localStorage.clear()
  })

  it("asks for the reader's age before anything else", () => {
    renderQuiz()
    expect(screen.getByLabelText(/how old is the reader/i)).toBeInTheDocument()
    expect(screen.queryByText(`1 of ${QUIZ_QUESTION_COUNT}`, { exact: false })).not.toBeInTheDocument()
  })

  it('rejects an empty or invalid age instead of proceeding', async () => {
    const user = userEvent.setup()
    renderQuiz()

    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.queryByText(`1 of ${QUIZ_QUESTION_COUNT}`, { exact: false })).not.toBeInTheDocument()
  })

  it('goes straight to question 1 for an age of 13 or older', async () => {
    const user = userEvent.setup()
    const { onUnderage } = renderQuiz()

    await enterAge(user, '13')
    expect(screen.getByText(`1 of ${QUIZ_QUESTION_COUNT}`, { exact: false })).toBeInTheDocument()
    expect(onUnderage).not.toHaveBeenCalled()
  })

  it('sends an under-13 reader to Kids Corner once approved, and never unlocks quiz questions', async () => {
    const user = userEvent.setup()
    const { onUnderage } = renderQuiz()

    await enterAge(user, '9')
    expect(screen.queryByText(`1 of ${QUIZ_QUESTION_COUNT}`, { exact: false })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /grown-up says it's okay/i })).toBeInTheDocument()
    expect(onUnderage).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /grown-up says it's okay/i }))
    expect(onUnderage).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(`1 of ${QUIZ_QUESTION_COUNT}`, { exact: false })).not.toBeInTheDocument()
  })

  it('lets a mistaken age be corrected from the parent-approval screen', async () => {
    const user = userEvent.setup()
    renderQuiz()

    await enterAge(user, '9')
    await user.click(screen.getByRole('button', { name: /not my age/i }))
    expect(screen.getByLabelText(/how old is the reader/i)).toBeInTheDocument()

    await enterAge(user, '30')
    expect(screen.getByText(`1 of ${QUIZ_QUESTION_COUNT}`, { exact: false })).toBeInTheDocument()
  })

  it('shows a result after answering every question, and calls onSelect when following it', async () => {
    const user = userEvent.setup()
    const { onSelect } = renderQuiz()
    await enterAge(user, '25')

    for (let i = 0; i < QUIZ_QUESTION_COUNT; i++) {
      const fieldset = document.querySelector('fieldset')
      expect(fieldset).not.toBeNull()
      const options = within(fieldset as HTMLElement).getAllByRole('button')
      await user.click(options[0])
    }

    // The result screen replaces the question fieldset.
    expect(document.querySelector('fieldset')).toBeNull()
    const seeTipsButton = screen.getByRole('button', { name: /see .* tips/i })
    await user.click(seeTipsButton)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('retaking the quiz returns to question 1 without asking age again', async () => {
    const user = userEvent.setup()
    renderQuiz()
    await enterAge(user, '25')

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
    renderQuiz()
    await enterAge(user, '25')

    // The first option in each question is always the "comic" answer
    // (QUIZ_OPTION_ORDER[0]), so a straight-line comic answerer should win comic.
    for (let i = 0; i < QUIZ_QUESTION_COUNT; i++) {
      const fieldset = document.querySelector('fieldset') as HTMLElement
      await user.click(within(fieldset).getAllByRole('button')[0])
    }

    expect(screen.getByText('Comic Book')).toBeInTheDocument()
  })

  it('remembers the age on a later visit and skips straight to the quiz', async () => {
    const user = userEvent.setup()
    const { unmount } = renderQuiz()
    await enterAge(user, '25')
    unmount()

    const { onUnderage } = renderQuiz()
    expect(await screen.findByText(`1 of ${QUIZ_QUESTION_COUNT}`, { exact: false })).toBeInTheDocument()
    expect(screen.queryByLabelText(/how old is the reader/i)).not.toBeInTheDocument()
    expect(onUnderage).not.toHaveBeenCalled()
  })

  it('routes a remembered under-13 reader straight to Kids Corner on a later visit', async () => {
    const user = userEvent.setup()
    const { unmount } = renderQuiz()
    await enterAge(user, '9')
    await user.click(screen.getByRole('button', { name: /grown-up says it's okay/i }))
    unmount()

    const { onUnderage } = renderQuiz()
    await waitFor(() => expect(onUnderage).toHaveBeenCalledTimes(1))
    expect(screen.queryByText(`1 of ${QUIZ_QUESTION_COUNT}`, { exact: false })).not.toBeInTheDocument()
  })

  it('forgetting a mistaken age via "not my age" clears the memory too', async () => {
    const user = userEvent.setup()
    const { unmount } = renderQuiz()
    await enterAge(user, '9')
    await user.click(screen.getByRole('button', { name: /not my age/i }))
    unmount()

    renderQuiz()
    expect(await screen.findByLabelText(/how old is the reader/i)).toBeInTheDocument()
  })
})
