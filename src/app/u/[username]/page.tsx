import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import ShimmerNextImage from '../../../components/ShimmerNextImage'
import { getPublicProfile } from '../../../lib/publicProfile'
import { getCurrentUser } from '../../../lib/user'
import { getUserBooks, type Book } from '../../../lib/books'
import { bookTypes } from '../../../data/bookTypes'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const profile = await getPublicProfile(username)
  if (!profile) {
    return { title: 'Profile — Storyburst', robots: { index: false, follow: false } }
  }
  const title = `${profile.name} (@${profile.username}) — Storyburst`
  const description = profile.bio || `${profile.name}'s Storyburst profile — books, and how to find them elsewhere.`
  return {
    title,
    description,
    alternates: { canonical: `/u/${profile.username}` },
    openGraph: { title, description, url: `/u/${profile.username}`, type: 'profile' },
    twitter: { card: 'summary', title, description },
  }
}

const socialLinks = (profile: NonNullable<Awaited<ReturnType<typeof getPublicProfile>>>) =>
  [
    { label: 'Website', url: profile.websiteUrl },
    { label: 'Instagram', url: profile.instagramUrl },
    { label: 'TikTok', url: profile.tiktokUrl },
    { label: 'YouTube', url: profile.youtubeUrl },
    { label: 'X / Twitter', url: profile.twitterUrl },
  ].filter((link) => link.url)

function typeEmoji(bookType: Book['bookType']) {
  return bookTypes.find((t) => t.id === bookType)?.emoji ?? '📘'
}

function BookCard({ book }: { book: Book }) {
  const card = (
    <div className="group flex flex-col overflow-hidden rounded-2xl border-2 border-ink/10 bg-white/70 transition-colors hover:border-primary/40">
      <div className="relative flex aspect-[2/3] items-center justify-center overflow-hidden bg-base">
        {book.coverUrl ? (
          <ShimmerNextImage
            src={book.coverUrl}
            alt={book.title}
            fill
            sizes="(min-width: 768px) 22vw, 40vw"
            className="object-cover"
          />
        ) : (
          <span className="text-4xl">{typeEmoji(book.bookType)}</span>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-1 text-sm font-bold text-ink">{book.title}</p>
        {book.description && <p className="mt-0.5 line-clamp-2 text-xs text-ink/50">{book.description}</p>}
      </div>
    </div>
  )
  return book.fileUrl ? (
    <a href={book.fileUrl} target="_blank" rel="noopener noreferrer">
      {card}
    </a>
  ) : (
    card
  )
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const [profile, currentUser] = await Promise.all([getPublicProfile(username), getCurrentUser()])
  const books = profile ? await getUserBooks(profile.id) : []
  const favorite = books.find((b) => b.isFavorite)

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-secondary/30 blur-2xl sm:h-72 sm:w-72"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 top-20 h-48 w-48 rounded-full bg-accent/30 blur-2xl sm:h-64 sm:w-64"
          />

          {!profile ? (
            <div className="relative mx-auto max-w-md text-center">
              <p className="text-4xl" aria-hidden="true">
                🔎
              </p>
              <h1 className="mt-2 text-2xl font-extrabold text-ink">Profile not found</h1>
              <p className="mt-2 text-ink/70">
                There's no public profile at <span className="font-semibold">@{username}</span> — it may not
                exist, or its owner has kept it private.
              </p>
            </div>
          ) : (
            <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
              <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-ink/10 bg-white shadow-md">
                {profile.avatarUrl ? (
                  <ShimmerNextImage src={profile.avatarUrl} alt={profile.name} fill sizes="112px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-black text-ink/20">
                    {profile.name[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{profile.name}</h1>
                <p className="mt-1 font-semibold text-ink/50">@{profile.username}</p>
              </div>

              {profile.bio && <p className="max-w-xl text-ink/80">{profile.bio}</p>}

              {socialLinks(profile).length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {socialLinks(profile).map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="rounded-full border-2 border-ink/15 bg-white/70 px-4 py-1.5 text-sm font-bold text-ink transition-colors hover:bg-white"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}

              <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">
                Member since{' '}
                {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </p>

              {currentUser?.id === profile.id && (
                <Link
                  href="/account"
                  className="mt-2 rounded-full bg-ink px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-ink/80"
                >
                  Edit your profile
                </Link>
              )}
            </div>
          )}
        </section>

        {profile && books.length > 0 && (
          <section className="px-4 pb-16 sm:px-6">
            <div className="mx-auto max-w-4xl">
              {favorite && (
                <div className="mb-8">
                  <p className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-accent-content">
                    ★ Favorite
                  </p>
                  <div className="mx-auto max-w-xs">
                    <BookCard book={favorite} />
                  </div>
                </div>
              )}

              {books.length > (favorite ? 1 : 0) && (
                <>
                  <h2 className="mb-4 text-center text-lg font-extrabold text-ink">Books</h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {books
                      .filter((book) => book.id !== favorite?.id)
                      .map((book) => (
                        <BookCard key={book.id} book={book} />
                      ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
