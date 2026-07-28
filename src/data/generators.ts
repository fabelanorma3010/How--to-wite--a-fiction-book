import type { BookTypeId } from './bookTypes'

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

interface ActionBank {
  sfx: string[]
  heroes: string[]
  verbs: string[]
  settings: string[]
  twists: string[]
}

interface IllustrationBank {
  subjects: string[]
  actions: string[]
  settings: string[]
  details: string[]
  palettes: string[]
}

const actionBanks: Record<BookTypeId, ActionBank> = {
  comic: {
    sfx: ['KA-POW', 'BOOM', 'THWIP', 'KRAKOOM', 'SMASH', 'ZAP', 'WHAM'],
    heroes: [
      'the masked vigilante',
      'Captain Voltage',
      'the rookie hero',
      'the last of the Sky Guard',
      'Nightshade',
      'the reluctant sidekick',
    ],
    verbs: [
      'leaps between',
      'crashes through',
      'sprints across',
      'grapples across',
      'rockets over',
      'slides beneath',
    ],
    settings: [
      'a collapsing skyscraper',
      'the villain\'s underground lair',
      'a rain-soaked rooftop',
      'the city\'s power grid',
      'a speeding freight train',
      'the shattered remains of downtown',
    ],
    twists: [
      'as the last shield generator sparks out',
      'just as the countdown hits zero',
      'while the crowd below gasps in unison',
      'as their cape catches on a girder',
      'right as the villain reveals their true identity',
      'as sirens scream in the distance',
    ],
  },
  manga: {
    sfx: ['DOGOOO', 'GOGOGO', 'ZUUN', 'BATAN', 'SHAAA', 'DOKI DOKI', 'ZAWA ZAWA'],
    heroes: [
      'the transfer student with hidden power',
      'the last dragon-blooded swordsman',
      'senpai, eyes blazing',
      'the childhood rival',
      'the sealed spirit awakening',
      'the underdog of Class 2-B',
    ],
    verbs: [
      'dashes past',
      'unleashes a hidden technique across',
      'skids to a halt in',
      'is sent flying through',
      'appears in a burst of speed behind',
      'clashes blades through',
    ],
    settings: [
      'the crumbling training grounds',
      'the sakura-lined rooftop',
      'the tournament arena',
      'a rain-slicked back alley',
      'the ruins of the old shrine',
      'the school hallway, suddenly silent',
    ],
    twists: [
      'as cherry blossoms scatter in slow motion',
      'while the crowd falls into stunned silence',
      'just as their true power awakens',
      'as a single tear catches the light',
      'right before the flashback hits',
      'as everyone realizes who they really are',
    ],
  },
  cartoon: {
    sfx: ['BOING', 'SPLAT', 'HONK', 'KERPLUNK', 'ZOINK', 'WHOMP', 'SPROING'],
    heroes: [
      'the world\'s clumsiest raccoon',
      'Sir Bounce-a-Lot',
      'the overconfident duck',
      'the accident-prone inventor',
      'the world\'s laziest superhero',
      'the runaway garden gnome',
    ],
    verbs: [
      'bounces straight into',
      'somersaults through',
      'trips spectacularly across',
      'ricochets off the walls of',
      'slides face-first through',
      'launches out of a cannon into',
    ],
    settings: [
      'a pie-throwing contest gone wrong',
      'the world\'s largest rubber-band ball',
      'a runaway shopping cart derby',
      'the world\'s stickiest bakery',
      'a trampoline factory at lunchtime',
      'a lake of purple jello',
    ],
    twists: [
      'and somehow lands perfectly upright',
      'while everyone else falls over laughing',
      'as a rubber chicken flies past for no reason',
      'and gets a pie in the face anyway',
      'as their pants (somehow) stay on',
      'and the crowd bursts into applause',
    ],
  },
  childrens: {
    sfx: ['Whoosh', 'Giggle', 'Pitter-patter', 'Sparkle', 'Flutter', 'Hop-hop', 'Wiggle'],
    heroes: [
      'the littlest firefly',
      'a sleepy baby dragon',
      'the brave paper boat',
      'a tiny snail with a big dream',
      'the friendly cloud named Puff',
      'the curious kitten',
    ],
    verbs: [
      'tiptoes past',
      'floats gently over',
      'skips happily through',
      'peeks around',
      'flutters above',
      'waddles bravely across',
    ],
    settings: [
      'the moonlit garden',
      'a cozy meadow full of dandelions',
      'the big blue puddle',
      'grandma\'s warm kitchen',
      'a forest of giant mushrooms',
      'the top of the tallest, wobbliest tree',
    ],
    twists: [
      'and makes a brand new friend',
      'just before it\'s time for bed',
      'while the stars start to twinkle',
      'and everyone cheers a happy little cheer',
      'and discovers something wonderful',
      'and it\'s the best day ever',
    ],
  },
}

const illustrationBanks: Record<BookTypeId, IllustrationBank> = {
  comic: {
    subjects: [
      'a battle-worn hero mid-landing, cape still rippling',
      'a shadowy villain monologuing atop a gargoyle',
      'a team of heroes bursting through a wall in formation',
      'a hero shielding a civilian from falling debris',
      'a high-speed chase between a hero and a getaway car',
    ],
    actions: [
      'throwing a shockwave punch',
      'skidding to a stop in a shower of sparks',
      'blocking a laser blast with a shield',
      'leaping off a collapsing bridge',
      'unmasking in a dramatic close-up',
    ],
    settings: [
      'a neon-lit rooftop skyline at night',
      'a crumbling secret laboratory',
      'a rain-drenched alley with flickering streetlights',
      'the top of a speeding train',
      'a control room full of blinking monitors',
    ],
    details: [
      'dramatic low-angle framing to make the hero look larger than life',
      'a jagged speed-line burst radiating from the point of impact',
      'heavy black ink shadows for a noir mood',
      'debris and sparks frozen mid-air',
      'a torn cape or costume to show the cost of battle',
    ],
    palettes: [
      'high-contrast primary colors (red, blue, yellow) with deep black shadows',
      'a moody purple-and-teal night palette with hot orange explosions',
      'stark black-and-white with a single spot color for the hero\'s emblem',
      'gritty desaturated tones broken up by one vivid accent color',
    ],
  },
  manga: {
    subjects: [
      'a determined protagonist with wind-swept hair mid-sprint',
      'two rivals locked in a tense stare-down',
      'a spirit creature curling protectively around a small child',
      'a heroine spinning mid-air, skirt and ribbons trailing',
      'a mentor character silhouetted against a setting sun',
    ],
    actions: [
      'unleashing an energy attack with both palms forward',
      'catching a falling classmate in slow motion',
      'gripping a sword hilt, knuckles white',
      'crying quietly while smiling',
      'leaping from rooftop to rooftop under a full moon',
    ],
    settings: [
      'a school rooftop with cherry blossoms drifting past',
      'a torii gate at the edge of a misty forest',
      'a neon-drenched Tokyo side street at night',
      'a tournament arena packed with roaring spectators',
      'a quiet train car at golden hour',
    ],
    details: [
      'fine speed lines radiating outward to sell fast motion',
      'sparkling screentone effects around an emotional close-up',
      'oversized, glistening eyes for a heartfelt reaction shot',
      'flower petals or falling snow drifting through the panel',
      'a dramatic silhouette panel before the big reveal',
    ],
    palettes: [
      'soft pastel pinks and blues for a tender, emotional scene',
      'high-contrast black-and-white with screentone shading',
      'moody indigo night tones lit by a single lantern glow',
      'vivid sunset oranges bleeding into deep purple sky',
    ],
  },
  cartoon: {
    subjects: [
      'a wildly overconfident animal mid-pratfall',
      'a mad-scientist inventor next to a smoking contraption',
      'a group of goofy sidekicks piled on top of each other',
      'a runaway pie soaring toward an unsuspecting face',
      'a tiny hero standing defiantly next to a giant monster',
    ],
    actions: [
      'stretching like taffy around a corner',
      'flattening like a pancake after a fall',
      'juggling something they clearly shouldn\'t be juggling',
      'freezing mid-air with a bug-eyed panicked expression',
      'triumphantly striking a pose atop a pile of chaos',
    ],
    settings: [
      'a chaotic candy factory assembly line',
      'the world\'s bounciest trampoline park',
      'a birthday party that\'s gone hilariously wrong',
      'a leaky rowboat in the middle of a bathtub-sized lake',
      'a backyard obstacle course of the character\'s own making',
    ],
    details: [
      'exaggerated squash-and-stretch limbs for maximum bounce',
      'big bold motion lines and a cloud of dust at impact',
      'wildly oversized eyes popping out in surprise',
      'a trail of banana peels, rubber ducks, or other comic clutter',
      'onomatopoeia lettering baked right into the art',
    ],
    palettes: [
      'bright candy-colored primaries with thick black outlines',
      'sunny yellows and bubblegum pinks for maximum cheer',
      'a bold poster-flat palette with no gradients, just fun',
      'a rainbow gradient background for a big comedic climax',
    ],
  },
  childrens: {
    subjects: [
      'a sleepy baby animal tucked into a leaf blanket',
      'a tiny adventurer holding an oversized flower',
      'a friendly monster with a gap-toothed smile',
      'two new friends holding hands under a rainbow',
      'a curious creature peeking out from behind a mushroom',
    ],
    actions: [
      'waving hello with a big happy grin',
      'splashing gently in a puddle',
      'yawning right before bedtime',
      'sharing a snack with a new friend',
      'looking up in wonder at the night sky',
    ],
    settings: [
      'a cozy treehouse strung with fairy lights',
      'a meadow dotted with oversized, friendly flowers',
      'a warm and toasty kitchen at breakfast time',
      'a starlit hill overlooking a sleepy village',
      'a gentle stream with lily-pad stepping stones',
    ],
    details: [
      'soft rounded shapes with no sharp edges anywhere',
      'a warm little glow around the friendly characters',
      'tiny hidden details for kids to spot on a re-read',
      'oversized, expressive eyes full of warmth',
      'a scattering of stars, fireflies, or floating petals',
    ],
    palettes: [
      'warm pastel yellows, peaches, and soft greens',
      'a cozy dusk palette of lavender, rose, and gold',
      'gentle watercolor washes in sky blue and cream',
      'soft sherbet tones with a warm sunset glow',
    ],
  },
}

export function generateActionText(genre: BookTypeId): string {
  const bank = actionBanks[genre]
  const sfx = pick(bank.sfx)
  const hero = pick(bank.heroes)
  const verb = pick(bank.verbs)
  const setting = pick(bank.settings)
  const twist = pick(bank.twists)
  return `${sfx}! ${hero[0].toUpperCase()}${hero.slice(1)} ${verb} ${setting}, ${twist}!`
}

export function generateIllustrationIdea(genre: BookTypeId): string {
  const bank = illustrationBanks[genre]
  const subject = pick(bank.subjects)
  const action = pick(bank.actions)
  const setting = pick(bank.settings)
  const detail = pick(bank.details)
  const palette = pick(bank.palettes)
  return `Draw ${subject}, ${action}, set in ${setting}. Add ${detail}. Color palette: ${palette}.`
}
