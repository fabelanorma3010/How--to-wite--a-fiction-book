import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import ReadAloud from './ReadAloud'

function renderReadAloud(props: Partial<React.ComponentProps<typeof ReadAloud>> = {}) {
  return render(
    <NextIntlClientProvider
      locale="en"
      messages={{
        ReadAloud: {
          readAloud: 'Read Aloud',
          stop: 'Stop',
          voiceLabel: 'Choose a voice',
          defaultVoice: 'System default',
          characterLabel: 'Voice character',
          preset: { normal: 'Normal', oldMan: 'Silly old man', youngWoman: 'Young woman', clown: 'Clown' },
        },
      }}
    >
      <ReadAloud text="Once upon a time" {...props} />
    </NextIntlClientProvider>,
  )
}

function makeVoice(name: string, lang: string, voiceURI = name): SpeechSynthesisVoice {
  return { name, lang, voiceURI, default: false, localService: true } as SpeechSynthesisVoice
}

describe('ReadAloud', () => {
  afterEach(() => {
    // jsdom has no Web Speech API by default; each test restores that baseline.
    // @ts-expect-error test-only cleanup of a global that may not exist on the type
    delete window.speechSynthesis
    window.localStorage.clear()
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

  it('defaults to the Normal character (pitch and rate both 1)', async () => {
    const speak = vi.fn()
    // @ts-expect-error minimal stub of the browser API this component checks for
    window.speechSynthesis = { cancel: vi.fn(), speak }
    // @ts-expect-error jsdom doesn't provide this constructor
    window.SpeechSynthesisUtterance = function (text: string) {
      return { text }
    }
    const user = userEvent.setup()

    renderReadAloud()
    expect(screen.getByRole('button', { name: 'Normal' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: /read aloud/i }))

    const utterance = speak.mock.calls[0][0]
    expect(utterance.pitch).toBe(1)
    expect(utterance.rate).toBe(1)
  })

  it('picking a silly character shifts pitch and rate, and the choice sticks after a remount', async () => {
    const speak = vi.fn()
    // @ts-expect-error minimal stub of the browser API this component checks for
    window.speechSynthesis = { cancel: vi.fn(), speak }
    // @ts-expect-error jsdom doesn't provide this constructor
    window.SpeechSynthesisUtterance = function (text: string) {
      return { text }
    }
    const user = userEvent.setup()

    const { unmount } = renderReadAloud()
    await user.click(screen.getByRole('button', { name: 'Clown' }))
    await user.click(screen.getByRole('button', { name: /read aloud/i }))

    const firstUtterance = speak.mock.calls[0][0]
    expect(firstUtterance.pitch).toBeGreaterThan(1.5)
    expect(firstUtterance.rate).toBeGreaterThan(1)

    unmount()
    renderReadAloud()
    expect(screen.getByRole('button', { name: 'Clown' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Normal' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows no real-voice picker with zero or one system voice, but shows one with several', () => {
    // @ts-expect-error minimal stub of the browser API this component checks for
    window.speechSynthesis = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [makeVoice('Alex', 'en-US')] }
    const { unmount } = renderReadAloud()
    expect(screen.queryByLabelText('Choose a voice')).not.toBeInTheDocument()
    unmount()

    // @ts-expect-error minimal stub of the browser API this component checks for
    window.speechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn(),
      getVoices: () => [makeVoice('Alex', 'en-US'), makeVoice('Kyoko', 'ja-JP')],
    }
    renderReadAloud()
    expect(screen.getByLabelText('Choose a voice')).toBeInTheDocument()
    expect(screen.getByText('Alex (en-US)')).toBeInTheDocument()
    expect(screen.getByText('Kyoko (ja-JP)')).toBeInTheDocument()
  })

  it('speaks with the chosen real voice once picked', async () => {
    const speak = vi.fn()
    const alex = makeVoice('Alex', 'en-US')
    const kyoko = makeVoice('Kyoko', 'ja-JP')
    // @ts-expect-error minimal stub of the browser API this component checks for
    window.speechSynthesis = { cancel: vi.fn(), speak, getVoices: () => [alex, kyoko] }
    // @ts-expect-error jsdom doesn't provide this constructor
    window.SpeechSynthesisUtterance = function (text: string) {
      return { text }
    }
    const user = userEvent.setup()

    renderReadAloud()
    await user.selectOptions(screen.getByLabelText('Choose a voice'), 'Kyoko')
    await user.click(screen.getByRole('button', { name: /read aloud/i }))

    expect(speak.mock.calls[0][0].voice).toBe(kyoko)
  })
})
