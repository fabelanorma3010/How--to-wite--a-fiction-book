import { getRequestConfig } from 'next-intl/server'
import { getUserLocale } from './locale'
import { defaultLocale } from './config'
import en from '../../messages/en.json'

type Messages = typeof en

function deepMerge<T>(base: T, overlay: Partial<T> | undefined): T {
  if (!overlay) return base
  const out = { ...base } as Record<string, unknown>
  for (const [key, value] of Object.entries(overlay)) {
    const current = out[key]
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      current &&
      typeof current === 'object' &&
      !Array.isArray(current)
    ) {
      out[key] = deepMerge(current, value as Record<string, unknown>)
    } else if (value !== undefined) {
      out[key] = value
    }
  }
  return out as T
}

/**
 * Cookie-driven i18n — there is no locale in the URL. The active language comes
 * from the NEXT_LOCALE cookie, set by the on-page language tab.
 *
 * English is layered underneath every locale, so a key that hasn't been
 * translated yet falls back to English instead of breaking the page. This lets
 * translation land section by section.
 */
export default getRequestConfig(async () => {
  const locale = await getUserLocale()
  const messages =
    locale === defaultLocale
      ? en
      : deepMerge(en, (await import(`../../messages/${locale}.json`)).default as Partial<Messages>)

  return { locale, messages }
})
