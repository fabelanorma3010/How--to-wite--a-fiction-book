import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import ReadAloud from './ReadAloud'

const messages = {
  ReadAloud: {
    readAloud: 'Read Aloud',
    stop: 'Stop',
    voiceLabel: 'Choose a voice',
    defaultVoice: 'System default',
    characterLabel: 'Voice character',
    preset: { normal: 'Normal', oldMan: 'Silly old man', youngWoman: 'Young woman', clown: 'Clown' },
    translateLabel: 'Translate to',
    originalLanguage: 'Original',
    translating: 'Translating…',
    translateError: "Couldn't translate that. Try again in a moment.",
    translatedLabel: 'Translation',
    language: {
      en: 'English',
      de: 'German',
      es: 'Spanish',
      fr: 'French',
      hi: 'Hindi',
      it: 'Italian',
      ja: 'Japanese',
      pt: 'Portuguese',
      zh: 'Chinese',
    },
  },
}

function renderReadAloud(props: Partial<React.ComponentProps<typeof ReadAloud>> = {}) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
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
    vi.restoreAllMocks()
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

  it('shows a translate picker offering the original plus all 9 languages', () => {
    // @ts-expect-error minimal stub of the browser API this component checks for
    window.speechSynthesis = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [] }
    renderReadAloud()
    const picker = screen.getByLabelText('Translate to') as HTMLSelectElement
    expect(picker).toBeInTheDocument()
    expect(screen.getByText('Original')).toBeInTheDocument()
    expect(screen.getByText('Spanish')).toBeInTheDocument()
    expect(screen.getByText('Japanese')).toBeInTheDocument()
  })

  it('is disabled when there is no text, same as the read-aloud button', () => {
    // @ts-expect-error minimal stub of the browser API this component checks for
    window.speechSynthesis = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [] }
    renderReadAloud({ text: '' })
    expect(screen.getByLabelText('Translate to')).toBeDisabled()
  })

  it('translates the text, shows the result, and speaks the translation once ready', async () => {
    const speak = vi.fn()
    // @ts-expect-error minimal stub of the browser API this component checks for
    window.speechSynthesis = { cancel: vi.fn(), speak, getVoices: () => [] }
    // @ts-expect-error jsdom doesn't provide this constructor
    window.SpeechSynthesisUtterance = function (text: string) {
      return { text }
    }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 'Érase una vez' }),
    }) as unknown as typeof fetch
    const user = userEvent.setup()

    renderReadAloud()
    await user.selectOptions(screen.getByLabelText('Translate to'), 'es')

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/writing-tools',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ text: 'Once upon a time', mode: 'translate', targetLang: 'es' }),
      }),
    )
    expect(await screen.findByText('Érase una vez')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /read aloud/i }))
    expect(speak.mock.calls[0][0].text).toBe('Érase una vez')
  })

  it('caches a translation instead of re-fetching when picked again', async () => {
    // @ts-expect-error minimal stub of the browser API this component checks for
    window.speechSynthesis = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [] }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 'Es war einmal' }),
    }) as unknown as typeof fetch
    const user = userEvent.setup()

    renderReadAloud()
    await user.selectOptions(screen.getByLabelText('Translate to'), 'de')
    await screen.findByText('Es war einmal')
    await user.selectOptions(screen.getByLabelText('Translate to'), 'Original')
    await user.selectOptions(screen.getByLabelText('Translate to'), 'de')

    expect(screen.getByText('Es war einmal')).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('keeps a cached translation when the text prop switches away and back (e.g. changing panels)', async () => {
    // @ts-expect-error minimal stub of the browser API this component checks for
    window.speechSynthesis = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [] }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 'Es war einmal' }),
    }) as unknown as typeof fetch
    const user = userEvent.setup()

    const { rerender } = renderReadAloud()
    await user.selectOptions(screen.getByLabelText('Translate to'), 'de')
    await screen.findByText('Es war einmal')

    // Simulate PanelBuilder swapping in another panel's text box, then back
    // to this one — the same ReadAloud instance is reused across panels.
    rerender(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ReadAloud text="A different panel's caption" />
      </NextIntlClientProvider>,
    )
    expect(screen.queryByText('Es war einmal')).not.toBeInTheDocument()

    rerender(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ReadAloud text="Once upon a time" />
      </NextIntlClientProvider>,
    )

    expect(screen.getByText('Es war einmal')).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('auto-picks a voice matching the target language', async () => {
    const speak = vi.fn()
    const alex = makeVoice('Alex', 'en-US')
    const kyoko = makeVoice('Kyoko', 'ja-JP')
    // @ts-expect-error minimal stub of the browser API this component checks for
    window.speechSynthesis = { cancel: vi.fn(), speak, getVoices: () => [alex, kyoko] }
    // @ts-expect-error jsdom doesn't provide this constructor
    window.SpeechSynthesisUtterance = function (text: string) {
      return { text }
    }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: '昔々' }),
    }) as unknown as typeof fetch
    const user = userEvent.setup()

    renderReadAloud()
    await user.selectOptions(screen.getByLabelText('Translate to'), 'ja')
    await screen.findByText('昔々')
    await user.click(screen.getByRole('button', { name: /read aloud/i }))

    expect(speak.mock.calls[0][0].voice).toBe(kyoko)
  })

  it('shows an error and keeps working when translation fails', async () => {
    // @ts-expect-error minimal stub of the browser API this component checks for
    window.speechSynthesis = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [] }
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Rate limited' }),
    }) as unknown as typeof fetch
    const user = userEvent.setup()

    renderReadAloud()
    await user.selectOptions(screen.getByLabelText('Translate to'), 'fr')

    expect(await screen.findByText('Rate limited')).toBeInTheDocument()
  })

  it('reverts to the original text after switching back from a translation', async () => {
    const speak = vi.fn()
    // @ts-expect-error minimal stub of the browser API this component checks for
    window.speechSynthesis = { cancel: vi.fn(), speak, getVoices: () => [] }
    // @ts-expect-error jsdom doesn't provide this constructor
    window.SpeechSynthesisUtterance = function (text: string) {
      return { text }
    }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 'Il était une fois' }),
    }) as unknown as typeof fetch
    const user = userEvent.setup()

    renderReadAloud()
    await user.selectOptions(screen.getByLabelText('Translate to'), 'fr')
    await screen.findByText('Il était une fois')
    await user.selectOptions(screen.getByLabelText('Translate to'), 'Original')
    await user.click(screen.getByRole('button', { name: /read aloud/i }))

    expect(speak.mock.calls[0][0].text).toBe('Once upon a time')
  })
})
