'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/admin'
import { getCurrentUser } from '@/lib/user'
import { ROLES, type ActionResult, type Role } from '../types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type MemberValues = {
  name: string
  email: string
  bio: string | null
  phone: string | null
  address: string | null
  avatar_url: string | null
  role: Role
}

function parseForm(formData: FormData): { ok: true; values: MemberValues } | { ok: false; error: string } {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const bio = String(formData.get('bio') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const address = String(formData.get('address') ?? '').trim()
  const avatar_url = String(formData.get('avatar_url') ?? '').trim()
  const role = String(formData.get('role') ?? 'member')

  if (!name) return { ok: false, error: 'Name is required.' }
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'A valid email is required.' }
  if (!ROLES.includes(role as Role)) return { ok: false, error: 'Invalid role.' }

  return {
    ok: true,
    values: {
      name,
      email,
      bio: bio || null,
      phone: phone || null,
      address: address || null,
      avatar_url: avatar_url || null,
      role: role as Role,
    },
  }
}

export async function createMember(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const supabase = await adminClient()
  const parsed = parseForm(formData)
  if (!parsed.ok) return { error: parsed.error }

  const { error } = await supabase.from('users').insert(parsed.values)
  if (error) {
    return { error: error.message.includes('duplicate') ? 'That email is already in use.' : error.message }
  }
  revalidatePath('/admin/members')
  return { ok: true }
}

export async function updateMember(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await adminClient()
  const parsed = parseForm(formData)
  if (!parsed.ok) return { error: parsed.error }

  // Never let editing your own row change your own role — the dropdown is
  // disabled for that row in the UI (so it isn't even submitted), and this
  // strips it server-side too, so an ordinary self-edit (e.g. your phone
  // number) can't accidentally demote you and lock you out of /admin.
  const currentUser = await getCurrentUser()
  const { role, ...rest } = parsed.values
  const values = currentUser?.id === id ? rest : { role, ...rest }

  const { error } = await supabase.from('users').update(values).eq('id', id)
  if (error) {
    return { error: error.message.includes('duplicate') ? 'That email is already in use.' : error.message }
  }
  revalidatePath('/admin/members')
  return { ok: true }
}

export async function deleteMember(id: string): Promise<ActionResult> {
  const supabase = await adminClient()

  const currentUser = await getCurrentUser()
  if (currentUser?.id === id) return { error: "You can't delete your own account from here." }

  // Their subscriptions / posts / reviews / messages / files cascade via the FK.
  const { error } = await supabase.from('users').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/members')
  revalidatePath('/admin/subscriptions')
  return { ok: true }
}
