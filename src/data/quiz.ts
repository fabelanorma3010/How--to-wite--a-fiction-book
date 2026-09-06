import type { BookTypeId } from './bookTypes'

/**
 * Every quiz question offers the same four options in the same order, one per
 * book type. The question text and the four option labels live in
 * messages/<locale>.json under `Quiz.questions` (an array of 6). This file just
 * fixes the count and the option order.
 */
export const QUIZ_QUESTION_COUNT = 6

export const QUIZ_OPTION_ORDER: BookTypeId[] = ['comic', 'manga', 'cartoon', 'childrens']

export interface QuizQuestionCopy {
  q: string
  comic: string
  manga: string
  cartoon: string
  childrens: string
}
