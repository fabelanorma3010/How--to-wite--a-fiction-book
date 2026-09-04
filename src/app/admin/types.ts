export const BILLING_CYCLES = ['monthly', 'yearly'] as const
export const SUBSCRIPTION_STATUSES = ['trialing', 'active', 'past_due', 'canceled', 'expired'] as const
export const ROLES = ['member', 'supporter', 'studio', 'admin'] as const
export type Role = (typeof ROLES)[number]
export const ROLE_LABELS: Record<Role, string> = {
  member: 'Free',
  supporter: 'Supporter',
  studio: 'Studio',
  admin: 'Admin',
}

export interface MemberOption {
  id: string
  name: string
  email: string
}

export interface MemberRow {
  id: string
  name: string
  email: string
  bio: string | null
  phone: string | null
  address: string | null
  avatar_url: string | null
  role: Role
  created_at: string
  subscriptions: { plan: string; status: string }[]
}

export interface SubscriptionRow {
  id: string
  user_id: string
  plan: string
  price: number
  billing_cycle: string
  start_date: string
  status: string
  created_at: string
  users: { name: string; email: string } | null
}

export type ActionResult = { ok: true } | { error: string }
