import type { Metadata } from 'next'
import { Baloo_2, Nunito } from 'next/font/google'
import './globals.css'

const baloo2 = Baloo_2({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-baloo',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Storyburst — How to Write & Publish a Fiction Book',
  description:
    "A playful guide and toolkit for writing comics, manga, cartoons, and children's books — with fun action-text and illustration idea generators, plus a step-by-step publishing guide.",
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${baloo2.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  )
}
