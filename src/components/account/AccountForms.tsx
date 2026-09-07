'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { updateEmail, updateName, updatePassword, updateProfile, type ActionState } from '@/app/account/actions'
import AvatarUploader from './AvatarUploader'

const initial: ActionState = {}

const cardClass = 'rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8'
const labelClass = 'mb-1.5 block text-sm font-bold text-ink/80'
const inputClass =
  'w-full rounded-2xl border-2 border-ink/15 bg-page/80 px-4 py-2.5 text-ink placeholder:text-ink/40 focus:border-primary/50'
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
  const t = useTranslations('AccountForms')
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
    <>
      <form action={profileAction} className={cardClass}>
        <h2 className="text-lg font-extrabold text-ink">{t('publicProfile')}</h2>
        <p className="mt-1 text-sm text-ink/60">
          {username ? (
            <>
              {t('visibleAt')}{' '}
              <span className="font-semibold text-ink/80">
                www.fiction-book-builder.com/u/{username}
              </span>
              {isPublic ? '' : ` ${t('currentlyPrivate')}`}
            </>
          ) : (
            t('pickUsername')
          )}
        </p>

        <div className="mt-4">
          <AvatarUploader userId={userId} avatarUrl={avatarUrl} />
        </div>

        <div className="mt-4">
          <label htmlFor="acc-username" className={labelClass}>
            {t('username')}
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
            {t('bio')}
          </label>
          <textarea
            id="acc-bio"
            name="bio"
            rows={3}
            maxLength={280}
            defaultValue={bio}
            placeholder="God loves you"
            className={inputClass}
          />
          <p className="mt-1.5 text-sm font-semibold text-primary-content">God loves you</p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="acc-website" className={labelClass}>
              {t('website')}
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
          {t('makePublic')}
        </label>

        <Status state={profileState} />
        <button type="submit" disabled={profilePending} className={buttonClass}>
          {profilePending ? t('saving') : t('saveProfile')}
        </button>
      </form>

      <form action={nameAction} className={cardClass}>
        <h2 className="text-lg font-extrabold text-ink">{t('yourName')}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="acc-first" className={labelClass}>
              {t('firstName')}
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
              {t('lastName')}
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
          {namePending ? t('saving') : t('saveName')}
        </button>
      </form>

      <form action={emailAction} className={cardClass}>
        <h2 className="text-lg font-extrabold text-ink">{t('emailAddress')}</h2>
        <p className="mt-1 text-sm text-ink/60">
          {t.rich('currentlyEmail', { email: () => <span className="font-semibold text-ink/80">{email}</span> })}
        </p>
        <div className="mt-4">
          <label htmlFor="acc-email" className={labelClass}>
            {t('newEmail')}
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
          {emailPending ? t('sending') : t('updateEmail')}
        </button>
      </form>

      <form action={passwordAction} className={cardClass}>
        <h2 className="text-lg font-extrabold text-ink">
          {hasPassword ? t('changePassword') : t('setAPassword')}
        </h2>
        {!hasPassword && <p className="mt-1 text-sm text-ink/60">{t('googleNote')}</p>}
        <div className="mt-4">
          <label htmlFor="acc-password" className={labelClass}>
            {t('newPassword')}
          </label>
          <input
            id="acc-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder={t('passwordPlaceholder')}
            className={inputClass}
          />
        </div>
        <div className="mt-4">
          <label htmlFor="acc-password-confirm" className={labelClass}>
            {t('confirmPassword')}
          </label>
          <input
            id="acc-password-confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder={t('confirmPlaceholder')}
            className={inputClass}
          />
        </div>
        <Status state={passwordState} />
        <button type="submit" disabled={passwordPending} className={buttonClass}>
          {passwordPending ? t('saving') : hasPassword ? t('changePassword') : t('setPassword')}
        </button>
      </form>
    </>
  )
}
