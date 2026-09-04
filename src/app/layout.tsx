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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fiction-book-builder.com'
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
      inLanguage: 'en',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${baloo2.variable} ${nunito.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
