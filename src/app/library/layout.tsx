import type { Metadata } from 'next'
import { Sora, Literata, JetBrains_Mono } from 'next/font/google'

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
})

const literata = Literata({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-literata',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Kinetic Noir — Digital Library',
  description: 'A dark, cinematic comic, manga, and fiction reading experience.',
}

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${sora.variable} ${literata.variable} ${jetbrainsMono.variable} dark`}>
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
