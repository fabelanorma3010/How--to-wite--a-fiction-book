import Link from 'next/link'
import ShimmerNextImage from '@/components/ShimmerNextImage'
import FollowButton from '@/components/FollowButton'
import type { FollowedProfile } from '@/lib/follows'

export default function FollowingList({
  viewerId,
  following,
}: {
  viewerId: string
  following: FollowedProfile[]
}) {
  if (following.length === 0) return null

  return (
    <div className="rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-extrabold text-ink">People you follow</h2>
      <p className="mt-1 text-sm text-ink/60">Tap a name to check out their profile.</p>
      <ul className="mt-4 space-y-2">
        {following.map((profile) => (
          <li
            key={profile.id}
            className="flex items-center gap-3 rounded-2xl border-2 border-ink/10 bg-white/60 p-3"
          >
            <Link href={`/u/${profile.username}`} className="flex min-w-0 flex-1 items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-ink/10 bg-page">
                {profile.avatarUrl ? (
                  <ShimmerNextImage src={profile.avatarUrl} alt="" fill sizes="40px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-black text-ink/20">
                    {profile.name[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold text-ink">{profile.name}</p>
                <p className="truncate text-xs text-ink/50">@{profile.username}</p>
              </div>
            </Link>
            <FollowButton viewerId={viewerId} profileId={profile.id} initialFollowing={true} />
          </li>
        ))}
      </ul>
    </div>
  )
}
