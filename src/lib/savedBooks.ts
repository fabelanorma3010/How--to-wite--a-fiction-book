import { createClient } from './supabase/server'
import type { BookFormat } from './books'

/** Whether the given viewer has this book saved to their own shelf. */
export async function isBookSaved(bookId: string, viewerId: string | null): Promise<boolean> {
  if (!viewerId) return false
  const supabase = await createClient()
  if (!supabase) return false

  const { data } = await supabase
    .from('saved_books')
    .select('user_id')
    .eq('user_id', viewerId)
    .eq('book_id', bookId)
    .maybeSingle()
  return Boolean(data)
}

export interface SavedBook {
  id: string
  title: string
  bookType: BookFormat | null
  coverUrl: string | null
}

/** A member's own "save for later" shelf, most recently saved first. RLS already scopes this to the caller. */
export async function getSavedBooks(userId: string): Promise<SavedBook[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('saved_books')
    .select('book_id, created_at, books(id, title, book_type, cover_url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (!data) return []

  return data
    .map((row) => row.books as unknown as { id: string; title: string; book_type: string | null; cover_url: string | null } | null)
    .filter((book): book is NonNullable<typeof book> => book !== null)
    .map((book) => ({
      id: book.id,
      title: book.title,
      bookType: (book.book_type as BookFormat | null) ?? null,
      coverUrl: book.cover_url,
    }))
}
