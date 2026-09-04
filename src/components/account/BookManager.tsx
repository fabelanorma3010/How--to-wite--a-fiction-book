'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { bookTypes } from '@/data/bookTypes'
import type { Book } from '@/lib/books'

const MAX_COVER_BYTES = 5 * 1024 * 1024
const MAX_FILE_BYTES = 50 * 1024 * 1024
const ACCEPTED_COVER = ['image/png', 'image/jpeg', 'image/webp']
const ACCEPTED_FILE = ['application/pdf', 'application/epub+zip']

const cardClass = 'rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8'
const labelClass = 'mb-1.5 block text-sm font-bold text-ink/80'
const inputClass =
  'w-full rounded-2xl border-2 border-ink/15 bg-base/80 px-4 py-2.5 text-ink placeholder:text-ink/40 focus:border-primary/50'
const buttonClass =
  'rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100'

function typeEmoji(bookType: Book['bookType']) {
  return bookTypes.find((t) => t.id === bookType)?.emoji ?? '📘'
}

export default function BookManager({ userId, books }: { userId: string; books: Book[] }) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [bookType, setBookType] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [bookFile, setBookFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    if (coverFile && (!ACCEPTED_COVER.includes(coverFile.type) || coverFile.size > MAX_COVER_BYTES)) {
      setError('Cover must be a PNG, JPEG, or WebP image, 5MB max.')
      return
    }
    if (bookFile && (!ACCEPTED_FILE.includes(bookFile.type) || bookFile.size > MAX_FILE_BYTES)) {
      setError('Book file must be a PDF or EPUB, 50MB max.')
      return
    }

    setSubmitting(true)
    const supabase = createClient()
    if (!supabase) {
      setError('Uploads are unavailable right now.')
      setSubmitting(false)
      return
    }

    try {
      let coverUrl: string | null = null
      let fileUrl: string | null = null

      if (coverFile) {
        const ext = coverFile.name.split('.').pop() || 'jpg'
        const path = `${userId}/cover-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('books')
          .upload(path, coverFile, { contentType: coverFile.type })
        if (uploadError) throw uploadError
        coverUrl = supabase.storage.from('books').getPublicUrl(path).data.publicUrl
      }
      if (bookFile) {
        const ext = bookFile.name.split('.').pop() || 'pdf'
        const path = `${userId}/book-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('books')
          .upload(path, bookFile, { contentType: bookFile.type })
        if (uploadError) throw uploadError
        fileUrl = supabase.storage.from('books').getPublicUrl(path).data.publicUrl
      }

      const { error: insertError } = await supabase.from('books').insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim() || null,
        book_type: bookType || null,
        cover_url: coverUrl,
        file_url: fileUrl,
      })
      if (insertError) throw insertError

      setTitle('')
      setDescription('')
      setBookType('')
      setCoverFile(null)
      setBookFile(null)
      setAdding(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that book.')
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleFavorite(book: Book) {
    setBusyId(book.id)
    const supabase = createClient()
    await supabase?.from('books').update({ is_favorite: !book.isFavorite }).eq('id', book.id)
    setBusyId(null)
    router.refresh()
  }

  async function handleDelete(id: string, bookTitle: string) {
    if (!confirm(`Delete "${bookTitle}"? This can't be undone.`)) return
    setBusyId(id)
    const supabase = createClient()
    await supabase?.from('books').delete().eq('id', id)
    setBusyId(null)
    router.refresh()
  }

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-ink">Your books</h2>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-full border-2 border-ink/15 px-4 py-1.5 text-sm font-bold text-ink transition-colors hover:bg-base/60"
          >
            + Add a book
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-ink/60">
        Shown on your public profile. Tap the star to feature one as your favorite.
      </p>

      {adding && (
        <form onSubmit={handleAdd} className="mt-4 rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
          <div>
            <label htmlFor="book-title" className={labelClass}>
              Title
            </label>
            <input
              id="book-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div className="mt-3">
            <label htmlFor="book-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="book-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="mt-3">
            <label htmlFor="book-type" className={labelClass}>
              Type
            </label>
            <select id="book-type" value={bookType} onChange={(e) => setBookType(e.target.value)} className={inputClass}>
              <option value="">— optional —</option>
              {bookTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.emoji} {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="book-cover" className={labelClass}>
                Cover image
              </label>
              <input
                id="book-cover"
                type="file"
                accept={ACCEPTED_COVER.join(',')}
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-ink/70"
              />
            </div>
            <div>
              <label htmlFor="book-file" className={labelClass}>
                Book file (PDF/EPUB)
              </label>
              <input
                id="book-file"
                type="file"
                accept={ACCEPTED_FILE.join(',')}
                onChange={(e) => setBookFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-ink/70"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={submitting} className={buttonClass}>
              {submitting ? 'Uploading…' : 'Add book'}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-full px-4 py-2 text-sm font-bold text-ink/60 hover:bg-ink/10"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {books.length === 0 && !adding && (
        <p className="mt-4 text-sm font-semibold text-ink/40">No books yet — add your first one.</p>
      )}

      {books.length > 0 && (
        <ul className="mt-4 space-y-2">
          {books.map((book) => (
            <li
              key={book.id}
              className="flex items-center gap-3 rounded-2xl border-2 border-ink/10 bg-white/60 p-3"
            >
              <div className="h-14 w-10 shrink-0 overflow-hidden rounded-md bg-base">
                {book.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg">
                    {typeEmoji(book.bookType)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink">{book.title}</p>
                {book.description && <p className="truncate text-xs text-ink/50">{book.description}</p>}
              </div>
              <button
                type="button"
                disabled={busyId === book.id}
                onClick={() => toggleFavorite(book)}
                title={book.isFavorite ? 'Remove as favorite' : 'Set as favorite'}
                aria-pressed={book.isFavorite}
                className={`shrink-0 text-xl transition-transform hover:scale-110 disabled:opacity-50 ${
                  book.isFavorite ? 'text-accent' : 'text-ink/20'
                }`}
              >
                {book.isFavorite ? '★' : '☆'}
              </button>
              <button
                type="button"
                disabled={busyId === book.id}
                onClick={() => handleDelete(book.id, book.title)}
                className="shrink-0 text-sm font-bold text-red-600 hover:underline disabled:opacity-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
