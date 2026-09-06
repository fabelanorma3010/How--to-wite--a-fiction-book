import type { User } from '@supabase/supabase-js'
import { welcomeEmail } from './emailTemplates'
import { hasResendKey, sendEmail } from './resend'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Storyburst <onboarding@resend.dev>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.fiction-book-builder.com'

/**
 * Best-effort welcome-email send. Only call this at a point where the
 * user's email address is actually verified — a completed OAuth exchange,
 * or a clicked signup-confirmation link — never right after an unconfirmed
 * password signUp(), whose session proves nothing about address ownership
 * (with email confirmation off, Supabase mints one for any typed address).
 * Never throws — a Resend hiccup must never break sign-in.
 */
export async function sendWelcomeEmail(user: User): Promise<void> {
  if (!hasResendKey() || !user.email) return
  const name =
    (user.user_metadata?.first_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    ''
  const { subject, html, text } = welcomeEmail(name, SITE_URL)
  try {
    await sendEmail({ to: user.email, from: FROM_EMAIL, subject, text, html })
  } catch {
    // best-effort — never block the sign-in redirect over this
  }
}

/**
 * True the first time a user ever gets a session (fresh signup), false for
 * a returning login — so an OAuth code exchange (reused for every Google
 * sign-in, not just the first) doesn't re-send the welcome email each time.
 */
export function isFirstSession(user: User): boolean {
  if (!user.last_sign_in_at) return true
  const created = new Date(user.created_at).getTime()
  const lastSignIn = new Date(user.last_sign_in_at).getTime()
  return Math.abs(lastSignIn - created) < 60_000
}
