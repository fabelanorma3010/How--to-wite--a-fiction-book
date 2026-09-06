import { NextResponse } from 'next/server'
import { checkAiLimit } from '../../../lib/aiLimits'
import { ResendError, hasResendKey, sendEmail } from '../../../lib/resend'

const TO_EMAIL = 'fabelanorma3010@gmail.com'
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Storyburst <onboarding@resend.dev>'
const MAX_MESSAGE_CHARS = 5000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  if (!hasResendKey()) {
    return NextResponse.json(
      { error: 'The contact form is not configured yet (missing RESEND_API_KEY).' },
      { status: 503 },
    )
  }

  let name: unknown
  let email: unknown
  let message: unknown
  try {
    const body = await request.json()
    name = body?.name
    email = body?.email
    message = body?.message
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Your name is required.' }, { status: 400 })
  }
  if (/[\r\n]/.test(name)) {
    return NextResponse.json({ error: "Your name can't contain line breaks." }, { status: 400 })
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
  }
  if (typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ error: 'A message is required.' }, { status: 400 })
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json(
      { error: `Keep your message under ${MAX_MESSAGE_CHARS.toLocaleString()} characters.` },
      { status: 400 },
    )
  }

  const limited = await checkAiLimit(request, 'contact')
  if (limited) return NextResponse.json({ error: limited.error }, { status: limited.status })

  try {
    await sendEmail({
      to: TO_EMAIL,
      from: FROM_EMAIL,
      replyTo: email.trim(),
      subject: `Storyburst contact form: ${name.trim()}`,
      text: `${message.trim()}\n\n— ${name.trim()} (${email.trim()})`,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    const status = err instanceof ResendError ? err.status : 502
    const errorMessage = err instanceof Error ? err.message : 'Could not send your message.'
    return NextResponse.json({ error: errorMessage }, { status })
  }
}
