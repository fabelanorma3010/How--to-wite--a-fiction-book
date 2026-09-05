export interface PublishStep {
  title: string
  emoji: string
  description: string
  /** Optional deeper how-to points shown as a sub-list under the description. */
  details?: string[]
}

export const publishSteps: PublishStep[] = [
  {
    title: 'Finish & revise your manuscript',
    emoji: '✍️',
    description:
      'Complete a full draft first — script and thumbnails for illustrated books, full text for prose. Then revise for pacing, clarity, and consistency before anyone else sees it.',
    details: [
      '"Done" means the story works start to finish — not that every sentence is perfect. Editing comes next.',
      'Let the draft rest a week or two, then reread it start to finish before touching anything.',
      'Rough timeline from finished draft to published book: 2–6 months for a first-timer, mostly editing, cover, and formatting.',
    ],
  },
  {
    title: 'Get feedback & edit',
    emoji: '🔍',
    description:
      "Share it with beta readers or a critique group, then get it edited. Fresh eyes catch plot holes and pacing issues you can't see anymore.",
    details: [
      'Developmental edit = big-picture (structure, character, pacing). Copy edit = line-level grammar and style. Proofread = final typo catch.',
      'Ballpark costs: proofread ~$150–$400 for a short book, copy edit ~$300–$1,000, developmental edit ~$500–$2,500+. Many first books skip the developmental edit and lean on beta readers.',
      'Swapping critiques with other writers, or trading skills (you letter their comic, they proof your text), costs nothing.',
    ],
  },
  {
    title: 'Finalize illustrations & layout',
    emoji: '🎨',
    description:
      'Commission or complete final art, lettering, and page layout. Keep resolution and color mode (CMYK for print, RGB for digital) in mind from the start to avoid costly redos.',
    details: [
      'Work at 300 DPI for print. Set up your page size early — including bleed — so art isn\'t cropped later.',
      'Comics & picture books: Affinity Publisher, Adobe InDesign, or Clip Studio for layout and lettering.',
      'Commissioned art varies widely — a picture book\'s interior can run $1,000–$5,000+. Doing it yourself is the main way to publish for near-zero cost.',
    ],
  },
  {
    title: 'Design your cover',
    emoji: '📕',
    description:
      'Your cover is your #1 marketing tool. Study bestsellers in your genre, then design (or commission) a cover that reads clearly even as a tiny thumbnail.',
    details: [
      'Look at the top 20 books in your exact category on Amazon. Match the genre\'s visual language — fonts, color, mood — then stand out within it.',
      'DIY options: Canva, Affinity, or KDP\'s Cover Creator (free, basic). A pro pre-made cover runs ~$50–$150; a fully custom one ~$300–$800.',
      'For print you also need a full wraparound (back cover + spine). The spine width depends on page count — KDP gives you a template once you know it.',
    ],
  },
  {
    title: 'Choose your publishing path',
    emoji: '🛤️',
    description:
      'Self-publish for full control and speed, or query literary agents and publishers for traditional publishing\'s wider distribution and an upfront advance. Many creators do both across different projects.',
    details: [
      'Amazon KDP: free, print-on-demand (no inventory, no upfront cost), the biggest ebook + print store. Start here.',
      'IngramSpark: free to set up, reaches ~40,000 retailers and libraries — the route into physical bookstores. Many authors use KDP + IngramSpark together.',
      'Traditional: you query agents with the finished book, they sell it to a publisher. Wider reach and an advance, but slower and highly selective — expect months of querying.',
      'A realistic self-publishing budget: $0 if you DIY everything, ~$500–$2,500 if you pay for editing and a pro cover.',
    ],
  },
  {
    title: 'Get an ISBN & register copyright',
    emoji: '🔢',
    description:
      "Sort out the identifiers and legal paperwork. It's quicker and cheaper than most people expect.",
    details: [
      'KDP will assign a free ISBN (or a free ASIN for Kindle-only) — fine if you only sell through Amazon.',
      'Buy your own ISBN if you want to be listed as the publisher and sell wide: Bowker (US) ~$125 for one, much cheaper in bulk. Free from the national library in Canada, the UK, and some other countries.',
      'You own the copyright the moment you create the work. Registering it (US Copyright Office, ~$45–$65) adds legal muscle if you ever need to enforce it.',
    ],
  },
  {
    title: 'Format for print & ebook',
    emoji: '📐',
    description:
      'Prepare a print-ready PDF with correct bleed and margins, and an ebook file. EPUB works well for text-heavy books; fixed-layout EPUB or PDF suits comics and picture books.',
    details: [
      'Prose ebooks: Vellum (Mac, ~$250 one-time), Atticus (~$147, cross-platform), or Kindle Create (free, basic) all export clean EPUBs.',
      'Comics & picture books: export a fixed-layout file so the art doesn\'t reflow — Affinity or InDesign handle this.',
      'Always download the platform\'s own template for your trim size and page count, and use their previewer before you hit publish.',
    ],
  },
  {
    title: 'Publish & distribute',
    emoji: '🚀',
    description:
      'Upload your final files, set your price, and hit publish — or send your files to a traditional publisher\'s production team if you went that route.',
    details: [
      'KDP ebook royalty: 70% on a list price of $2.99–$9.99 (35% outside that band). Print royalty: 60% of list price minus the per-copy printing cost.',
      'Price to match your category — check what comparable books charge. Common starting points: $2.99–$4.99 for a short ebook, $9.99–$16.99 for a paperback.',
      'KDP Select enrolls your ebook in Kindle Unlimited and unlocks promo tools, but requires 90 days of Amazon exclusivity. Skip it if you\'re also selling on Apple Books, Kobo, or your own site.',
      'Set up a preorder (up to a year out for ebooks) so early sales land on launch day and boost your ranking.',
    ],
  },
  {
    title: 'Market your book',
    emoji: '📣',
    description:
      'Build a simple author or artist page, share your work, and reach the people most likely to want this specific book.',
    details: [
      'Start an email list now — even 50 readers who asked to hear from you outperform any social platform on launch day.',
      'Post process art and progress while you build the book; a finished cover reveal and a launch-week push give you momentum.',
      'Reach out to book bloggers, BookTubers, or reviewers who cover your genre, and send them a free copy well before launch.',
    ],
  },
  {
    title: 'Gather reviews & keep creating',
    emoji: '⭐',
    description:
      "Politely ask early readers for honest reviews — they're huge for discoverability. Then start your next project; a growing body of work is the best long-term marketing there is.",
    details: [
      'Put a short "if you enjoyed this, a review really helps" note on the last page of the book.',
      'You can fix typos or swap in a better cover any time — just re-upload the file, no new ISBN needed.',
      'Books sell other books. The strongest thing you can do for book one is publish book two.',
    ],
  },
]
