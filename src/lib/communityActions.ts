'use server'

import { createClient } from './supabase/server'
import type { BookTypeId } from '../data/bookTypes'
import type { ReportReason } from './community'

interface CommentRow {
  id: string
  post_id: string
  user_id: string
  body: string
  created_at: string
}

interface PostRow {
  id: string
  title: string | null
  body: string
  category: string | null
  published_at: string
  user_id: string
}

async function requireUser() {
  const supabase = await createClient()
  if (!supabase) throw new Error('Supabase is not configured.')
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('You need to be signed in.')
  return { supabase, user }
}

export async function createPost(input: {
  title: string | null
  body: string
  bookType: BookTypeId
}): Promise<{ ok: true; post: PostRow } | { error: string }> {
  try {
    const { supabase, user } = await requireUser()
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        title: input.title,
        body: input.body,
        category: input.bookType,
        tags: [input.bookType],
        published_at: new Date().toISOString(),
      })
      .select('id, title, body, category, published_at, user_id')
      .single()
    if (error) throw error
    return { ok: true, post: data as PostRow }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not post.' }
  }
}

export async function toggleLike(postId: string, liked: boolean): Promise<{ ok: true } | { error: string }> {
  try {
    const { supabase, user } = await requireUser()
    const { error } = liked
      ? await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
      : await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id)
    if (error) throw error
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not update your like.' }
  }
}

export async function addComment(
  postId: string,
  body: string,
): Promise<{ ok: true; comment: CommentRow } | { error: string }> {
  try {
    const { supabase, user } = await requireUser()
    const trimmed = body.trim()
    if (!trimmed) throw new Error('Comment cannot be empty.')
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: user.id, body: trimmed })
      .select('id, post_id, user_id, body, created_at')
      .single()
    if (error) throw error
    return { ok: true, comment: data as CommentRow }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not post comment.' }
  }
}

export async function deleteComment(commentId: string): Promise<{ ok: true } | { error: string }> {
  try {
    const { supabase } = await requireUser()
    const { error } = await supabase.from('post_comments').delete().eq('id', commentId)
    if (error) throw error
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not delete comment.' }
  }
}

export async function deletePost(postId: string): Promise<{ ok: true } | { error: string }> {
  try {
    const { supabase } = await requireUser()
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) throw error
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not delete post.' }
  }
}

export async function submitReport(input: {
  postId: string | null
  commentId: string | null
  reason: ReportReason
  detail: string | null
}): Promise<{ ok: true } | { error: string }> {
  try {
    const { supabase, user } = await requireUser()
    const { error } = await supabase.from('content_reports').insert({
      reporter_id: user.id,
      post_id: input.postId,
      comment_id: input.commentId,
      reason: input.reason,
      detail: input.detail,
    })
    if (error) throw error
    return { ok: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not send report.' }
  }
}
