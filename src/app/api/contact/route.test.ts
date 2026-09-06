import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendEmailMock = vi.fn()
const checkAiLimitMock = vi.fn()

vi.mock('../../../lib/resend', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/resend')>('../../../lib/resend')
  return {
    ...actual,
    sendEmail: sendEmailMock,
    hasResendKey: () => Boolean(process.env.RESEND_API_KEY),
  }
})

vi.mock('../../../lib/aiLimits', () => ({
  checkAiLimit: checkAiLimitMock,
}))

const { POST } = await import('./route')

function postContact(body: unknown) {
  return POST(
    new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  )
}

describe('/api/contact', () => {
  beforeEach(() => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key')
    checkAiLimitMock.mockResolvedValue(null)
    sendEmailMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('returns 503 when Resend is not configured', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    const res = await postContact({ name: 'Ada', email: 'ada@example.com', message: 'Hi' })
    expect(res.status).toBe(503)
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it('rejects a missing name', async () => {
    const res = await postContact({ name: '', email: 'ada@example.com', message: 'Hi' })
    expect(res.status).toBe(400)
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it('rejects a name containing a line break (CRLF header-injection hardening)', async () => {
    const res = await postContact({ name: 'Evil\r\nBcc: attacker@evil.com', email: 'ada@example.com', message: 'Hi' })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/line breaks/i)
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it('rejects an invalid email', async () => {
    const res = await postContact({ name: 'Ada', email: 'not-an-email', message: 'Hi' })
    expect(res.status).toBe(400)
  })

  it('rejects a missing message', async () => {
    const res = await postContact({ name: 'Ada', email: 'ada@example.com', message: '   ' })
    expect(res.status).toBe(400)
  })

  it('rejects a message over the length cap', async () => {
    const res = await postContact({ name: 'Ada', email: 'ada@example.com', message: 'x'.repeat(5001) })
    expect(res.status).toBe(400)
  })

  it('rejects malformed JSON bodies', async () => {
    const res = await POST(new Request('http://localhost/api/contact', { method: 'POST', body: 'not json' }))
    expect(res.status).toBe(400)
  })

  it('enforces the daily rate limit before sending', async () => {
    checkAiLimitMock.mockResolvedValue({ status: 429, error: 'Too many messages today.' })
    const res = await postContact({ name: 'Ada', email: 'ada@example.com', message: 'Hi' })
    expect(res.status).toBe(429)
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it('sends the email with the visitor set as reply-to on valid input', async () => {
    const res = await postContact({ name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello there' })
    expect(res.status).toBe(200)
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: 'ada@example.com',
        subject: expect.stringContaining('Ada Lovelace'),
        text: expect.stringContaining('Hello there'),
      }),
    )
  })

  it('surfaces a Resend failure as an error response', async () => {
    const { ResendError } = await import('../../../lib/resend')
    sendEmailMock.mockRejectedValue(new ResendError('Invalid API key', 502))
    const res = await postContact({ name: 'Ada', email: 'ada@example.com', message: 'Hi' })
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.error).toBe('Invalid API key')
  })
})
