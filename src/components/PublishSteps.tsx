import { publishSteps } from '../data/publishSteps'

const badgeColors = ['bg-primary text-primary-content', 'bg-secondary text-secondary-content', 'bg-accent text-accent-content']

export default function PublishSteps() {
  return (
    <section id="publish" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
            Your Path to Publishing 🚀
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink/70">
            From final draft to finished book on shelves (real or digital) — here's the
            step-by-step process most illustrated books follow.
          </p>
        </div>

        <ol className="relative">
          <div
            aria-hidden="true"
            className="absolute left-[27px] top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-primary via-secondary to-accent sm:left-[31px]"
          />

          {publishSteps.map((step, i) => (
            <li key={step.title} className="relative mb-8 flex gap-4 sm:gap-6 last:mb-0">
              <div
                className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-extrabold shadow-md sm:h-16 sm:w-16 sm:text-2xl ${badgeColors[i % badgeColors.length]}`}
              >
                {step.emoji}
              </div>
              <div className="flex-1 rounded-2xl border-2 border-ink/10 bg-white/70 p-4 pt-3 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-ink/40">
                  Step {i + 1}
                </p>
                <h3 className="mt-0.5 text-lg font-extrabold text-ink sm:text-xl">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm text-ink/70 sm:text-base">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
