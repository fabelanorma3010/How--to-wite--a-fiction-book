export interface PublishStep {
  title: string
  emoji: string
  description: string
}

export const publishSteps: PublishStep[] = [
  {
    title: 'Finish & revise your manuscript',
    emoji: '✍️',
    description:
      'Complete a full draft first — script and thumbnails for illustrated books, full text for prose. Then revise for pacing, clarity, and consistency before anyone else sees it.',
  },
  {
    title: 'Get feedback & edit',
    emoji: '🔍',
    description:
      'Share it with beta readers or a critique group, then hire (or trade favors for) a proofreader and, ideally, a developmental editor. Fresh eyes catch plot holes and pacing issues you can\'t see anymore.',
  },
  {
    title: 'Finalize illustrations & layout',
    emoji: '🎨',
    description:
      'Commission or complete final art, lettering, and page layout. Keep resolution and color mode (CMYK for print, RGB for digital) in mind from the start to avoid costly redos.',
  },
  {
    title: 'Design your cover',
    emoji: '📕',
    description:
      'Your cover is your #1 marketing tool. Study bestsellers in your genre, then design (or commission) a cover that reads clearly even as a tiny thumbnail.',
  },
  {
    title: 'Choose your publishing path',
    emoji: '🛤️',
    description:
      'Self-publish (Amazon KDP, IngramSpark, Lulu) for full control and speed, or query literary agents/publishers for traditional publishing\'s wider distribution and upfront advances. Many creators do both across different projects.',
  },
  {
    title: 'Get an ISBN & register copyright',
    emoji: '🔢',
    description:
      'Self-publishers can get a free ASIN from Amazon or purchase an ISBN (Bowker in the US) for wider retail listing. Register your copyright with your country\'s copyright office for extra legal protection.',
  },
  {
    title: 'Format for print & ebook',
    emoji: '📐',
    description:
      'Prepare print-ready PDFs with correct bleed and margins, and a reflowable or fixed-layout ebook file (EPUB works well for text-heavy books; fixed-layout EPUB or PDF suits comics and picture books).',
  },
  {
    title: 'Publish & distribute',
    emoji: '🚀',
    description:
      'Upload to platforms like Amazon KDP, IngramSpark, Apple Books, or a print-on-demand shop — or send your final files to a traditional publisher\'s production team if you went that route.',
  },
  {
    title: 'Market your book',
    emoji: '📣',
    description:
      'Build a simple author or artist page, share process art on social media, reach out to book bloggers/reviewers in your genre, and consider a launch-week promotion to build early momentum.',
  },
  {
    title: 'Gather reviews & keep creating',
    emoji: '⭐',
    description:
      'Politely ask early readers for honest reviews — they\'re huge for discoverability. Then start your next project; a growing body of work is the best long-term marketing there is.',
  },
]
