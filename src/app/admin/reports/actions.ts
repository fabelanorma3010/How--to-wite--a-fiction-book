'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/admin'
import type { ActionResult } from '../types'

export async function resolveReport(id: string): Promise<ActionResult> {
  const supabase = await adminClient()
  const { error } = await supabase.from('content_reports').update({ status: 'resolved' }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/reports')
  return { ok: true }
}

/** Deletes the reported post or comment. Cascades away every report pointing at it. */
export async function deleteReportedContent(
  targetType: 'post' | 'comment',
  targetId: string,
): Promise<ActionResult> {
  const supabase = await adminClient()
  const table = targetType === 'post' ? 'posts' : 'post_comments'
  const { error } = await supabase.from(table).delete().eq('id', targetId)
  if (error) return { error: error.message }
  revalidatePath('/admin/reports')
  return { ok: true }
}
