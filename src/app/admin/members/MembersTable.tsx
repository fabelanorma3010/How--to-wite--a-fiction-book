'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import type { ActionResult, MemberRow } from '../types'
import { createMember, deleteMember, updateMember } from './actions'

const inputClass =
  'w-full rounded-lg border-2 border-ink/15 bg-white px-3 py-1.5 text-sm text-ink focus:border-primary/50'

function Fields({ row }: { row?: MemberRow }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs font-bold text-ink/60">
        Name
        <input name="name" defaultValue={row?.name ?? ''} required className={inputClass} />
      </label>
      <label className="text-xs font-bold text-ink/60">
        Email
        <input name="email" type="email" defaultValue={row?.email ?? ''} required className={inputClass} />
      </label>
      <label className="text-xs font-bold text-ink/60">
        Phone
        <input name="phone" defaultValue={row?.phone ?? ''} className={inputClass} />
      </label>
      <label className="text-xs font-bold text-ink/60">
        Avatar URL
        <input name="avatar_url" defaultValue={row?.avatar_url ?? ''} className={inputClass} />
      </label>
      <label className="text-xs font-bold text-ink/60 sm:col-span-2">
        Address
        <input name="address" defaultValue={row?.address ?? ''} className={inputClass} />
      </label>
      <label className="text-xs font-bold text-ink/60 sm:col-span-2">
        Bio
        <textarea name="bio" rows={2} defaultValue={row?.bio ?? ''} className={inputClass} />
      </label>
    </div>
  )
}

function CreateForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(createMember, null)
  useEffect(() => {
    if (state && 'ok' in state) onDone()
  }, [state, onDone])

  return (
    <form action={action} className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
      <p className="mb-3 text-sm font-extrabold text-ink">New member</p>
      <Fields />
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

function EditRow({ row, onDone }: { row: MemberRow; onDone: () => void }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    updateMember.bind(null, row.id),
    null,
  )
  useEffect(() => {
    if (state && 'ok' in state) onDone()
  }, [state, onDone])

  return (
    <tr>
      <td colSpan={4} className="p-3">
        <form action={action} className="rounded-2xl border-2 border-ink/15 bg-white p-4">
          <p className="mb-3 text-sm font-extrabold text-ink">Editing · {row.name}</p>
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
          if (!confirm(`Delete ${label}? This also removes their subscriptions, posts, reviews, messages and files.`))
            return
          setErr(null)
          start(async () => {
            const res = await deleteMember(id)
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

export default function MembersTable({ members }: { members: MemberRow[] }) {
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">Members</h1>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-content"
          >
            + New member
          </button>
        )}
      </div>

      {creating && <CreateForm onDone={() => setCreating(false)} />}

      <div className="overflow-x-auto rounded-2xl border-2 border-ink/10 bg-white/70">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b-2 border-ink/10 text-xs font-bold uppercase tracking-wide text-ink/40">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Subscription</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {members.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center font-semibold text-ink/40">
                  No members yet.
                </td>
              </tr>
            )}
            {members.map((member) =>
              editingId === member.id ? (
                <EditRow key={member.id} row={member} onDone={() => setEditingId(null)} />
              ) : (
                <tr key={member.id} className="align-top">
                  <td className="px-4 py-3">
                    <div className="font-bold text-ink">{member.name}</div>
                    <div className="text-xs text-ink/50">{member.email}</div>
                    {member.bio && <div className="mt-1 max-w-xs text-xs text-ink/50">{member.bio}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink/60">
                    {member.phone && <div>{member.phone}</div>}
                    {member.address && <div>{member.address}</div>}
                    {!member.phone && !member.address && <span className="text-ink/30">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {member.subscriptions.length === 0 ? (
                      <span className="text-ink/30">none</span>
                    ) : (
                      member.subscriptions.map((s, i) => (
                        <span key={i} className="rounded-full bg-ink/5 px-2 py-0.5 text-xs font-bold text-ink/70">
                          {s.plan} · {s.status}
                        </span>
                      ))
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingId(member.id)}
                        className="font-bold text-ink/70 hover:underline"
                      >
                        Edit
                      </button>
                      <DeleteButton id={member.id} label={member.name} />
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
