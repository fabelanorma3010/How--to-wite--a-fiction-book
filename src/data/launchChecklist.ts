export interface LaunchPhase {
  phase: string
  emoji: string
  when: string
  items: string[]
}

export const launchChecklist: LaunchPhase[] = [
  {
    phase: 'Before launch',
    emoji: '🗓️',
    when: '2–4 weeks out',
    items: [
      'Set the ebook preorder live so early sales all land on launch day and boost your ranking',
      'Order a physical proof copy and check it in person — trim, margins, colour, spine text',
      'Write and proofread the book description, and double-check the title, subtitle, and author name',
      'Pick your two categories and up to seven keywords, based on what comparable books rank for',
      'Set up or refresh your Amazon Author Central page — bio, photo, and link every edition together',
      'Line up a launch team: people who have actually agreed to buy and review in week one',
      'Draft your announcement email and 3–5 social posts so launch day is just hitting send',
    ],
  },
  {
    phase: 'Launch day',
    emoji: '🚀',
    when: 'the day it goes live',
    items: [
      'Confirm the book is live and buyable on every store you published to',
      'Open the "Look Inside" / sample preview and check it renders correctly',
      'Email your list with the buy link — the single highest-impact thing you can do',
      'Post the announcement everywhere you have an audience, and pin it',
      'Add the buy link to your website, link-in-bio, and social profiles',
      'Tell your launch team it\'s live and ask them to buy and review today',
    ],
  },
  {
    phase: 'Launch week',
    emoji: '📈',
    when: 'the first 7–14 days',
    items: [
      'Ask early readers for honest reviews — aim for 10+ in the first two weeks',
      'Share in communities where self-promotion is welcome, and answer every comment',
      'Sustain momentum with a newsletter swap, a small ad, or a short price promo',
      'Watch your Best Sellers Rank and category rank, and note what actually moves it',
      'Thank everyone who bought, shared, or reviewed — then start the next book',
    ],
  },
]
