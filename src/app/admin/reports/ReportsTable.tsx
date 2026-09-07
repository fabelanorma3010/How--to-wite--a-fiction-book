'use client'

import { useState, useTransition } from 'react'
import type { ContentReportRow } from '../types'
import { deleteReportedContent, resolveReport } from './actions'

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  harassment: 'Harassment or abuse',
  inappropriate: 'Inappropriate content',
  other: 'Other',
}

function ReportRow({ report }: { report: ContentReportRow }) {
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  const [gone, setGone] = useState(false)

  if (gone) return null

  return (
    <tr className="align-top">
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            report.status === 'open' ? 'bg-accent/20 text-accent-content' : 'bg-ink/10 text-ink/50'
          }`}
        >
          {report.status === 'open' ? 'Open' : 'Resolved'}
        </span>
        <div className="mt-1 text-xs text-ink/40">{new Date(report.createdAt).toLocaleString()}</div>
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="font-bold text-ink">{REASON_LABELS[report.reason] ?? report.reason}</div>
        {report.detail && <div className="mt-1 max-w-xs text-xs text-ink/50">{report.detail}</div>}
        <div className="mt-1 text-xs text-ink/40">reported by {report.reporterName}</div>
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="text-xs font-bold uppercase tracking-wide text-ink/40">
          {report.targetType} · {report.targetAuthorName}
        </div>
        {report.targetTitle && <div className="mt-1 font-bold text-ink">{report.targetTitle}</div>}
        <p className="mt-1 max-w-md whitespace-pre-wrap text-ink/70">{report.targetBody}</p>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex flex-col items-end gap-2">
          {report.status === 'open' && (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setErr(null)
                start(async () => {
                  const res = await resolveReport(report.id)
                  if ('error' in res) setErr(res.error)
                })
              }}
              className="font-bold text-ink/70 hover:underline disabled:opacity-50"
            >
              Mark resolved
            </button>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm(`Delete this ${report.targetType}? This can't be undone.`)) return
              setErr(null)
              start(async () => {
                const res = await deleteReportedContent(report.targetType, report.targetId)
                if ('error' in res) setErr(res.error)
                else setGone(true)
              })
            }}
            className="font-bold text-red-600 hover:underline disabled:opacity-50"
          >
            Delete {report.targetType}
          </button>
          {err && <span className="text-xs font-semibold text-red-600">{err}</span>}
        </div>
      </td>
    </tr>
  )
}

export default function ReportsTable({ reports }: { reports: ContentReportRow[] }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-ink">Reports</h1>

      <div className="overflow-x-auto rounded-2xl border-2 border-ink/10 bg-white/70">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b-2 border-ink/10 text-xs font-bold uppercase tracking-wide text-ink/40">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Report</th>
              <th className="px-4 py-3">Content</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {reports.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center font-semibold text-ink/40">
                  No reports.
                </td>
              </tr>
            )}
            {reports.map((report) => (
              <ReportRow key={report.id} report={report} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
