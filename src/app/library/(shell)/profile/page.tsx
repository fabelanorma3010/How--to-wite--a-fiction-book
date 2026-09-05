import type { Metadata } from 'next'
import Link from 'next/link'
import ShimmerNextImage from '../../../../components/ShimmerNextImage'
import LogoutButton from '../../../../components/library/LogoutButton'
import { getCurrentUser } from '../../../../lib/user'

export const metadata: Metadata = { title: 'Profile' }

// Reads the session, so it can't be statically rendered like its sibling
// (shell) routes.
export const dynamic = 'force-dynamic'

const rowClass =
  'flex items-center gap-4 rounded-[0.5rem] border border-white/5 bg-noir-surface-container-low px-6 py-4 text-left font-noir-display text-[16px] text-noir-on-surface-variant transition-colors hover:bg-white/5 hover:text-noir-on-surface'

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-[16px] py-[24px] md:px-[32px] md:py-[48px]">
        <div className="noir-glass-panel flex flex-col items-center gap-4 rounded-[0.75rem] border border-white/5 p-8 text-center">
          <span className="material-symbols-outlined text-[40px] text-noir-primary-container">account_circle</span>
          <div>
            <h1 className="font-noir-display text-[24px] font-bold text-noir-on-surface">Your account</h1>
            <p className="mt-1 font-noir-mono text-[12px] text-noir-on-surface-variant">
              Sign in to manage your name, email, and password.
            </p>
          </div>
          <Link
            href="/login?next=/library/profile"
            className="rounded-full bg-noir-primary-fixed px-6 py-2.5 font-noir-display text-[14px] font-semibold text-noir-on-primary-fixed transition-transform hover:scale-105 active:scale-95"
          >
            Log in
          </Link>
        </div>
      </div>
    )
  }

  const initials =
    [user.firstName, user.lastName]
      .filter(Boolean)
      .map((part) => part[0]!.toUpperCase())
      .join('') ||
    user.name[0]?.toUpperCase() ||
    '?'

  return (
    <div className="mx-auto max-w-2xl px-[16px] py-[24px] md:px-[32px] md:py-[48px]">
      <div className="noir-glass-panel mb-[48px] flex flex-col items-center gap-4 rounded-[0.75rem] border border-white/5 p-8 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-noir-surface-container-lowest font-noir-display text-[24px] font-black text-noir-primary-container">
          {user.avatarUrl ? <ShimmerNextImage alt="" src={user.avatarUrl} fill sizes="80px" className="object-cover" /> : initials}
        </div>
        <div>
          <h1 className="font-noir-display text-[24px] font-bold text-noir-on-surface">{user.name}</h1>
          <p className="mt-1 font-noir-mono text-[12px] text-noir-primary-container">
            {user.isAdmin ? 'Administrator' : 'Member'}
          </p>
          <p className="font-noir-mono text-[12px] text-noir-on-surface-variant">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link href="/account" className={rowClass}>
          <span className="material-symbols-outlined">settings</span>
          Manage your account
          <span className="material-symbols-outlined ml-auto">chevron_right</span>
        </Link>
        <Link href="/library/history" className={rowClass}>
          <span className="material-symbols-outlined">history</span>
          Reading history
          <span className="material-symbols-outlined ml-auto">chevron_right</span>
        </Link>
        {user.isAdmin && (
          <Link href="/admin" className={rowClass}>
            <span className="material-symbols-outlined">shield_person</span>
            Admin dashboard
            <span className="material-symbols-outlined ml-auto">chevron_right</span>
          </Link>
        )}
        <LogoutButton className={`${rowClass} w-full md:hidden`}>
          <span className="material-symbols-outlined">logout</span>
          Log out
        </LogoutButton>
      </div>
    </div>
  )
}
