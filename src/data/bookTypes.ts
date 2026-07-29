export type BookTypeId = 'comic' | 'manga' | 'cartoon' | 'childrens'

export interface BookType {
  id: BookTypeId
  name: string
  emoji: string
  tagline: string
  blurb: string
  tips: string[]
}

export const bookTypes: BookType[] = [
  {
    id: 'comic',
    name: 'Comic Book',
    emoji: '💥',
    tagline: 'Bold heroes, big panels, bigger action.',
    blurb:
      "Western-style comics tell stories through sequential panels packed with dynamic poses, punchy dialogue, and sound effects that leap off the page. Think capes, secret lairs, and a splash page that stops readers in their tracks.",
    tips: [
      'Script each page as panel descriptions + dialogue + captions — most artists want 3–6 panels per page.',
      'Save your biggest reveal for a full-page or double-page "splash" — don\'t waste it on a small panel.',
      'Vary panel shape and size to control pacing: tall skinny panels speed up action, wide panels slow it down.',
      'Write onomatopoeia (POW! CRASH!) directly into the script so your letterer knows where sound effects go.',
      'Give your hero a silhouette-readable design — you should recognize them in solid black shadow.',
    ],
  },
  {
    id: 'manga',
    name: 'Japanese Manga',
    emoji: '🌸',
    tagline: 'Expressive eyes, speed lines, and emotional whiplash.',
    blurb:
      'Manga reads right-to-left and leans on expressive character art, screentones, and dramatic paneling to swing between comedy, tension, and heart in a single page. Genre matters: shōnen for action, shōjo for romance, seinen for mature themes.',
    tips: [
      'Plan pages to read right-to-left, top-to-bottom — panel order is the #1 thing new mangaka get backwards.',
      'Use speed lines and impact frames to sell motion; a still pose can look frozen without them.',
      'Lean into exaggerated expressions (chibi mode) for comedic beats, then snap back to detailed realism for drama.',
      'Structure a chapter around one emotional turn — manga favors serialized tankōbon volumes over one-shot completeness.',
      'Japanese-style sound effects (giongo/gitaigo) can be part of the art itself — GOGOGO for rumbling, SHIIN for silence.',
    ],
  },
  {
    id: 'cartoon',
    name: 'Cartoon Book',
    emoji: '🎈',
    tagline: 'Rubber-hose limbs, sight gags, and comic timing.',
    blurb:
      'Cartoon books favor exaggerated, squash-and-stretch physical comedy and gag-driven storytelling — the visual equivalent of a punchline. Perfect for humor strips, absurd adventures, and characters who bounce back from anything.',
    tips: [
      'Build every scene toward a punchline — set up the expectation, then subvert it visually or verbally.',
      'Use squash-and-stretch: characters should look springy and elastic, never rigid, during big reactions.',
      'Running gags reward readers who return — plant a joke early and pay it off bigger later.',
      'Keep backgrounds simple and bold so the comedy in the foreground always reads clearly.',
      'Timing lives in panel count: a 3-panel setup-setup-punchline beat is a comedy classic for a reason.',
    ],
  },
  {
    id: 'childrens',
    name: "Children's Book",
    emoji: '🧸',
    tagline: 'Rhythm, repetition, and one big idea per page.',
    blurb:
      "Children's books pair spare, rhythmic text with big, warm illustrations. Every page turn is a story beat, and the best ones read aloud like a song — with repetition kids can predict and join in on.",
    tips: [
      'Write one idea per page — a page turn should feel like a mini surprise or punchline.',
      'Read your text aloud; if you stumble, a 5-year-old will too. Favor short, rhythmic sentences.',
      'Repetition is a feature, not a crutch — a repeated phrase gives young readers something to chant along with.',
      'Let illustrations carry story details the words don\'t — pictures can add jokes and subplots text never mentions.',
      'End with a gentle, satisfying resolution — even silly stories benefit from a cozy final page.',
    ],
  },
]
