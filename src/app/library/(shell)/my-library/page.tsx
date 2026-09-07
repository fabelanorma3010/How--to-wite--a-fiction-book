import type { Metadata } from 'next'
import Link from 'next/link'
import { getCurrentUser } from '../../../../lib/user'
import { getSavedBooks } from '../../../../lib/savedBooks'
import MyLibraryClient from './MyLibraryClient'

export const metadata: Metadata = { title: 'My Library' }

// Reads the session, so it can't be statically rendered like its sibling
// (shell) routes.
export const dynamic = 'force-dynamic'

export default async function MyLibraryPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-[16px] py-[24px] md:px-[32px] md:py-[48px]">
        <div className="noir-glass-panel flex flex-col items-center gap-4 rounded-[0.75rem] border border-white/5 p-8 text-center">
          <span className="material-symbols-outlined text-[40px] text-noir-primary-container">bookmark</span>
          <div>
            <h1 className="font-noir-display text-[24px] font-bold text-noir-on-surface">My Library</h1>
            <p className="mt-1 font-noir-mono text-[12px] text-noir-on-surface-variant">
              Sign in to save books and build your own shelf.
            </p>
          </div>
          <Link
            href="/login?next=/library/my-library"
            className="rounded-full bg-noir-primary-fixed px-6 py-2.5 font-noir-display text-[14px] font-semibold text-noir-on-primary-fixed transition-transform hover:scale-105 active:scale-95"
          >
            Log in
          </Link>
        </div>
      </div>
    )
  }

  const savedBooks = await getSavedBooks(user.id)

  return <MyLibraryClient savedBooks={savedBooks} />
}
