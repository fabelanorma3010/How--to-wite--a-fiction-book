import { createClient } from './supabase/server'
import type { BookTypeId } from '../data/bookTypes'

export interface Book {
  id: string
  title: string
  description: string
  bookType: BookTypeId | null
  coverUrl: string | null
  fileUrl: string | null
  isFavorite: boolean
  createdAt: string
}

/**
 * A member's uploaded books, favorite first. Used by both /account (as the
 * owner — RLS lets you see your own regardless of profile visibility) and
 * /u/[username] (as a visitor — RLS only returns rows if that profile is
 * public), so the caller's auth context alone decides what comes back.
 */
export async function getUserBooks(userId: string): Promise<Book[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('books')
    .select('id, title, description, book_type, cover_url, file_url, is_favorite, created_at')
    .eq('user_id', userId)
    .order('is_favorite', { ascending: false })
    .order('created_at', { ascending: false })

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    bookType: (row.book_type as BookTypeId | null) ?? null,
    coverUrl: row.cover_url,
    fileUrl: row.file_url,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
  }))
}
