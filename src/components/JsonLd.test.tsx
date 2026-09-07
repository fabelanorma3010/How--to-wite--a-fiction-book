import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import JsonLd from './JsonLd'

describe('JsonLd', () => {
  it('renders valid, parseable JSON-LD for ordinary data', () => {
    const data = { '@type': 'Thing', name: 'Storyburst' }
    const { container } = render(<JsonLd data={data} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).not.toBeNull()
    expect(JSON.parse(script!.innerHTML)).toEqual(data)
  })

  // Regression test: a member's editable display name (or any other
  // user-controlled string) once flowed into JSON.stringify() unescaped,
  // so a value containing "</script>" broke out of this tag and let
  // arbitrary HTML/script run on the page (e.g. via /creators). See the
  // security audit fix in this file for the escaping this protects.
  it('neutralizes a value that tries to close the script tag and inject markup', () => {
    const malicious = 'Alice</script><script>window.pwned = true</script>'
    const data = { '@type': 'Person', name: malicious }
    const { container } = render(<JsonLd data={data} />)

    // The escaped payload must never appear as a literal, parseable closing
    // tag inside the rendered HTML.
    expect(container.innerHTML).not.toContain('</script><script>')

    // Exactly one script tag should exist — a real break-out would add a
    // second, executable <script> element to the DOM.
    const scripts = container.querySelectorAll('script')
    expect(scripts).toHaveLength(1)

    // The JSON-LD content itself must still be intact and round-trip to the
    // original data — this is a security fix, not a data-loss one.
    expect(JSON.parse(scripts[0].innerHTML)).toEqual(data)
  })

  it('escapes "<" generally, not just in the literal "</script>" sequence', () => {
    const data = { note: '1 < 2 and 3 > 1' }
    const { container } = render(<JsonLd data={data} />)
    const script = container.querySelector('script')!
    expect(script.innerHTML).not.toContain('1 < 2')
    expect(JSON.parse(script.innerHTML)).toEqual(data)
  })
})
