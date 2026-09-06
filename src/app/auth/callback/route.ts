import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { isFirstSession, sendWelcomeEmail } from '@/lib/welcomeEmail'

// Return leg of every Supabase Auth redirect: "Continue with Google" (PKCE
// `?code=`), and the email links for confirm-signup / change-email / recovery
// (`?token_hash=&type=`). We turn either into a session cookie and send the
// user on to a safe local path.
export const dynamic = 'force-dynamic'

/** Only allow same-origin relative paths as the post-auth destination. */
function safeNext(raw: string | null): string {
  return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? requestUrl.origin
  const params = requestUrl.searchParams
  const next = safeNext(params.get('next'))
  const providerError = params.get('error_description') ?? params.get('error')

  const fail = (message: string) =>
    NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, origin))

  if (providerError) return fail(providerError)

  const supabase = await createClient()
  if (!supabase) return fail('Could not sign you in.')

  const code = params.get('code')
  const tokenHash = params.get('token_hash')
  const type = params.get('type') as EmailOtpType | null

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return fail(error.message)
    // Google has verified this address — but this same code path fires on
    // every Google login, not just the first, so only welcome brand-new users.
    if (data.user && isFirstSession(data.user)) await sendWelcomeEmail(data.user)
    return NextResponse.redirect(new URL(next, origin))
  }

  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (error) return fail(error.message)
    // Clicking the signup-confirmation link proves the user owns this
    // address — unlike an unconfirmed signUp()'s session, which doesn't.
    if (type === 'signup' && data.user) await sendWelcomeEmail(data.user)
    // An email-change confirmation from the *first* address has no session yet;
    // land on /account either way so the user sees the result.
    return NextResponse.redirect(new URL(type === 'email_change' ? '/account' : next, origin))
  }

  return fail('Could not sign you in.')
}
