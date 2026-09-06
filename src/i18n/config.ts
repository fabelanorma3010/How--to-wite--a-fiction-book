export const locales = ['en', 'es', 'fr', 'de', 'pt', 'it', 'ja', 'zh', 'hi'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

/** Language name in its own language, for the switcher. */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  it: 'Italiano',
  ja: '日本語',
  zh: '中文',
  hi: 'हिन्दी',
}

export const LOCALE_COOKIE = 'NEXT_LOCALE'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value)
}
