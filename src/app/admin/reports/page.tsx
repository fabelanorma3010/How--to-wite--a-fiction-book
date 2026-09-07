import type { Metadata } from 'next'
import { adminClient } from '@/lib/admin'
import type { ContentReportRow } from '../types'
import ReportsTable from './ReportsTable'

export const metadata: Metadata = { title: 'Reports' }
export const dynamic = 'force-dynamic'

interface ReportRow {
  id: string
  reason: string
  detail: string | null
  status: 'open' | 'resolved'
  created_at: string
  reporter_id: string
  post_id: string | null
  comment_id: string | null
}

export default async function ReportsPage() {
  const supabase = await adminClient()

  const { data: reports, error } = await supabase
    .from('content_reports')
    .select('id, reason, detail, status, created_at, reporter_id, post_id, comment_id')
    .order('status', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    return <p className="font-semibold text-red-600">Couldn&apos;t load reports: {error.message}</p>
  }

  const rows = (reports ?? []) as ReportRow[]
  const postIds = [...new Set(rows.filter((r) => r.post_id).map((r) => r.post_id as string))]
  const commentIds = [...new Set(rows.filter((r) => r.comment_id).map((r) => r.comment_id as string))]

  const [{ data: posts }, { data: comments }] = await Promise.all([
    postIds.length
      ? supabase.from('posts').select('id, title, body, user_id').in('id', postIds)
      : Promise.resolve({ data: [] as { id: string; title: string | null; body: string; user_id: string }[] }),
    commentIds.length
      ? supabase.from('post_comments').select('id, body, user_id').in('id', commentIds)
      : Promise.resolve({ data: [] as { id: string; body: string; user_id: string }[] }),
  ])

  const postById = new Map((posts ?? []).map((p) => [p.id, p]))
  const commentById = new Map((comments ?? []).map((c) => [c.id, c]))

  const userIds = new Set<string>()
  rows.forEach((r) => {
    userIds.add(r.reporter_id)
    if (r.post_id) {
      const p = postById.get(r.post_id)
      if (p) userIds.add(p.user_id)
    }
    if (r.comment_id) {
      const c = commentById.get(r.comment_id)
      if (c) userIds.add(c.user_id)
    }
  })

  const names = new Map<string, string>()
  if (userIds.size) {
    const { data: users } = await supabase.from('users').select('id, name').in('id', [...userIds])
    users?.forEach((u) => names.set(u.id, u.name))
  }

  const tableRows: ContentReportRow[] = rows.flatMap((r): ContentReportRow[] => {
    if (r.post_id) {
      const post = postById.get(r.post_id)
      if (!post) return []
      return [
        {
          id: r.id,
          reason: r.reason,
          detail: r.detail,
          status: r.status,
          createdAt: r.created_at,
          reporterName: names.get(r.reporter_id) ?? 'Unknown',
          targetType: 'post' as const,
          targetId: post.id,
          targetAuthorName: names.get(post.user_id) ?? 'Unknown',
          targetTitle: post.title,
          targetBody: post.body,
        },
      ]
    }
    if (r.comment_id) {
      const comment = commentById.get(r.comment_id)
      if (!comment) return []
      return [
        {
          id: r.id,
          reason: r.reason,
          detail: r.detail,
          status: r.status,
          createdAt: r.created_at,
          reporterName: names.get(r.reporter_id) ?? 'Unknown',
          targetType: 'comment' as const,
          targetId: comment.id,
          targetAuthorName: names.get(comment.user_id) ?? 'Unknown',
          targetTitle: null,
          targetBody: comment.body,
        },
      ]
    }
    return []
  })

  return <ReportsTable reports={tableRows} />
}
