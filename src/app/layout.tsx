import type { Metadata, Viewport } from 'next'
import { Baloo_2, Nunito } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
import CookieConsent from '../components/CookieConsent'
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
    <html lang={locale} className={`${baloo2.variable} ${nunito.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider>
          {children}
          <LanguageTab />
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
