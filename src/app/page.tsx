import { getTranslations } from 'next-intl/server'
import App from '../App'
import JsonLd from '../components/JsonLd'
import { bookTypes } from '../data/bookTypes'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.fiction-book-builder.com'

export default async function Page() {
  const bt = await getTranslations('BookTypes')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${siteUrl}/#book-types`,
    name: bt('sectionTitle'),
    itemListElement: bookTypes.map((type, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: bt(`types.${type.id}.name`),
      url: `${siteUrl}/write/${type.id}`,
    })),
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <App />
    </>
  )
}
