import { adminClient } from '@/lib/admin'
import type { MemberOption, SubscriptionRow } from '../types'
import SubscriptionsTable from './SubscriptionsTable'

export const dynamic = 'force-dynamic'

export default async function SubscriptionsPage() {
  const supabase = await adminClient()

  const [subs, members] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('id, user_id, plan, price, billing_cycle, start_date, status, created_at, users(name, email)')
      .order('created_at', { ascending: false }),
    supabase.from('users').select('id, name, email').order('name'),
  ])

  if (subs.error) {
    return <p className="font-semibold text-red-600">Couldn&apos;t load subscriptions: {subs.error.message}</p>
  }

  return (
    <SubscriptionsTable
      subscriptions={(subs.data ?? []) as unknown as SubscriptionRow[]}
      members={(members.data ?? []) as MemberOption[]}
    />
  )
}
