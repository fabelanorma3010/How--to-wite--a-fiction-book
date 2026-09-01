import { adminClient } from '@/lib/admin'
import type { MemberRow } from '../types'
import MembersTable from './MembersTable'

export const dynamic = 'force-dynamic'

export default async function MembersPage() {
  const supabase = await adminClient()

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, bio, phone, address, avatar_url, created_at, subscriptions(plan, status)')
    .order('created_at', { ascending: false })

  if (error) {
    return <p className="font-semibold text-red-600">Couldn&apos;t load members: {error.message}</p>
  }

  return <MembersTable members={(data ?? []) as unknown as MemberRow[]} />
}
