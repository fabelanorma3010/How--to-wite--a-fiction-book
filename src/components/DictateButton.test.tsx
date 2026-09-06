import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import DictateButton from './DictateButton'

function renderDictate(onResult = vi.fn()) {
  render(
    <NextIntlClientProvider locale="en" messages={{ Dictate: { dictate: 'Dictate', stop: 'Stop' } }}>
      <DictateButton onResult={onResult} />
    </NextIntlClientProvider>,
  )
  return onResult
}

class FakeSpeechRecognition {
  static instances: FakeSpeechRecognition[] = []
  continuous = false
  interimResults = false
  lang = ''
  start = vi.fn()
  stop = vi.fn()
  onresult: ((event: { resultIndex: number; results: { 0: { transcript: string } }[] }) => void) | null = null
  onerror: (() => void) | null = null
  onend: (() => void) | null = null

  constructor() {
    FakeSpeechRecognition.instances.push(this)
  }
}

describe('DictateButton', () => {
  afterEach(() => {
    FakeSpeechRecognition.instances = []
    // @ts-expect-error test-only cleanup
    delete window.SpeechRecognition
    // @ts-expect-error test-only cleanup
    delete window.webkitSpeechRecognition
  })

  it('renders nothing when the browser has no SpeechRecognition support', () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={{ Dictate: { dictate: 'Dictate', stop: 'Stop' } }}>
        <DictateButton onResult={vi.fn()} />
      </NextIntlClientProvider>,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('starts listening and toggles to a Stop button', async () => {
    // @ts-expect-error minimal stub for the constructor this component looks for
    window.SpeechRecognition = FakeSpeechRecognition
    const user = userEvent.setup()

    renderDictate()
    await user.click(screen.getByRole('button', { name: /dictate/i }))

    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
    expect(FakeSpeechRecognition.instances[0].start).toHaveBeenCalledTimes(1)
  })

  it('forwards the recognized transcript to onResult', async () => {
    // @ts-expect-error minimal stub for the constructor this component looks for
    window.SpeechRecognition = FakeSpeechRecognition
    const user = userEvent.setup()
    const onResult = renderDictate()

    await user.click(screen.getByRole('button', { name: /dictate/i }))
    const recognition = FakeSpeechRecognition.instances[0]
    recognition.onresult?.({ resultIndex: 0, results: [{ 0: { transcript: 'hello world' } }] })

    expect(onResult).toHaveBeenCalledWith('hello world')
  })

  it('does not forward a blank transcript', async () => {
    // @ts-expect-error minimal stub for the constructor this component looks for
    window.SpeechRecognition = FakeSpeechRecognition
    const user = userEvent.setup()
    const onResult = renderDictate()

    await user.click(screen.getByRole('button', { name: /dictate/i }))
    const recognition = FakeSpeechRecognition.instances[0]
    recognition.onresult?.({ resultIndex: 0, results: [{ 0: { transcript: '   ' } }] })

    expect(onResult).not.toHaveBeenCalled()
  })

  it('stops listening when clicked again', async () => {
    // @ts-expect-error minimal stub for the constructor this component looks for
    window.SpeechRecognition = FakeSpeechRecognition
    const user = userEvent.setup()

    renderDictate()
    const button = screen.getByRole('button', { name: /dictate/i })
    await user.click(button)
    await user.click(screen.getByRole('button', { name: /stop/i }))

    expect(FakeSpeechRecognition.instances[0].stop).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: /dictate/i })).toBeInTheDocument()
  })
})
