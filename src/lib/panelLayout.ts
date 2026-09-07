export type PanelSize = 'splash' | 'wide' | 'big' | 'tall' | 'medium' | 'beat'

export interface PlannedPanel {
  n: number
  size: PanelSize
  /** The "what's in the panel" description, with the shape words stripped out. */
  text: string
  /** Wordless — a beat, a silent reaction, no dialogue or caption. */
  silent: boolean
}

export interface Tier {
  panels: PlannedPanel[]
  /** Relative height of this tier, used as a flex-grow weight. */
  height: number
}

export interface PagePlan {
  tiers: Tier[]
  panelCount: number
}

const MAX_PANELS = 14

const SIZE_LABEL: Record<PanelSize, string> = {
  splash: 'Splash',
  wide: 'Wide',
  big: 'Big',
  tall: 'Tall',
  medium: 'Medium',
  beat: 'Beat',
}

export function sizeLabel(size: PanelSize): string {
  return SIZE_LABEL[size]
}

/** Tiers with one of these take the full page width to themselves. */
const SOLO: Record<PanelSize, boolean> = {
  splash: true,
  wide: true,
  big: false,
  tall: false,
  medium: false,
  beat: false,
}

/** Row-height weight per size (a splash is much taller than a beat). */
const TIER_HEIGHT: Record<PanelSize, number> = {
  splash: 3.4,
  wide: 1.15,
  big: 2.1,
  tall: 2.5,
  medium: 1.7,
  beat: 1.15,
}

const SIZE_PATTERNS: { size: PanelSize; re: RegExp }[] = [
  { size: 'splash', re: /\b(splash|full[-\s]?page|double[-\s]?page|full[-\s]?spread|whole[-\s]?page|two[-\s]?page|spread)\b/i },
  { size: 'tall', re: /\b(tall|skinny|narrow|vertical|slim|sliver|thin|column|portrait|strip)\b/i },
  { size: 'wide', re: /\b(wide|widescreen|panoramic|panorama|establish\w*|letterbox|full[-\s]?width|horizontal|landscape|cinematic|banner|sweeping)\b/i },
  { size: 'beat', re: /\b(beat|silent|wordless|pause|breath|reaction|quiet|still|empty|held)\b/i },
  { size: 'big', re: /\b(big|large|huge|hero[-\s]?shot|dramatic|impact|bold|centerpiece|money[-\s]?shot|feature|giant)\b/i },
]

const SILENT_RE =
  /\b(silent|wordless|no[-\s]dialogue|no[-\s]words|no[-\s]caption|without[-\s](?:a[-\s])?word|without[-\s]dialogue|dialogue[-\s]?free|speechless|beat|breath|pause|wordlessly|says nothing|not a word)\b/i

const COUNT_WORD: Record<string, number> = {
  two: 2, three: 3, four: 4, five: 5, six: 6,
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
}

function classifySize(desc: string): PanelSize {
  for (const { size, re } of SIZE_PATTERNS) {
    if (re.test(desc)) return size
  }
  return 'medium'
}

const SHAPE_WORD =
  '(?:wide|tall|skinny|narrow|vertical|slim|thin|big|large|huge|small|medium|beat|silent|wordless|splash|full[-\\s]?page|double[-\\s]?page|widescreen|panoramic|establish\\w*|dramatic|horizontal|cinematic|letterbox|sweeping|quick|tight|close(?:[-\\s]?ups?)?)'
const PANEL_NOUN = '(?:panels?|shots?|frames?|images?|spreads?|pages?|strips?|splash(?:es)?)'
const SCAFFOLD_RE = new RegExp(
  `^(a|an|the)?\\s*(${SHAPE_WORD}\\s+)+(${PANEL_NOUN}\\s*)?(of|for|showing|shows|with|as|:|-|—|,)?\\s*`,
  'i',
)

/** Strip "wide panel for" / "tall skinny panel showing" scaffolding so the card
 *  shows the content of the panel, not the layout instruction. */
function cleanText(raw: string): string {
  const original = raw.trim().replace(/^["'“‘]+|["'”’]+$/g, '').trim()
  let t = original

  // leading connectors: "then", "and then", "next,", "after that"
  t = t.replace(/^(then|and then|and|next,?|after that,?|followed by|first,?|finally,?|,)\s+/i, '')

  // leading shape words + "panel/shot/frame" + a joiner
  t = t.replace(SCAFFOLD_RE, '')

  // a leftover leading "no dialogue" / "silent" now that "beat panel with" is gone
  t = t.replace(/^(with\s+)?(no dialogue|no words|no caption|silent|wordless|dialogue[-\s]?free)[,:\s]+/i, '')

  // trailing "with no dialogue", "(silent)", "no words"
  t = t.replace(
    /[,(\s—-]*(with\s+)?(no dialogue|no words|no caption|silent|wordless|dialogue[-\s]?free)\s*\)?\s*$/i,
    '',
  )

  t = t.replace(/\s+/g, ' ').replace(/^[\s,;:.-]+|[\s,;:.]+$/g, '').trim()
  return t.length >= 2 ? t : original.replace(/[.,;:]+$/, '')
}

function splitChunks(input: string): string[] {
  const normalized = input.replace(/\r\n/g, '\n').trim()
  if (!normalized) return []

  const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean)

  if (lines.length > 1) {
    return lines.map((l) =>
      l.replace(/^(panel\s*)?\d+\s*[:.)\-—]\s*/i, '').replace(/^[-*•]\s*/, '').trim(),
    )
  }

  // one line / paragraph: split on "then", ";", arrows, sentence stops, and
  // commas that are followed by a fresh shape word
  return normalized
    .split(
      /\s*(?:;|\.\s+|\bthen\b|\band then\b|→|->|,\s*(?=(?:a\s+|an\s+|the\s+)?(?:wide|tall|skinny|narrow|big|small|beat|silent|wordless|splash|medium|close|establish|dramatic|panoramic)))/i,
    )
    .map((c) => c.replace(/^(then|and)\s+/i, '').trim())
    .filter(Boolean)
}

export function planPanels(input: string): PagePlan {
  const chunks = splitChunks(input)
  const panels: PlannedPanel[] = []

  for (const chunk of chunks) {
    if (panels.length >= MAX_PANELS) break

    let body = chunk
    let repeat = 1
    const count = body.match(/^(two|three|four|five|six|[2-6])\s+(?=[\w\s]*\b(panels?|beats?|shots?|frames?|images?)\b)/i)
    if (count) {
      repeat = COUNT_WORD[count[1].toLowerCase()] ?? 1
      body = body.slice(count[0].length).trim()
    }

    const size = classifySize(body)
    const silent = SILENT_RE.test(body) || size === 'beat'
    const text = cleanText(body)

    for (let i = 0; i < repeat && panels.length < MAX_PANELS; i++) {
      panels.push({ n: panels.length + 1, size, text, silent })
    }
  }

  return { tiers: packTiers(panels), panelCount: panels.length }
}

function packTiers(panels: PlannedPanel[]): Tier[] {
  const tiers: Tier[] = []
  let current: PlannedPanel[] = []

  const flush = () => {
    if (!current.length) return
    tiers.push({
      panels: current,
      height: Math.max(...current.map((p) => TIER_HEIGHT[p.size])),
    })
    current = []
  }

  for (const panel of panels) {
    if (SOLO[panel.size]) {
      flush()
      tiers.push({ panels: [panel], height: TIER_HEIGHT[panel.size] })
      continue
    }
    current.push(panel)
    const hasHeavy = current.some((p) => p.size === 'big' || p.size === 'tall')
    if (current.length >= 3 || (current.length >= 2 && hasHeavy)) flush()
  }
  flush()

  return tiers
}
