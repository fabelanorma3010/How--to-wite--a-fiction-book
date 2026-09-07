import type { Metadata } from 'next'
import {
  Sora,
  JetBrains_Mono,
  Bangers,
  Comic_Neue,
  Dela_Gothic_One,
  Noto_Sans_JP,
  Fredoka,
  Quicksand,
  Patrick_Hand,
  Fraunces,
  Source_Serif_4,
} from 'next/font/google'

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

// One display + one body face per book format, so a published chapter reads
// like its real medium (a comic page, a manga volume, a storybook…) instead
// of one generic reading theme for every kind of book.
const bangers = Bangers({ subsets: ['latin'], weight: ['400'], variable: '--font-bangers', display: 'swap' })
const comicNeue = Comic_Neue({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-comic-neue',
  display: 'swap',
})
const delaGothic = Dela_Gothic_One({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dela-gothic',
  display: 'swap',
})
const notoJp = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-jp',
  display: 'swap',
})
const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
})
const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-quicksand',
  display: 'swap',
})
const patrickHand = Patrick_Hand({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-patrick-hand',
  display: 'swap',
})
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-fraunces',
  display: 'swap',
})
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-source-serif',
  display: 'swap',
})

const formatFontVariables = [
  bangers.variable,
  comicNeue.variable,
  delaGothic.variable,
  notoJp.variable,
  fredoka.variable,
  quicksand.variable,
  patrickHand.variable,
  fraunces.variable,
  sourceSerif.variable,
].join(' ')

export const metadata: Metadata = {
  title: { default: 'Digital Library — Storyburst', template: '%s — Storyburst Digital Library' },
  description: 'A dark, cinematic comic, manga, and fiction reading experience.',
  // Design preview: hardcoded sample data throughout, not real catalog content.
  robots: { index: false, follow: false },
}

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${sora.variable} ${jetbrainsMono.variable} ${formatFontVariables} dark`}>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <div className="min-h-screen bg-noir-background font-noir-display text-noir-on-background antialiased">
        {children}
      </div>
    </div>
  )
}
