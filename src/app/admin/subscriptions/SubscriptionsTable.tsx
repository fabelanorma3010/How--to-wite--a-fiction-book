'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import {
  BILLING_CYCLES,
  SUBSCRIPTION_STATUSES,
  type ActionResult,
  type MemberOption,
  type SubscriptionRow,
} from '../types'
import { createSubscription, deleteSubscription, updateSubscription } from './actions'

const inputClass =
  'w-full rounded-lg border-2 border-ink/15 bg-white px-3 py-1.5 text-sm text-ink focus:border-primary/50'

function money(value: number) {
  return `$${Number(value).toFixed(2)}`
}

function Fields({ row, members }: { row?: SubscriptionRow; members?: MemberOption[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {members && (
        <label className="text-xs font-bold text-ink/60">
          Member
          <select name="user_id" defaultValue={row?.user_id ?? ''} required className={inputClass}>
            <option value="" disabled>
              Choose a member…
            </option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} · {m.email}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="text-xs font-bold text-ink/60">
        Plan
        <input name="plan" defaultValue={row?.plan ?? ''} required placeholder="Supporter" className={inputClass} />
      </label>
      <label className="text-xs font-bold text-ink/60">
        Price
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={row?.price ?? 0}
          className={inputClass}
        />
      </label>
      <label className="text-xs font-bold text-ink/60">
        Billing cycle
        <select name="billing_cycle" defaultValue={row?.billing_cycle ?? 'monthly'} className={inputClass}>
          {BILLING_CYCLES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs font-bold text-ink/60">
        Start date
        <input name="start_date" type="date" defaultValue={row?.start_date ?? ''} className={inputClass} />
      </label>
      <label className="text-xs font-bold text-ink/60">
        Status
        <select name="status" defaultValue={row?.status ?? 'active'} className={inputClass}>
          {SUBSCRIPTION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

function CreateForm({ members, onDone }: { members: MemberOption[]; onDone: () => void }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(createSubscription, null)
  useEffect(() => {
    if (state && 'ok' in state) onDone()
  }, [state, onDone])

  return (
    <form action={action} className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
      <p className="mb-3 text-sm font-extrabold text-ink">New subscription</p>
      <Fields members={members} />
      {state && 'error' in state && (
        <p role="alert" className="mt-3 text-sm font-semibold text-red-600">
          {state.error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-content disabled:opacity-60"
        >
          {pending ? 'Creating…' : 'Create'}
        </button>
        <button type="button" onClick={onDone} className="rounded-full px-4 py-2 text-sm font-bold text-ink/60 hover:bg-ink/10">
          Cancel
        </button>
      </div>
    </form>
  )
}

function EditRow({ row, onDone }: { row: SubscriptionRow; onDone: () => void }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    updateSubscription.bind(null, row.id),
    null,
  )
  useEffect(() => {
    if (state && 'ok' in state) onDone()
  }, [state, onDone])

  return (
    <tr>
      <td colSpan={6} className="p-3">
        <form action={action} className="rounded-2xl border-2 border-ink/15 bg-white p-4">
          <p className="mb-3 text-sm font-extrabold text-ink">
            Editing · {row.users?.name ?? 'Unknown member'}
          </p>
          <Fields row={row} />
          {state && 'error' in state && (
            <p role="alert" className="mt-3 text-sm font-semibold text-red-600">
              {state.error}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-ink px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {pending ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={onDone} className="rounded-full px-4 py-2 text-sm font-bold text-ink/60 hover:bg-ink/10">
              Cancel
            </button>
          </div>
        </form>
      </td>
    </tr>
  )
}

function DeleteButton({ id, label }: { id: string; label: string }) {
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Delete the subscription for ${label}?`)) return
          setErr(null)
          start(async () => {
            const res = await deleteSubscription(id)
            if ('error' in res) setErr(res.error)
          })
        }}
        className="font-bold text-red-600 hover:underline disabled:opacity-50"
      >
        {pending ? 'Deleting…' : 'Delete'}
      </button>
      {err && <span className="text-xs font-semibold text-red-600">{err}</span>}
    </span>
  )
}

export default function SubscriptionsTable({
  subscriptions,
  members,
}: {
  subscriptions: SubscriptionRow[]
  members: MemberOption[]
}) {
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">Subscriptions</h1>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            disabled={members.length === 0}
            title={members.length === 0 ? 'Add a member first' : undefined}
            className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-content disabled:opacity-50"
          >
            + New subscription
          </button>
        )}
      </div>

      {creating && <CreateForm members={members} onDone={() => setCreating(false)} />}

      <div className="overflow-x-auto rounded-2xl border-2 border-ink/10 bg-white/70">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b-2 border-ink/10 text-xs font-bold uppercase tracking-wide text-ink/40">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Cycle</th>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center font-semibold text-ink/40">
                  No subscriptions yet.
                </td>
              </tr>
            )}
            {subscriptions.map((sub) =>
              editingId === sub.id ? (
                <EditRow key={sub.id} row={sub} onDone={() => setEditingId(null)} />
              ) : (
                <tr key={sub.id} className="align-top">
                  <td className="px-4 py-3">
                    <div className="font-bold text-ink">{sub.users?.name ?? '—'}</div>
                    <div className="text-xs text-ink/50">{sub.users?.email}</div>
                  </td>
                  <td className="px-4 py-3">{sub.plan}</td>
                  <td className="px-4 py-3">{money(sub.price)}</td>
                  <td className="px-4 py-3">{sub.billing_cycle}</td>
                  <td className="px-4 py-3">{sub.start_date}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs font-bold text-ink/70">
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingId(sub.id)}
                        className="font-bold text-ink/70 hover:underline"
                      >
                        Edit
                      </button>
                      <DeleteButton id={sub.id} label={sub.users?.name ?? 'this member'} />
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
