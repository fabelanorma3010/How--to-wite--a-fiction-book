import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { bookTypeEmoji, type BookTypeId } from '../data/bookTypes'
import { QUIZ_OPTION_ORDER, QUIZ_QUESTION_COUNT, type QuizQuestionCopy } from '../data/quiz'
import Sticker from './Sticker'

interface BookQuizProps {
  onSelect: (id: BookTypeId) => void
}

export default function BookQuiz({ onSelect }: BookQuizProps) {
  const t = useTranslations('Quiz')
  const bt = useTranslations('BookTypes')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<BookTypeId[]>([])

  const questions = t.raw('questions') as QuizQuestionCopy[]
  const isFinished = step >= QUIZ_QUESTION_COUNT
  const progress = Math.round((step / QUIZ_QUESTION_COUNT) * 100)

  const resultId = isFinished ? getWinner(answers) : null

  function handleAnswer(typeId: BookTypeId) {
    setAnswers((prev) => [...prev, typeId])
    setStep((s) => s + 1)
  }

  function handleRetake() {
    setAnswers([])
    setStep(0)
  }

  function handleSeeType() {
    if (resultId) onSelect(resultId)
  }

  const current = questions[step]

  return (
    <section id="quiz" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">{t('sectionTitle')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink/70">{t('sectionIntro')}</p>
        </div>

        <div className="animate-pop-in relative rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8">
          <Sticker emoji="🎯" className="-top-2 -left-2 -rotate-12 sm:-top-4 sm:-left-4" />
          {!isFinished && current && (
            <>
              <div className="mb-6">
                <div
                  className="h-2.5 w-full overflow-hidden rounded-full bg-ink/10"
                  role="progressbar"
                  aria-valuenow={step}
                  aria-valuemin={0}
                  aria-valuemax={QUIZ_QUESTION_COUNT}
                  aria-label={t('sectionTitle')}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm font-semibold text-ink/60">
                  {t('progress', { current: step + 1, total: QUIZ_QUESTION_COUNT })}
                </p>
              </div>

              <fieldset key={step} className="animate-slide-in">
                <legend className="text-xl font-extrabold text-ink sm:text-2xl">{current.q}</legend>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {QUIZ_OPTION_ORDER.map((typeId) => (
                    <button
                      key={typeId}
                      type="button"
                      onClick={() => handleAnswer(typeId)}
                      className="flex items-center gap-3 rounded-2xl border-2 border-ink/15 bg-base/80 p-4 text-left font-semibold text-ink/80 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-ink hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                    >
                      <span aria-hidden="true" className="text-xl">
                        {bookTypeEmoji(typeId)}
                      </span>
                      <span>{current[typeId]}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          {isFinished && resultId && (
            <div className="animate-pop-in text-center">
              <p className="font-bold uppercase tracking-wide text-secondary-content/70">
                {t('resultLabel')}
              </p>
              <h3 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">
                <span aria-hidden="true">{bookTypeEmoji(resultId)}</span>{' '}
                {bt(`types.${resultId}.name`)}
              </h3>
              <p className="mt-2 font-semibold text-ink/70">{bt(`types.${resultId}.tagline`)}</p>
              <p className="mx-auto mt-4 max-w-xl text-ink/80">{bt(`types.${resultId}.blurb`)}</p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#book-types"
                  onClick={handleSeeType}
                  className="rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95"
                >
                  {t('seeTips', { name: bt(`types.${resultId}.name`) })}
                </a>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="rounded-full border-2 border-ink/15 bg-white/70 px-6 py-3 font-bold text-ink transition-colors hover:bg-white active:scale-95"
                >
                  {t('retake')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function getWinner(answers: BookTypeId[]): BookTypeId {
  const tally = new Map<BookTypeId, number>()
  for (const answer of answers) {
    tally.set(answer, (tally.get(answer) ?? 0) + 1)
  }

  let winnerId: BookTypeId = QUIZ_OPTION_ORDER[0]
  let bestScore = -1
  for (const id of QUIZ_OPTION_ORDER) {
    const score = tally.get(id) ?? 0
    if (score > bestScore) {
      bestScore = score
      winnerId = id
    }
  }
  return winnerId
}
