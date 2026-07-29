import type { BookTypeId } from './bookTypes'
import { generateActionText, generateIllustrationIdea } from './generators'

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const heroIdeas: Record<BookTypeId, string[]> = {
  comic: [
    "KILOWATT — an engineer struck by lightning who can short-circuit any machine with a touch, but it's slowly frying her own nervous system.",
    'THE GREY SENTINEL — a retired hero pulled back in for one last mission, not sure he trusts his flashy replacement.',
    'SPARROW — a teen vigilante who steals from corrupt tech billionaires and funnels it to underfunded schools.',
    "IRONCLAD — a knight in a power-armor suit who can't remember who they were before putting it on.",
    "THE UNDERSTUDY — a sidekick who's secretly been stronger than their mentor for years, too loyal to say so.",
  ],
  manga: [
    'HARUKI — a transfer student who can hear one lie a day, and just heard the biggest one of his life.',
    'THE LAST BLADE — the sole survivor of a disgraced dojo, hiding her identity while enrolled at her rival school.',
    'senpai with a sealed spirit sleeping inside them, waking up a little more with every fight.',
    'the class rep who secretly moonlights as the masked hero everyone at school is obsessed with.',
    'a childhood rival who transferred schools just to keep training beside the hero they refuse to lose to.',
  ],
  cartoon: [
    "SIR BOUNCE-A-LOT — a knight made entirely of rubber who's brave, loyal, and physically incapable of standing still.",
    'the overconfident duck who is 100% certain today is the day the pie-eating record falls.',
    "the world's laziest superhero, who will save the day the moment their nap is over.",
    'an accident-prone inventor whose "perfect" gadgets always work — just never the way she planned.',
    'a runaway garden gnome on a quest to reunite with the birdbath he was separated from.',
  ],
  childrens: [
    'a sleepy baby dragon who is afraid of the dark, even though she breathes fire.',
    'the littlest firefly, who glows the dimmest of anyone in the meadow but has the biggest heart.',
    'a tiny snail with a very big dream: to see the top of the garden wall just once.',
    'the friendly cloud named Puff, who just wants to find someone to rain on (nicely).',
    'a curious kitten who is convinced the vacuum cleaner is secretly a very grumpy dragon.',
  ],
}

const villainIdeas: Record<BookTypeId, string[]> = {
  comic: [
    'DR. PALLOR — drains color (and life) from anything they touch, working to turn the whole city monochrome and "peaceful."',
    'THE AUCTIONEER — sells stolen superpowers to the highest bidder, no questions asked, no refunds.',
    'KIRA VOSS — a former hero who lost her powers and now steals abilities from others to get hers back; she still saves people mid-heist out of habit.',
    "THE ARCHIVIST — collects heroes' secret identities like trading cards, and isn't afraid to trade them.",
    "GRIDLOCK — can freeze time in a single city block, and has been quietly 'pausing' witnesses for years.",
  ],
  manga: [
    'the childhood friend who was secretly recruited by the enemy clan years ago, and still hopes not to have to fight tonight.',
    'a fallen mentor who believes destroying the tournament is the only way to save everyone from a worse fate.',
    'the transfer student whose polite smile hides the strongest unreleased technique in the whole school.',
    'a spirit sealed for a thousand years, who genuinely believes the protagonist is its long-lost reincarnated friend.',
    'the rival family heir, raised since birth to end the hero\'s bloodline — and just realizing they don\'t want to.',
  ],
  cartoon: [
    'THE COUPON CLIPPER — an evil genius whose entire master plan revolves around a slightly-expired discount.',
    'a rival inventor whose "world-conquering" devices are brilliant, except for one hilariously overlooked flaw.',
    'the neighborhood cat, who has been secretly sabotaging the hero\'s garden gnome empire for three seasons.',
    'a grumpy wizard who turned evil purely because someone returned his library book late.',
    'the world\'s pickiest dragon, terrorizing the kingdom because nobody will cook his eggs the right way.',
  ],
  childrens: [
    'a grumpy old troll who just wants everyone to be a little quieter (he\'s not really a villain, just very tired).',
    'the wind, who keeps blowing away everybody\'s hats, but only because it\'s lonely and wants to play.',
    'a shadow who copies everything the hero does, and secretly just wants a friend of its own.',
    'a hungry little dragon who "borrows" everyone\'s cookies, one polite nibble at a time.',
    'Mr. Puddle, a grumpy rain cloud who rains on picnics because nobody ever invites him to one.',
  ],
}

const plotTwists: Record<BookTypeId, string[]> = {
  comic: [
    "The hero's mentor has been secretly working for the villain since before the story began.",
    "The villain's master plan was actually designed to save the city from something far worse.",
    "The hero's powers came from the villain in the first place — and can be taken back at any time.",
    'Two heroes who\'ve fought side-by-side for years turn out to be the same person, living double.',
    'The sidekick was the true target of the villain\'s scheme all along — the hero was just in the way.',
  ],
  manga: [
    "The rival was fighting to protect the hero all along, and losing on purpose the whole time.",
    'The tournament was never a competition — it was a test to find the next sealed guardian.',
    'The mentor\'s tragic backstory and the villain\'s tragic backstory are the same story, from two sides.',
    'The power everyone feared in the hero is the exact thing needed to save the person they\'re fighting.',
    'The "prophecy" was written by someone in the present timeline, sent back to guide the hero here.',
  ],
  cartoon: [
    "The entire chaotic mess was secretly a surprise party the hero ruined by trying to stop it.",
    'The "villain" was just trying to return something the hero accidentally stole three chapters ago.',
    'Everyone\'s been mispronouncing the villain\'s name all story, and it turns out that\'s the whole reason he\'s mad.',
    'The map was upside down the entire time — the treasure was where they started.',
    'The rival was never competing against the hero at all — just really, really bad at directions.',
  ],
  childrens: [
    "The scary noise under the bed was just a lost baby animal looking for its way home.",
    'The "monster" everyone was afraid of just wanted someone to share a blanket with.',
    'The missing item was with the character the whole time, tucked somewhere they forgot to look.',
    'The new kid everyone was nervous about turns out to be nervous too, and just as excited to be friends.',
    'The big storm wasn\'t something to fear — it was clearing the way for a beautiful rainbow morning.',
  ],
}

const dialogueLines: Record<BookTypeId, string[]> = {
  comic: [
    '"You should\'ve stayed down." — the villain, stepping out of the smoke.',
    '"I didn\'t choose this power. I choose what I do with it." — the hero, standing back up anyway.',
    '"Every hero has a line they won\'t cross. I\'m here to find yours." — the villain, smiling.',
    '"This isn\'t a rescue. It\'s a warning." — the hero, to the entire room.',
    '"You keep calling me the villain. Funny — I\'m the only one who kept my promise." — the antagonist.',
  ],
  manga: [
    '"I\'m not strong because I have no fear. I\'m strong because I fight anyway." — the protagonist, breathing hard.',
    '"You were never my rival. You were the reason I kept going." — quiet, after the match ends.',
    '"If this power isn\'t mine to keep... then let me use it just once more." — under their breath.',
    '"I lost count of how many times I\'ve failed. I haven\'t lost count of how many times I\'ve stood up." — resolute.',
    '"Don\'t apologize for winning. Just promise you\'ll be there next time." — a small, real smile.',
  ],
  cartoon: [
    '"This is fine. This is completely, one-hundred-percent fine." — surrounded by total chaos.',
    '"In my defense, nobody TOLD me the cannon was loaded." — sheepishly, mid-fall.',
    '"I have a plan!" "...Do you though?" "I have PART of a plan!" — bickering sidekicks.',
    '"That could have gone better." — after the entire bakery collapses behind them.',
    '"Step one: don\'t panic. Step two: WHY IS THAT ON FIRE." — reading instructions upside down.',
  ],
  childrens: [
    '"Even the littlest firefly can light up the whole night." — softly, before the big moment.',
    '"You don\'t have to be big to be brave." — a gentle nudge forward.',
    '"Every friend starts out as someone new." — with a shy little wave.',
    '"It\'s okay to be scared. I\'ll hold your hand the whole way." — warmly, at the doorway.',
    '"The best adventures are the ones we share." — snuggled up at the very end.',
  ],
}

const titleWords: Record<BookTypeId, { adjectives: string[]; nouns: string[]; prefix: string }> = {
  comic: {
    adjectives: ['Iron', 'Last', 'Midnight', 'Broken', 'Rogue', 'Silent'],
    nouns: ['Reckoning', 'Signal', 'Skyline', 'Legion', 'Vigilante', 'Circuit'],
    prefix: 'The ',
  },
  manga: {
    adjectives: ['Crimson', 'Silent', 'Eternal', 'Hollow', 'Radiant', 'Fractured'],
    nouns: ['Blade', 'Blossom', 'Oath', 'Echo', 'Reverie', 'Ember'],
    prefix: '',
  },
  cartoon: {
    adjectives: ['Wobbly', 'Sticky', 'Bananas', 'Bouncy', 'Loopy', 'Squishy'],
    nouns: ['Circus', 'Caper', 'Chaos', 'Contraption', 'Shenanigans', 'Ruckus'],
    prefix: 'The ',
  },
  childrens: {
    adjectives: ['Sleepy', 'Giggly', 'Tiny', 'Cozy', 'Fluttery', 'Wiggly'],
    nouns: ['Firefly', 'Puddle', 'Blanket', 'Adventure', 'Garden', 'Cloud'],
    prefix: 'The ',
  },
}

const pacingTips: Record<BookTypeId, string> = {
  comic: 'Most comic pages run 3–6 panels — enough panels to control pacing without crowding the page. Save full-page splashes for your biggest moments.',
  manga: 'Manga usually serializes in chapters of 16–20 pages, collected into volumes (tankōbon) of roughly 8–10 chapters each.',
  cartoon: 'Gag-driven cartoon pages love a classic 3-panel setup–setup–punchline rhythm — it\'s comedic timing you can lean on again and again.',
  childrens: 'Picture books usually run 24–32 pages total, with just one idea or beat per page-turn — resist the urge to pack pages full.',
}

const genreNames: Record<BookTypeId, string> = {
  comic: 'Comic Book',
  manga: 'Japanese Manga',
  cartoon: 'Cartoon Book',
  childrens: "Children's Book",
}

interface FaqEntry {
  keywords: string[]
  answer: string
}

const faqEntries: FaqEntry[] = [
  {
    keywords: ['cover design', 'book cover', 'design a cover', 'cover art'],
    answer:
      "Your cover is your #1 marketing tool. Study bestsellers in your genre, then design (or commission) a cover that reads clearly even as a tiny thumbnail — that's how most readers will first see it.",
  },
  {
    keywords: ['agent', 'traditional publish', 'query letter', 'literary'],
    answer:
      "For traditional publishing, you'll query literary agents or publishers directly. It's slower and more selective than self-publishing, but can come with an advance and wider distribution.",
  },
  {
    keywords: ['isbn', 'copyright', 'register my book', 'asin'],
    answer:
      "Self-publishers can get a free ASIN from Amazon or buy an ISBN (Bowker, in the US) for wider retail listing. It's also worth registering your copyright with your country's copyright office for extra legal protection.",
  },
  {
    keywords: ['format', 'epub', 'print ready', 'bleed', 'file type'],
    answer:
      'Prepare print-ready PDFs with correct bleed and margins, plus a reflowable or fixed-layout ebook file — EPUB works well for text-heavy books, while fixed-layout EPUB or PDF suits comics and picture books.',
  },
  {
    keywords: ['market', 'promote', 'marketing', 'reviews', 'sell my book'],
    answer:
      "Build a simple author or artist page, share process art on social media, and reach out to book bloggers or reviewers in your genre. Then kindly ask early readers for honest reviews — they're huge for discoverability.",
  },
  {
    keywords: ['kdp', 'ingramspark', 'lulu', 'self-publish', 'self publish', 'distribute', 'publish'],
    answer:
      'Self-publishing (Amazon KDP, IngramSpark, Lulu) gets you full control and speed. Check the "Your Path to Publishing" section below for the full 10-step walkthrough from manuscript to marketing!',
  },
  {
    keywords: ['software', 'program', 'app to draw', 'tool to use', 'what should i use'],
    answer:
      'Popular picks: Clip Studio Paint or Procreate for illustration and lettering, Adobe Photoshop/Illustrator for covers, and Google Docs or Scrivener for scripting. Canva works great if you want a simple start.',
  },
  {
    keywords: ['where do i start', 'how do i start', 'getting started', 'begin my book', 'first step'],
    answer:
      "Start with your manuscript or script — get the full story down before polishing art or layout. Pick a book type up in the \"Pick Your Book Type\" section above for tips tailored to your format!",
  },
]

const greetingWords = ['hi', 'hello', 'hey', 'yo', 'sup', 'howdy']
const thanksWords = ['thanks', 'thank you', 'thx', 'appreciate']
const helpWords = ['help', 'what can you do', 'commands', 'what do you do']

function matchesAny(input: string, words: string[]): boolean {
  return words.some((w) => input.includes(w))
}

export function getHelperReply(rawInput: string, genre: BookTypeId): string {
  const input = rawInput.trim().toLowerCase()
  const genreName = genreNames[genre]

  if (!input) {
    return "Ask me anything — or tap one of the quick suggestions below to get started! 🤖"
  }

  if (input.length < 20 && matchesAny(input, greetingWords)) {
    return `Hey there! 👋 I'm your Fiction Helper, currently tuned to ${genreName}. Ask me for a villain, a hero, a plot twist, a title, a line of dialogue, or how to publish!`
  }

  if (matchesAny(input, thanksWords)) {
    return "You're so welcome! Go make something awesome. 🎉"
  }

  if (matchesAny(input, helpWords)) {
    return "I can brainstorm villains, heroes, plot twists, book titles, and dialogue lines — all tuned to your book type. I can also answer questions about publishing, page counts, and tools. Just ask, or tap a suggestion chip below!"
  }

  if (matchesAny(input, ['villain', 'antagonist', 'bad guy', 'baddie', 'evil'])) {
    return `Try this villain: ${pick(villainIdeas[genre])}`
  }

  if (matchesAny(input, ['hero', 'protagonist', 'main character', 'character idea'])) {
    return `Try this character: ${pick(heroIdeas[genre])}`
  }

  if (matchesAny(input, ['plot twist', 'twist', 'plot idea', 'story idea'])) {
    return `Here's a twist: ${pick(plotTwists[genre])}`
  }

  if (matchesAny(input, ['title', 'name my book', 'name for my book', 'book name'])) {
    const words = titleWords[genre]
    const title = `${words.prefix}${pick(words.adjectives)} ${pick(words.nouns)}`
    return `How about: "${title}"?`
  }

  if (matchesAny(input, ['dialogue', 'line of dialogue', 'quote', 'thing to say', 'what should they say'])) {
    return `Here's a line: ${pick(dialogueLines[genre])}`
  }

  if (matchesAny(input, ['action', 'fight scene', 'battle scene', 'action line', 'sound effect'])) {
    return `Here's an action beat: ${generateActionText(genre)}`
  }

  if (matchesAny(input, ['illustration', 'art idea', 'draw', 'picture', 'scene to draw', 'panel idea'])) {
    return `Here's an illustration idea: ${generateIllustrationIdea(genre)}`
  }

  if (matchesAny(input, ['how many pages', 'how many panels', 'page count', 'panel count', 'how long should'])) {
    return pacingTips[genre]
  }

  const faqMatch = faqEntries.find((entry) => matchesAny(input, entry.keywords))
  if (faqMatch) {
    return faqMatch.answer
  }

  return `I'm not sure about that one yet! Try asking me for a villain, a hero, a plot twist, a title, a line of dialogue, or how to publish — I'll tune it to ${genreName}.`
}

export const quickPrompts = [
  { label: 'Villain idea 😈', prompt: 'Give me a villain idea' },
  { label: 'Hero idea 🦸', prompt: 'Give me a hero idea' },
  { label: 'Plot twist 🔀', prompt: 'Give me a plot twist' },
  { label: 'Book title 📖', prompt: 'Give me a book title' },
  { label: 'Dialogue line 💬', prompt: 'Give me a line of dialogue' },
  { label: 'How to publish 🚀', prompt: 'How do I publish my book?' },
]
