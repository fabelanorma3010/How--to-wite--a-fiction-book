import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ShimmerNextImage from '../../components/ShimmerNextImage'
import { listPublicProfiles } from '../../lib/publicProfile'

export const dynamic = 'force-dynamic'

const title = 'Creators — Storyburst'
const description =
  "Meet the writers and artists building their comics, manga, cartoons, and children's books on Storyburst."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/creators' },
  openGraph: { title, description, url: '/creators', images: '/opengraph-image' },
  twitter: { card: 'summary', title, description, images: '/opengraph-image' },
}

export default async function CreatorsPage() {
  const profiles = await listPublicProfiles()

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="relative overflow-hidden px-4 pb-4 pt-14 sm:px-6 sm:pt-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/30 blur-2xl sm:h-72 sm:w-72"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 top-20 h-48 w-48 rounded-full bg-accent/30 blur-2xl sm:h-64 sm:w-64"
          />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
            <span className="animate-pop-in rounded-full border-2 border-primary/40 bg-white/70 px-4 py-1.5 text-sm font-bold text-primary-content shadow-sm">
              ✨ Meet the makers
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Creators
              </span>
            </h1>
            <p className="max-w-xl text-lg font-semibold text-ink/70">
              Writers and artists sharing their work on Storyburst. Turn on your own public profile
              from your{' '}
              <Link href="/account" className="underline underline-offset-2 hover:text-ink">
                account page
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="px-4 pb-16 pt-6 sm:px-6">
          {profiles.length === 0 ? (
            <p className="mx-auto max-w-md text-center text-ink/60">
              No public profiles yet — be the first. Add a bio or an avatar in your account and flip
              your profile to public.
            </p>
          ) : (
            <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {profiles.map((profile) => (
                <li key={profile.id}>
                  <Link
                    href={`/u/${profile.username}`}
                    className="group flex h-full flex-col items-center gap-2 rounded-2xl border-2 border-ink/10 bg-white/70 p-4 text-center transition-colors hover:border-primary/40"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-ink/10 bg-base">
                      {profile.avatarUrl ? (
                        <ShimmerNextImage
                          src={profile.avatarUrl}
                          alt={profile.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-black text-ink/20">
                          {profile.name[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                    </div>
                    <p className="line-clamp-1 text-sm font-bold text-ink">{profile.name}</p>
                    <p className="line-clamp-1 text-xs font-semibold text-ink/45">
                      @{profile.username}
                    </p>
                    {profile.bio && (
                      <p className="line-clamp-2 text-xs text-ink/60">{profile.bio}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
