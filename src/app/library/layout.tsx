import type { Metadata } from 'next'
import { Sora, JetBrains_Mono } from 'next/font/google'

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

export const metadata: Metadata = {
  title: { default: 'Digital Library — Storyburst', template: '%s — Storyburst Digital Library' },
  description: 'A dark, cinematic comic, manga, and fiction reading experience.',
  // Design preview: hardcoded sample data throughout, not real catalog content.
  robots: { index: false, follow: false },
}

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${sora.variable} ${jetbrainsMono.variable} dark`}>
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
