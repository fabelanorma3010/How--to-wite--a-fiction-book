import type { Metadata, Viewport } from 'next'
import {
  Baloo_2,
  Nunito,
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
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
import CookieConsent from '../components/CookieConsent'
import JsonLd from '../components/JsonLd'
import LanguageTab from '../components/LanguageTab'
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

// One display + one body face per book format, so a book looks like its real
// medium (a comic page, a manga volume, a storybook…) both while it's being
// built (the account chapter editor) and while it's being read (/library).
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.fiction-book-builder.com'
const title = 'Storyburst — How to Write & Publish a Fiction Book'
const description =
  "Free tools to write and publish comics, manga, cartoons, and children's books: a format quiz, story generators, an auto-saving notebook, and a step-by-step publishing guide."

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Storyburst',
      description,
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Storyburst',
      url: siteUrl,
      logo: `${siteUrl}/favicon.svg`,
    },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: '%s' },
  description,
  alternates: { canonical: '/' },
  icons: {
    icon: '/favicon.svg',
  },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'Storyburst',
    title,
    description,
    url: '/',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
}

export const viewport: Viewport = {
  themeColor: '#e879f9',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()

  return (
    <html lang={locale} className={`${baloo2.variable} ${nunito.variable} ${formatFontVariables}`}>
      <body>
        <JsonLd data={jsonLd} />
        <NextIntlClientProvider>
          {children}
          <LanguageTab />
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
