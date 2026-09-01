'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/admin'
import { BILLING_CYCLES, SUBSCRIPTION_STATUSES, type ActionResult } from '../types'

type SubValues = {
  user_id: string
  plan: string
  price: number
  billing_cycle: string
  status: string
  start_date?: string
}

function parseForm(formData: FormData): { ok: true; values: SubValues } | { ok: false; error: string } {
  const user_id = String(formData.get('user_id') ?? '').trim()
  const plan = String(formData.get('plan') ?? '').trim()
  const priceRaw = String(formData.get('price') ?? '').trim()
  const billing_cycle = String(formData.get('billing_cycle') ?? '')
  const start_date = String(formData.get('start_date') ?? '').trim()
  const status = String(formData.get('status') ?? '')

  if (!plan) return { ok: false, error: 'Plan is required.' }
  if (!BILLING_CYCLES.includes(billing_cycle as (typeof BILLING_CYCLES)[number]))
    return { ok: false, error: 'Invalid billing cycle.' }
  if (!SUBSCRIPTION_STATUSES.includes(status as (typeof SUBSCRIPTION_STATUSES)[number]))
    return { ok: false, error: 'Invalid status.' }
  const price = priceRaw === '' ? 0 : Number(priceRaw)
  if (!Number.isFinite(price) || price < 0) return { ok: false, error: 'Price must be a non-negative number.' }

  return {
    ok: true,
    values: { user_id, plan, price, billing_cycle, status, ...(start_date ? { start_date } : {}) },
  }
}

export async function createSubscription(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const supabase = await adminClient()
  const parsed = parseForm(formData)
  if (!parsed.ok) return { error: parsed.error }
  if (!parsed.values.user_id) return { error: 'Pick a member.' }

  const { error } = await supabase.from('subscriptions').insert(parsed.values)
  if (error) return { error: error.message }
  revalidatePath('/admin/subscriptions')
  return { ok: true }
}

export async function updateSubscription(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await adminClient()
  const parsed = parseForm(formData)
  if (!parsed.ok) return { error: parsed.error }

  const { error } = await supabase.from('subscriptions').update(parsed.values).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/subscriptions')
  return { ok: true }
}

export async function deleteSubscription(id: string): Promise<ActionResult> {
  const supabase = await adminClient()
  const { error } = await supabase.from('subscriptions').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/subscriptions')
  return { ok: true }
}
