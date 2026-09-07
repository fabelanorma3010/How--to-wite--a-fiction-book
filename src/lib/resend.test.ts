import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ResendError, hasResendKey, sendEmail } from './resend'

describe('hasResendKey', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('is false when RESEND_API_KEY is unset', () => {
    vi.stubEnv('RESEND_API_KEY', '')
    expect(hasResendKey()).toBe(false)
  })

  it('is true when RESEND_API_KEY is set', () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key')
    expect(hasResendKey()).toBe(true)
  })
})

describe('sendEmail', () => {
  beforeEach(() => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('throws a 503 ResendError when no API key is configured', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    await expect(sendEmail({ to: 'a@b.com', from: 'x@y.com', subject: 's', text: 't' })).rejects.toMatchObject({
      status: 503,
    })
  })

  it('posts to the Resend API with auth header and only the provided optional fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    vi.stubGlobal('fetch', fetchMock)

    await sendEmail({ to: 'a@b.com', from: 'x@y.com', subject: 'Hi', text: 'body' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.resend.com/emails')
    expect(init.headers.Authorization).toBe('Bearer re_test_key')
    const body = JSON.parse(init.body)
    expect(body).toEqual({ to: 'a@b.com', from: 'x@y.com', subject: 'Hi', text: 'body' })
    expect(body).not.toHaveProperty('reply_to')
    expect(body).not.toHaveProperty('html')
  })

  it('includes reply_to and html only when given', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    vi.stubGlobal('fetch', fetchMock)

    await sendEmail({
      to: 'a@b.com',
      from: 'x@y.com',
      replyTo: 'reply@b.com',
      subject: 'Hi',
      text: 'body',
      html: '<p>body</p>',
    })

    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.reply_to).toBe('reply@b.com')
    expect(body.html).toBe('<p>body</p>')
  })

  it('wraps a network failure in a 502 ResendError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network down')),
    )
    await expect(sendEmail({ to: 'a@b.com', from: 'x@y.com', subject: 's', text: 't' })).rejects.toMatchObject({
      status: 502,
      message: 'Could not reach Resend.',
    })
  })

  it('surfaces the message from a JSON error body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 403, json: async () => ({ message: 'Invalid API key' }) }),
    )
    await expect(sendEmail({ to: 'a@b.com', from: 'x@y.com', subject: 's', text: 't' })).rejects.toMatchObject({
      status: 502,
      message: 'Invalid API key',
    })
  })

  it('falls back to a generic message when the error body is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('not json')
        },
      }),
    )
    await expect(sendEmail({ to: 'a@b.com', from: 'x@y.com', subject: 's', text: 't' })).rejects.toMatchObject({
      status: 502,
      message: 'Resend returned 500.',
    })
  })

  it('preserves a 429 status for rate-limit responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) }),
    )
    await expect(sendEmail({ to: 'a@b.com', from: 'x@y.com', subject: 's', text: 't' })).rejects.toMatchObject({
      status: 429,
    })
  })

  it('ResendError carries the right name', () => {
    const err = new ResendError('boom', 500)
    expect(err.name).toBe('ResendError')
    expect(err).toBeInstanceOf(Error)
  })
})
