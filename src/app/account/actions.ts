'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface ActionState {
  ok?: string
  error?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

async function requireUser() {
  const supabase = await createClient()
  if (!supabase) return { error: 'Accounts are not available right now.' as const }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Your session has expired — please sign in again.' as const }
  return { supabase, user }
}

export async function updateName(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const firstName = String(formData.get('firstName') ?? '').trim()
  const lastName = String(formData.get('lastName') ?? '').trim()
  if (!firstName) return { error: 'First name is required.' }
  if (firstName.length > 80 || lastName.length > 80) return { error: 'That name is too long.' }

  const auth = await requireUser()
  if ('error' in auth) return { error: auth.error }
  const { supabase, user } = auth

  const name = `${firstName} ${lastName}`.trim()

  const { error } = await supabase
    .from('users')
    .update({ first_name: firstName, last_name: lastName || null, name })
    .eq('id', user.id)
  if (error) return { error: error.message }

  // Mirror onto auth metadata so the header greeting refreshes without a re-read.
  await supabase.auth.updateUser({ data: { first_name: firstName, last_name: lastName, name } })

  revalidatePath('/account')
  revalidatePath('/library/profile')
  return { ok: 'Name updated.' }
}

export async function updateEmail(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  if (!EMAIL_RE.test(email)) return { error: 'Enter a valid email address.' }

  const auth = await requireUser()
  if ('error' in auth) return { error: auth.error }
  const { supabase, user } = auth

  if (email === user.email?.toLowerCase()) return { error: 'That is already your email address.' }

  const site = process.env.NEXT_PUBLIC_SITE_URL
  const { error } = await supabase.auth.updateUser(
    { email },
    site ? { emailRedirectTo: `${site}/auth/callback?next=/account` } : undefined,
  )
  if (error) return { error: error.message }

  return {
    ok: `Almost there. We've emailed a confirmation link to ${user.email} and to ${email} — the change takes effect once you open both.`,
  }
}

export async function updatePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }
  }
  if (password !== confirm) return { error: 'Those passwords do not match.' }

  const auth = await requireUser()
  if ('error' in auth) return { error: auth.error }
  const { supabase } = auth

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  return { ok: 'Password updated.' }
}
