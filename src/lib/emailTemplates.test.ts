import { describe, expect, it } from 'vitest'
import { welcomeEmail } from './emailTemplates'

const SITE_URL = 'https://example.com'

describe('welcomeEmail', () => {
  it('includes the name, a greeting, and a CTA button linking to the quiz', () => {
    const { html, text } = welcomeEmail('Ada', SITE_URL)
    expect(html).toContain('Welcome, Ada!')
    expect(html).toContain(`href="${SITE_URL}/#quiz"`)
    expect(text).toContain('Welcome, Ada!')
    expect(text).toContain(`${SITE_URL}/#quiz`)
  })

  it('falls back to "there" for a blank or whitespace-only name', () => {
    expect(welcomeEmail('', SITE_URL).text).toContain('Welcome, there!')
    expect(welcomeEmail('   ', SITE_URL).text).toContain('Welcome, there!')
  })

  it('trims surrounding whitespace from the name', () => {
    expect(welcomeEmail('  Ada  ', SITE_URL).text).toContain('Welcome, Ada!')
  })

  it('HTML-escapes a name containing markup, so it cannot inject into the email', () => {
    const malicious = '<img src=x onerror=alert(1)>'
    const { html } = welcomeEmail(malicious, SITE_URL)
    expect(html).not.toContain(malicious)
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
  })

  it('HTML-escapes a name that tries to close the surrounding tag', () => {
    const malicious = '</h1><script>alert(document.cookie)</script>'
    const { html } = welcomeEmail(malicious, SITE_URL)
    expect(html).not.toContain('</h1><script>')
    expect(html).not.toContain('<script>alert')
  })

  it('does not escape the plain-text body, since it needs no HTML escaping', () => {
    const { text } = welcomeEmail("O'Brien", SITE_URL)
    expect(text).toContain("O'Brien")
  })

  it('subject is a stable, non-empty literal', () => {
    const { subject } = welcomeEmail('Ada', SITE_URL)
    expect(subject).toBeTruthy()
    expect(welcomeEmail('Bob', SITE_URL).subject).toBe(subject)
  })
})
