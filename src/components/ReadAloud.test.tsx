import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import ReadAloud from './ReadAloud'

function renderReadAloud(props: Partial<React.ComponentProps<typeof ReadAloud>> = {}) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ ReadAloud: { readAloud: 'Read Aloud', stop: 'Stop' } }}>
      <ReadAloud text="Once upon a time" {...props} />
    </NextIntlClientProvider>,
  )
}

describe('ReadAloud', () => {
  afterEach(() => {
    // jsdom has no Web Speech API by default; each test restores that baseline.
    // @ts-expect-error test-only cleanup of a global that may not exist on the type
    delete window.speechSynthesis
  })

  it('renders nothing when speechSynthesis is unsupported', () => {
    const { container } = renderReadAloud()
    expect(container).toBeEmptyDOMElement()
  })

  it('is disabled when there is no text to read, once supported', () => {
    // @ts-expect-error minimal stub of the browser API this component checks for
    window.speechSynthesis = { cancel: vi.fn(), speak: vi.fn() }
    renderReadAloud({ text: '' })
    expect(screen.getByRole('button', { name: /read aloud/i })).toBeDisabled()
  })

  it('speaks the given text and toggles to a Stop button', async () => {
    const speak = vi.fn()
    const cancel = vi.fn()
    // @ts-expect-error minimal stub of the browser API this component checks for
    window.speechSynthesis = { cancel, speak }
    // @ts-expect-error jsdom doesn't provide this constructor
    window.SpeechSynthesisUtterance = function (text: string) {
      return { text }
    }
    const user = userEvent.setup()

    renderReadAloud()
    await user.click(screen.getByRole('button', { name: /read aloud/i }))

    expect(speak).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
  })
})
