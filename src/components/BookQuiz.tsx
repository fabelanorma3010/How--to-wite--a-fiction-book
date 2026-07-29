import { useState } from 'react'
import { bookTypes, type BookTypeId } from '../data/bookTypes'
import { quizQuestions } from '../data/quiz'

interface BookQuizProps {
  onSelect: (id: BookTypeId) => void
}

export default function BookQuiz({ onSelect }: BookQuizProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<BookTypeId[]>([])

  const isFinished = step >= quizQuestions.length
  const progress = Math.round((step / quizQuestions.length) * 100)

  const result = isFinished ? getWinner(answers) : null

  function handleAnswer(typeId: BookTypeId) {
    setAnswers((prev) => [...prev, typeId])
    setStep((s) => s + 1)
  }

  function handleRetake() {
    setAnswers([])
    setStep(0)
  }

  function handleSeeType() {
    if (!result) return
    onSelect(result.id)
  }

  return (
    <section id="quiz" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
            Not Sure Which Format Fits You?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink/70">
            Answer six quick questions and we'll match you with a book format to try.
          </p>
        </div>

        <div className="animate-pop-in rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8">
          {!isFinished && (
            <>
              <div className="mb-6">
                <div
                  className="h-2.5 w-full overflow-hidden rounded-full bg-ink/10"
                  role="progressbar"
                  aria-valuenow={step}
                  aria-valuemin={0}
                  aria-valuemax={quizQuestions.length}
                  aria-label="Quiz progress"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm font-semibold text-ink/60">
                  Question {step + 1} of {quizQuestions.length}
                </p>
              </div>

              <fieldset key={step} className="animate-pop-in">
                <legend className="text-xl font-extrabold text-ink sm:text-2xl">
                  {quizQuestions[step].question}
                </legend>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {quizQuestions[step].options.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => handleAnswer(option.typeId)}
                      className="flex items-center gap-3 rounded-2xl border-2 border-ink/15 bg-base/80 p-4 text-left font-semibold text-ink/80 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-ink hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                    >
                      <span aria-hidden="true" className="text-xl">
                        {option.emoji}
                      </span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          {isFinished && result && (
            <div className="animate-pop-in text-center">
              <p className="font-bold uppercase tracking-wide text-secondary-content/70">
                Your match is...
              </p>
              <h3 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">
                <span aria-hidden="true">{result.emoji}</span> {result.name}
              </h3>
              <p className="mt-2 font-semibold text-ink/70">{result.tagline}</p>
              <p className="mx-auto mt-4 max-w-xl text-ink/80">{result.blurb}</p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#book-types"
                  onClick={handleSeeType}
                  className="rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95"
                >
                  See {result.name} Tips & Tools
                </a>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="rounded-full border-2 border-ink/15 bg-white/70 px-6 py-3 font-bold text-ink transition-colors hover:bg-white active:scale-95"
                >
                  Retake Quiz 🔄
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function getWinner(answers: BookTypeId[]) {
  const tally = new Map<BookTypeId, number>()
  for (const answer of answers) {
    tally.set(answer, (tally.get(answer) ?? 0) + 1)
  }

  let winnerId: BookTypeId = bookTypes[0].id
  let bestScore = -1
  for (const type of bookTypes) {
    const score = tally.get(type.id) ?? 0
    if (score > bestScore) {
      bestScore = score
      winnerId = type.id
    }
  }

  return bookTypes.find((type) => type.id === winnerId) ?? bookTypes[0]
}
