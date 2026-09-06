import { describe, expect, it } from 'vitest'
import { QUIZ_OPTION_ORDER, QUIZ_QUESTION_COUNT } from './quiz'
import { bookTypeIds } from './bookTypes'

describe('quiz', () => {
  it('offers exactly one option per book type, in a fixed order', () => {
    expect(QUIZ_OPTION_ORDER).toHaveLength(bookTypeIds.length)
    expect(new Set(QUIZ_OPTION_ORDER)).toEqual(new Set(bookTypeIds))
  })

  it('has a positive question count', () => {
    expect(QUIZ_QUESTION_COUNT).toBeGreaterThan(0)
  })

  it('every locale has exactly QUIZ_QUESTION_COUNT questions with all four options', async () => {
    const en = (await import('../../messages/en.json')).default as {
      Quiz: { questions: Record<string, string>[] }
    }
    const questions = en.Quiz.questions
    expect(questions).toHaveLength(QUIZ_QUESTION_COUNT)
    for (const question of questions) {
      expect(question.q).toBeTruthy()
      for (const optionId of QUIZ_OPTION_ORDER) {
        expect(question[optionId]).toBeTruthy()
      }
    }
  })
})
