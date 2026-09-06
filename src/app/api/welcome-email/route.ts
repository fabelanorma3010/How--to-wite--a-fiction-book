import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { welcomeEmail } from '../../../lib/emailTemplates'
import { ResendError, hasResendKey, sendEmail } from '../../../lib/resend'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Storyburst <onboarding@resend.dev>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.fiction-book-builder.com'

/**
 * Sends the welcome email to whoever the caller's own Supabase session says
 * they are — never to a client-supplied address. Taking an email address in
 * the request body instead would turn this into an open relay: anyone could
 * call it directly and spam arbitrary inboxes through our Resend account.
 */
export async function POST() {
  if (!hasResendKey()) {
    return NextResponse.json(
      { error: 'Email sending is not configured yet (missing RESEND_API_KEY).' },
      { status: 503 },
    )
  }

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }

  const name =
    (user.user_metadata?.first_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    ''
  const { subject, html, text } = welcomeEmail(name, SITE_URL)

  try {
    await sendEmail({ to: user.email, from: FROM_EMAIL, subject, text, html })
    return NextResponse.json({ success: true })
  } catch (err) {
    const status = err instanceof ResendError ? err.status : 502
    const errorMessage = err instanceof Error ? err.message : 'Could not send the welcome email.'
    return NextResponse.json({ error: errorMessage }, { status })
  }
}
