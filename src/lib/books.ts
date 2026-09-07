import { createClient } from './supabase/server'
import type { BookTypeId } from '../data/bookTypes'

export interface Book {
  id: string
  userId: string
  title: string
  description: string
  bookType: BookTypeId | null
  coverUrl: string | null
  fileUrl: string | null
  isFavorite: boolean
  createdAt: string
}

export interface Chapter {
  id: string
  bookId: string
  chapterNumber: number
  title: string | null
  pages: string[]
  publishedAt: string
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
    userId,
    title: row.title,
    description: row.description ?? '',
    bookType: (row.book_type as BookTypeId | null) ?? null,
    coverUrl: row.cover_url,
    fileUrl: row.file_url,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
  }))
}

/**
 * A single book by id, visible under the same rule as getUserBooks (owner
 * always, or anyone once that owner's profile is public) via RLS. Used by
 * the real book detail page.
 */
export async function getBookById(id: string): Promise<Book | null> {
  const supabase = await createClient()
  if (!supabase) return null

  const { data } = await supabase
    .from('books')
    .select('id, user_id, title, description, book_type, cover_url, file_url, is_favorite, created_at')
    .eq('id', id)
    .maybeSingle()
  if (!data) return null

  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    description: data.description ?? '',
    bookType: (data.book_type as BookTypeId | null) ?? null,
    coverUrl: data.cover_url,
    fileUrl: data.file_url,
    isFavorite: data.is_favorite,
    createdAt: data.created_at,
  }
}

/** A book's chapters, oldest first. Same RLS-backed visibility as the book itself. */
export async function getBookChapters(bookId: string): Promise<Chapter[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('book_chapters')
    .select('id, book_id, chapter_number, title, pages, published_at')
    .eq('book_id', bookId)
    .order('chapter_number', { ascending: true })

  return (data ?? []).map((row) => ({
    id: row.id,
    bookId: row.book_id,
    chapterNumber: row.chapter_number,
    title: row.title,
    pages: row.pages ?? [],
    publishedAt: row.published_at,
  }))
}

export interface RecentBook {
  id: string
  title: string
  bookType: BookTypeId | null
  coverUrl: string | null
  authorName: string
}

/**
 * Newest books whose owner has a public profile, for the Discovery Feed.
 * RLS on public.books already restricts anonymous/public reads to
 * is_public owners, so no extra visibility filter is needed here.
 */
export async function getRecentPublicBooks(limit = 12): Promise<RecentBook[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data: rows } = await supabase
    .from('books')
    .select('id, title, book_type, cover_url, user_id')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (!rows || rows.length === 0) return []

  const ids = [...new Set(rows.map((r) => r.user_id as string))]
  const names = new Map<string, string>()
  const { data: profiles } = await supabase.from('public_profiles').select('id, name').in('id', ids)
  profiles?.forEach((p) => names.set(p.id as string, (p.name as string) ?? 'A writer'))

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    bookType: (row.book_type as BookTypeId | null) ?? null,
    coverUrl: row.cover_url,
    authorName: names.get(row.user_id as string) ?? 'A writer',
  }))
}

/** A single chapter by id, with its parent book's owner/type for the reader UI. */
export async function getChapterById(
  id: string,
): Promise<(Chapter & { bookTitle: string; bookType: BookTypeId | null; bookId: string }) | null> {
  const supabase = await createClient()
  if (!supabase) return null

  const { data } = await supabase
    .from('book_chapters')
    .select('id, book_id, chapter_number, title, pages, published_at, books(title, book_type)')
    .eq('id', id)
    .maybeSingle()
  if (!data) return null

  const book = data.books as unknown as { title: string; book_type: string | null } | null
  return {
    id: data.id,
    bookId: data.book_id,
    chapterNumber: data.chapter_number,
    title: data.title,
    pages: data.pages ?? [],
    publishedAt: data.published_at,
    bookTitle: book?.title ?? '',
    bookType: (book?.book_type as BookTypeId | null) ?? null,
  }
}
