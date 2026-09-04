'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateEmail, updateName, updatePassword, type ActionState } from '@/app/account/actions'

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
  firstName,
  lastName,
  email,
  hasPassword,
}: {
  firstName: string
  lastName: string
  email: string
  hasPassword: boolean
}) {
  const router = useRouter()
  const [nameState, nameAction, namePending] = useActionState(updateName, initial)
  const [emailState, emailAction, emailPending] = useActionState(updateEmail, initial)
  const [passwordState, passwordAction, passwordPending] = useActionState(updatePassword, initial)

  useEffect(() => {
    if (nameState.ok) router.refresh()
  }, [nameState, router])

  return (
    <div className="mx-auto max-w-md space-y-6">
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
