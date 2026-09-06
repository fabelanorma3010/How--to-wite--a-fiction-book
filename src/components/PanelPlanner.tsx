import { useMemo, useState } from 'react'
import { planPanels, sizeLabel, WIDTH_WEIGHT } from '../lib/panelLayout'
import CopyButton from './CopyButton'
import Sticker from './Sticker'

type Mode = 'comic' | 'manga'

interface ModeConfig {
  label: string
  rtl: boolean
  reading: string
  examples: { label: string; text: string }[]
}

const MODES: Record<Mode, ModeConfig> = {
  comic: {
    label: 'Comic',
    rtl: false,
    reading: 'Panels read left to right, top to bottom.',
    examples: [
      {
        label: 'Heist beat',
        text: 'Wide panel for the vault, tall skinny panel for the drop, then a beat panel with no dialogue before the punch lands.',
      },
      {
        label: 'Rooftop chase',
        text: 'Establishing shot of the city rooftops at dusk. Then three quick beat panels of pounding feet. Then a big splash page of the leap across the gap.',
      },
      {
        label: 'Quiet scene',
        text: 'Two medium panels of them talking across the diner table. A tight beat panel on her hands around the mug. Wide panel as she stands and leaves without a word.',
      },
    ],
  },
  manga: {
    label: 'Manga',
    rtl: true,
    reading: 'Panels read right to left, top to bottom — the manga convention.',
    examples: [
      {
        label: 'Impact frame',
        text: 'Wide panel of the empty dojo. Tall skinny panel of the drawn sword. A silent beat panel on the eyes, then a big impact frame as the blades clash.',
      },
      {
        label: 'Confession',
        text: 'Two medium panels walking home under the cherry blossoms. A tight beat panel on the hand not quite taken. Wide panel of the confession, speed lines everywhere.',
      },
      {
        label: 'Cliffhanger',
        text: 'Big panel of the letter on the floor. Tall skinny panel of the open door. Then a silent beat panel, then a splash page of who is standing there.',
      },
    ],
  },
}

export default function PanelPlanner() {
  const [mode, setMode] = useState<Mode>('comic')
  const [text, setText] = useState(MODES.comic.examples[0].text)
  const cfg = MODES[mode]
  const plan = useMemo(() => planPanels(text), [text])

  const flatPanels = useMemo(() => plan.tiers.flatMap((t) => t.panels), [plan])

  const script = useMemo(
    () =>
      [
        `// ${cfg.label} page — ${cfg.rtl ? 'reads right to left' : 'reads left to right'}`,
        ...flatPanels.map(
          (p) =>
            `PANEL ${p.n} — ${sizeLabel(p.size).toUpperCase()}${p.silent ? ' · no dialogue' : ''}\n${p.text}`,
        ),
      ].join('\n\n'),
    [flatPanels, cfg],
  )

  function switchMode(next: Mode) {
    setMode(next)
    setText((current) =>
      MODES.comic.examples.some((e) => e.text === current) ||
      MODES.manga.examples.some((e) => e.text === current)
        ? MODES[next].examples[0].text
        : current,
    )
  }

  const totalWeight = plan.tiers.reduce((sum, t) => sum + t.height, 0)
  const pageHeight = Math.min(1000, Math.max(360, Math.round(totalWeight * 82)))

  return (
    <section id="panel-planner" className="px-4 py-16 sm:px-6">
      <div className="relative mx-auto max-w-3xl rounded-3xl border-2 border-ink/10 bg-white/60 p-6 shadow-sm sm:p-10">
        <Sticker emoji="🗂️" className="-top-2 -left-2 -rotate-12 sm:-top-4 sm:-left-4" />
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Panel Planner 🗂️</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/70">
            Describe your page in plain words &mdash; &ldquo;wide panel for the vault, tall skinny
            panel for the drop, then a beat panel before the punch.&rdquo; Get a rough page layout
            back, panel by panel.
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <div
            className="inline-flex rounded-full border-2 border-ink/15 bg-white/70 p-1"
            role="group"
            aria-label="Layout style"
          >
            {(Object.keys(MODES) as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                aria-pressed={mode === m}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                  mode === m ? 'bg-primary text-primary-content shadow-sm' : 'text-ink/60 hover:text-ink'
                }`}
              >
                {MODES[m].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {cfg.examples.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => setText(ex.text)}
              className="rounded-full border-2 border-ink/15 bg-white/70 px-3 py-1.5 text-sm font-bold text-ink/70 transition-colors hover:border-ink/30 hover:text-ink"
            >
              {ex.label}
            </button>
          ))}
        </div>

        <label htmlFor="panel-input" className="sr-only">
          Panel descriptions
        </label>
        <textarea
          id="panel-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Wide establishing shot of the street. Two medium panels of the argument. Tall skinny panel as the door slams."
          className="mt-4 w-full resize-y rounded-2xl border-2 border-ink/15 bg-base/80 p-4 text-ink placeholder:text-ink/40 focus:border-primary/50"
        />
        <p className="mt-2 text-sm text-ink/50">
          One panel per line, or split them with &ldquo;then&rdquo;, commas, or full stops. Use
          &ldquo;wide&rdquo;, &ldquo;tall / skinny&rdquo;, &ldquo;big / splash&rdquo;, or
          &ldquo;beat / silent&rdquo; to shape each panel.
        </p>

        {plan.panelCount > 0 ? (
          <>
            <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">
                {cfg.label} page &middot; {plan.panelCount}{' '}
                {plan.panelCount === 1 ? 'panel' : 'panels'}
              </h3>
              <p className="text-xs font-semibold text-ink/45">{cfg.reading}</p>
            </div>
            <div
              className="mx-auto mt-3 flex w-full max-w-sm flex-col gap-1.5 rounded-xl border-2 border-ink/15 bg-white p-1.5"
              style={{ height: pageHeight }}
            >
              {plan.tiers.map((tier, ti) => (
                <div
                  key={ti}
                  className={`flex min-h-0 gap-1.5 ${cfg.rtl ? 'flex-row-reverse' : ''}`}
                  style={{ flexGrow: tier.height, flexBasis: 0 }}
                >
                  {tier.panels.map((p) => (
                    <div
                      key={p.n}
                      className={`flex min-w-0 flex-col overflow-hidden rounded-sm border-[3px] border-ink p-2 ${
                        p.silent ? 'bg-ink/[0.05]' : 'bg-base/40'
                      }`}
                      style={{ flexGrow: WIDTH_WEIGHT[p.size], flexBasis: 0 }}
                    >
                      <span className="text-[9px] font-black uppercase tracking-wider text-ink/45">
                        {p.n} &middot; {sizeLabel(p.size)}
                        {p.silent ? ' · silent' : ''}
                      </span>
                      <span className="mt-0.5 line-clamp-4 text-[11px] font-semibold leading-snug text-ink/80">
                        {p.text}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 sm:p-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-ink/60">
                  Panel breakdown
                </h3>
                <CopyButton text={script} />
              </div>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink/80">
                {script}
              </pre>
            </div>
          </>
        ) : (
          <p className="mt-8 text-center text-sm text-ink/50">
            Type a few panels above to see the page take shape.
          </p>
        )}
      </div>
    </section>
  )
}
