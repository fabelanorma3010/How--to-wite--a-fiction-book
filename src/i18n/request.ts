import { getRequestConfig } from 'next-intl/server'
import { getUserLocale } from './locale'

/**
 * Cookie-driven i18n — there is no locale in the URL. The active language comes
 * from the NEXT_LOCALE cookie, set by the on-page language tab.
 */
export default getRequestConfig(async () => {
  const locale = await getUserLocale()
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
