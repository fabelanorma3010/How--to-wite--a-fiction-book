'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

export default function LogoutButton({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase?.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button type="button" onClick={handleLogout} className={className}>
      {children}
    </button>
  )
}
