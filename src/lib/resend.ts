// Thin REST wrapper for the Resend API (no SDK — matches gemini.ts). Used by
// /api/contact to actually deliver the contact form, instead of a mailto:
// link that depends on the visitor having a configured email client.

const BASE = 'https://api.resend.com/emails'

export function hasResendKey(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

/** An upstream Resend failure, carrying an HTTP status to forward to the client. */
export class ResendError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ResendError'
    this.status = status
  }
}

interface SendEmailInput {
  to: string
  from: string
  replyTo: string
  subject: string
  text: string
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new ResendError('RESEND_API_KEY is not set.', 503)

  let res: Response
  try {
    res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        to: input.to,
        from: input.from,
        reply_to: input.replyTo,
        subject: input.subject,
        text: input.text,
      }),
    })
  } catch {
    throw new ResendError('Could not reach Resend.', 502)
  }

  if (!res.ok) {
    let message = `Resend returned ${res.status}.`
    try {
      const err = (await res.json()) as { message?: string }
      if (err?.message) message = err.message
    } catch {
      // non-JSON error body — keep the generic status message
    }
    throw new ResendError(message, res.status === 429 ? 429 : 502)
  }
}
