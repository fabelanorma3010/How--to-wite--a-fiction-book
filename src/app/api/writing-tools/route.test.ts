import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const geminiChatMock = vi.fn()
const hasGeminiKeyMock = vi.fn()
const checkAiLimitMock = vi.fn()

vi.mock('../../../lib/gemini', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/gemini')>('../../../lib/gemini')
  return {
    ...actual,
    hasGeminiKey: hasGeminiKeyMock,
    geminiChat: geminiChatMock,
  }
})

vi.mock('../../../lib/aiLimits', () => ({
  checkAiLimit: checkAiLimitMock,
}))

const { POST } = await import('./route')

function postTools(body: unknown) {
  return POST(
    new Request('http://localhost/api/writing-tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  )
}

describe('/api/writing-tools', () => {
  beforeEach(() => {
    vi.stubEnv('ANTHROPIC_API_KEY', '')
    hasGeminiKeyMock.mockReturnValue(true)
    checkAiLimitMock.mockResolvedValue(null)
    geminiChatMock.mockResolvedValue('Once upon a time, in Spanish.')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('returns 503 when neither Gemini nor Anthropic is configured', async () => {
    hasGeminiKeyMock.mockReturnValue(false)
    const res = await postTools({ text: 'Hello', mode: 'summarize' })
    expect(res.status).toBe(503)
    expect(geminiChatMock).not.toHaveBeenCalled()
  })

  it('rejects an unknown mode', async () => {
    const res = await postTools({ text: 'Hello', mode: 'not-a-real-mode' })
    expect(res.status).toBe(400)
  })

  it('rejects empty text', async () => {
    const res = await postTools({ text: '   ', mode: 'summarize' })
    expect(res.status).toBe(400)
  })

  it('rejects text over the length cap', async () => {
    const res = await postTools({ text: 'x'.repeat(50_001), mode: 'summarize' })
    expect(res.status).toBe(400)
  })

  it('enforces the rate limit before calling the AI', async () => {
    checkAiLimitMock.mockResolvedValue({ status: 429, error: 'Too many requests today.' })
    const res = await postTools({ text: 'Hello', mode: 'summarize' })
    expect(res.status).toBe(429)
    expect(geminiChatMock).not.toHaveBeenCalled()
  })

  it('still runs the existing fixed-prompt modes (summarize) unchanged', async () => {
    const res = await postTools({ text: 'A long story.', mode: 'summarize' })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.result).toBe('Once upon a time, in Spanish.')
    expect(geminiChatMock).toHaveBeenCalledWith(
      expect.stringContaining('summarization assistant'),
      [{ role: 'user', text: 'A long story.' }],
      expect.any(Number),
    )
  })

  it('rejects translate mode with no targetLang', async () => {
    const res = await postTools({ text: 'Hello', mode: 'translate' })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/language/i)
    expect(geminiChatMock).not.toHaveBeenCalled()
  })

  it('rejects translate mode with a target language outside the supported 9', async () => {
    const res = await postTools({ text: 'Hello', mode: 'translate', targetLang: 'klingon' })
    expect(res.status).toBe(400)
    expect(geminiChatMock).not.toHaveBeenCalled()
  })

  it('translates into the requested language and returns only the translation', async () => {
    geminiChatMock.mockResolvedValue('Érase una vez')
    const res = await postTools({ text: 'Once upon a time', mode: 'translate', targetLang: 'es' })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.result).toBe('Érase una vez')
    expect(geminiChatMock).toHaveBeenCalledWith(
      expect.stringContaining('Spanish'),
      [{ role: 'user', text: 'Once upon a time' }],
      expect.any(Number),
    )
  })

  it('falls back to Anthropic when Gemini fails and a key is configured', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'sk-ant-test')
    const { GeminiError } = await import('../../../lib/gemini')
    geminiChatMock.mockRejectedValue(new GeminiError('Gemini is down', 502))

    const createMock = vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'Il était une fois' }],
    })
    vi.doMock('@anthropic-ai/sdk', () => {
      class FakeAnthropic {
        messages = { create: createMock }
        static APIError = class extends Error {}
      }
      return { default: FakeAnthropic }
    })
    vi.resetModules()
    const { POST: freshPOST } = await import('./route')

    const res = await freshPOST(
      new Request('http://localhost/api/writing-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Once upon a time', mode: 'translate', targetLang: 'fr' }),
      }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.result).toBe('Il était une fois')
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ system: expect.stringContaining('French') }),
    )
    vi.doUnmock('@anthropic-ai/sdk')
  })
})
