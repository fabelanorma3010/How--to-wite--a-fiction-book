'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateEmail, updateName, updatePassword, updateProfile, type ActionState } from '@/app/account/actions'
import AvatarUploader from './AvatarUploader'

const initial: ActionState = {}

const cardClass = 'rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8'
const labelClass = 'mb-1.5 block text-sm font-bold text-ink/80'
const inputClass =
  'w-full rounded-2xl border-2 border-ink/15 bg-base/80 px-4 py-2.5 text-ink placeholder:text-ink/40 focus:border-primary/50'
const buttonClass =
  'mt-6 rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100'

function Status({ state }: { state: ActionState }) {
  if (state.error) {
    return (
      <p role="alert" className="mt-4 text-sm font-semibold text-red-600">
        {state.error}
      </p>
    )
  }
  if (state.ok) {
    return (
      <p role="status" className="mt-4 text-sm font-semibold text-emerald-700">
        {state.ok}
      </p>
    )
  }
  return null
}

export default function AccountForms({
  userId,
  firstName,
  lastName,
  email,
  hasPassword,
  avatarUrl,
  username,
  bio,
  websiteUrl,
  instagramUrl,
  tiktokUrl,
  youtubeUrl,
  twitterUrl,
  isPublic,
}: {
  userId: string
  firstName: string
  lastName: string
  email: string
  hasPassword: boolean
  avatarUrl: string | null
  username: string | null
  bio: string
  websiteUrl: string
  instagramUrl: string
  tiktokUrl: string
  youtubeUrl: string
  twitterUrl: string
  isPublic: boolean
}) {
  const router = useRouter()
  const [nameState, nameAction, namePending] = useActionState(updateName, initial)
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, initial)
  const [emailState, emailAction, emailPending] = useActionState(updateEmail, initial)
  const [passwordState, passwordAction, passwordPending] = useActionState(updatePassword, initial)

  useEffect(() => {
    if (nameState.ok) router.refresh()
  }, [nameState, router])
  useEffect(() => {
    if (profileState.ok) router.refresh()
  }, [profileState, router])

  return (
    <div className="mx-auto max-w-md space-y-6">
      <form action={profileAction} className={cardClass}>
        <h2 className="text-lg font-extrabold text-ink">Public profile</h2>
        <p className="mt-1 text-sm text-ink/60">
          {username ? (
            <>
              Visible at{' '}
              <span className="font-semibold text-ink/80">
                fiction-book-builder.com/u/{username}
              </span>
              {isPublic ? '' : ' (currently private)'}
            </>
          ) : (
            'Pick a username to get a public page.'
          )}
        </p>

        <div className="mt-4">
          <AvatarUploader userId={userId} avatarUrl={avatarUrl} />
        </div>

        <div className="mt-4">
          <label htmlFor="acc-username" className={labelClass}>
            Username
          </label>
          <input
            id="acc-username"
            name="username"
            defaultValue={username ?? ''}
            required
            pattern="[a-z0-9][a-z0-9-]{1,28}[a-z0-9]"
            placeholder="ada-quill"
            className={inputClass}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="acc-bio" className={labelClass}>
            Bio
          </label>
          <textarea
            id="acc-bio"
            name="bio"
            rows={3}
            maxLength={280}
            defaultValue={bio}
            placeholder="Comic-book writer, ex-newspaper strip artist."
            className={inputClass}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="acc-website" className={labelClass}>
              Website
            </label>
            <input
              id="acc-website"
              name="website"
              defaultValue={websiteUrl}
              placeholder="yoursite.com"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="acc-instagram" className={labelClass}>
              Instagram
            </label>
            <input
              id="acc-instagram"
              name="instagram"
              defaultValue={instagramUrl}
              placeholder="@yourhandle"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="acc-tiktok" className={labelClass}>
              TikTok
            </label>
            <input
              id="acc-tiktok"
              name="tiktok"
              defaultValue={tiktokUrl}
              placeholder="@yourhandle"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="acc-youtube" className={labelClass}>
              YouTube
            </label>
            <input
              id="acc-youtube"
              name="youtube"
              defaultValue={youtubeUrl}
              placeholder="@yourchannel"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="acc-twitter" className={labelClass}>
              X / Twitter
            </label>
            <input
              id="acc-twitter"
              name="twitter"
              defaultValue={twitterUrl}
              placeholder="@yourhandle"
              className={inputClass}
            />
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2.5 text-sm font-bold text-ink/80">
          <input
            type="checkbox"
            name="isPublic"
            defaultChecked={isPublic}
            className="h-4 w-4 rounded border-2 border-ink/30 accent-primary"
          />
          Make my profile public
        </label>

        <Status state={profileState} />
        <button type="submit" disabled={profilePending} className={buttonClass}>
          {profilePending ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      <form action={nameAction} className={cardClass}>
        <h2 className="text-lg font-extrabold text-ink">Your name</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="acc-first" className={labelClass}>
              First name
            </label>
            <input
              id="acc-first"
              name="firstName"
              defaultValue={firstName}
              required
              autoComplete="given-name"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="acc-last" className={labelClass}>
              Last name
            </label>
            <input
              id="acc-last"
              name="lastName"
              defaultValue={lastName}
              autoComplete="family-name"
              className={inputClass}
            />
          </div>
        </div>
        <Status state={nameState} />
        <button type="submit" disabled={namePending} className={buttonClass}>
          {namePending ? 'Saving…' : 'Save name'}
        </button>
      </form>

      <form action={emailAction} className={cardClass}>
        <h2 className="text-lg font-extrabold text-ink">Email address</h2>
        <p className="mt-1 text-sm text-ink/60">
          Currently <span className="font-semibold text-ink/80">{email}</span>.
        </p>
        <div className="mt-4">
          <label htmlFor="acc-email" className={labelClass}>
            New email
          </label>
          <input
            id="acc-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="new@example.com"
            className={inputClass}
          />
        </div>
        <Status state={emailState} />
        <button type="submit" disabled={emailPending} className={buttonClass}>
          {emailPending ? 'Sending…' : 'Update email'}
        </button>
      </form>

      <form action={passwordAction} className={cardClass}>
        <h2 className="text-lg font-extrabold text-ink">
          {hasPassword ? 'Change password' : 'Set a password'}
        </h2>
        {!hasPassword && (
          <p className="mt-1 text-sm text-ink/60">
            You sign in with Google. Add a password to also sign in with your email.
          </p>
        )}
        <div className="mt-4">
          <label htmlFor="acc-password" className={labelClass}>
            New password
          </label>
          <input
            id="acc-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className={inputClass}
          />
        </div>
        <div className="mt-4">
          <label htmlFor="acc-password-confirm" className={labelClass}>
            Confirm password
          </label>
          <input
            id="acc-password-confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Type it again"
            className={inputClass}
          />
        </div>
        <Status state={passwordState} />
        <button type="submit" disabled={passwordPending} className={buttonClass}>
          {passwordPending ? 'Saving…' : hasPassword ? 'Change password' : 'Set password'}
        </button>
      </form>
    </div>
  )
}
