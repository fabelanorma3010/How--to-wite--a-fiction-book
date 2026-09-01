import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import AdminNav from './AdminNav'
import { signOut } from './actions'

export const metadata: Metadata = {
  title: 'Admin — Storyburst',
  robots: { index: false, follow: false },
}

// /admin reads cookies and Supabase config at request time — never prerender it.
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const admin = isAdminEmail(user?.email)

  return (
    <div className="min-h-screen bg-base text-ink">
      <header className="border-b-2 border-ink/10 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="font-extrabold">Storyburst Admin</span>
            {admin && <AdminNav />}
          </div>
          {admin && (
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-sm font-bold text-ink/60 transition-colors hover:bg-ink/10 hover:text-ink"
              >
                Sign out · {user?.email}
              </button>
            </form>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
