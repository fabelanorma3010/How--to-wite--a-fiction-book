import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import AccountForms from '../../components/account/AccountForms'
import BookManager from '../../components/account/BookManager'
import { getCurrentUser } from '../../lib/user'
import { getUserBooks } from '../../lib/books'

export const metadata: Metadata = {
  title: 'Your Account — Storyburst',
  description: 'Manage your Storyburst name, email address, and password.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/account')
  const books = await getUserBooks(user.id)

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="relative overflow-hidden px-4 pb-8 pt-14 sm:px-6 sm:pt-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-secondary/30 blur-2xl sm:h-72 sm:w-72"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 top-20 h-48 w-48 rounded-full bg-primary/30 blur-2xl sm:h-64 sm:w-64"
          />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <span className="animate-pop-in rounded-full border-2 border-primary/40 bg-white/70 px-4 py-1.5 text-sm font-bold text-primary-content shadow-sm">
              ⚙️ Signed in as {user.email}
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              Account{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Settings
              </span>
            </h1>
            <p className="max-w-xl text-ink/70">
              Update your name, email address, and password.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6">
          <div className="mx-auto max-w-md space-y-6">
            <AccountForms
              userId={user.id}
              firstName={user.firstName}
              lastName={user.lastName}
              email={user.email}
              hasPassword={user.hasPassword}
              avatarUrl={user.avatarUrl}
              username={user.username}
              bio={user.bio}
              websiteUrl={user.websiteUrl}
              instagramUrl={user.instagramUrl}
              tiktokUrl={user.tiktokUrl}
              youtubeUrl={user.youtubeUrl}
              twitterUrl={user.twitterUrl}
              isPublic={user.isPublic}
            />
            <BookManager userId={user.id} books={books} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
