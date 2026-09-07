'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { bookTypes, bookFormatEmoji } from '@/data/bookTypes'
import ShimmerNextImage from '@/components/ShimmerNextImage'
import DictateButton from '@/components/DictateButton'
import { getBookFormatTheme, textureOverlayStyle } from '@/data/bookFormatThemes'
import type { Book, Chapter } from '@/lib/books'

const MAX_COVER_BYTES = 5 * 1024 * 1024
const MAX_FILE_BYTES = 50 * 1024 * 1024
const MAX_PAGE_BYTES = 10 * 1024 * 1024
const MAX_PAGES_PER_CHAPTER = 30
const ACCEPTED_COVER = ['image/png', 'image/jpeg', 'image/webp']
const ACCEPTED_FILE = ['application/pdf', 'application/epub+zip']
const ACCEPTED_PAGE = ['image/png', 'image/jpeg', 'image/webp']

const cardClass = 'rounded-3xl border-2 border-ink/10 bg-white/70 p-6 shadow-sm sm:p-8'
const labelClass = 'mb-1.5 block text-sm font-bold text-ink/80'
const inputClass =
  'w-full rounded-2xl border-2 border-ink/15 bg-page/80 px-4 py-2.5 text-ink placeholder:text-ink/40 focus:border-primary/50'
const buttonClass =
  'rounded-full bg-primary px-6 py-3 font-bold text-primary-content shadow-md transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100'

function typeEmoji(bookType: Book['bookType']) {
  return bookFormatEmoji(bookType)
}

export default function BookManager({ userId, books }: { userId: string; books: Book[] }) {
  const router = useRouter()
  const bt = useTranslations('BookTypes')
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [bookType, setBookType] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverGeneratedUrl, setCoverGeneratedUrl] = useState<string | null>(null)
  const [coverPrompt, setCoverPrompt] = useState('')
  const [coverBusy, setCoverBusy] = useState(false)
  const [coverError, setCoverError] = useState('')
  const [bookFile, setBookFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({})

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
      let coverUrl: string | null = coverGeneratedUrl
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
      setCoverGeneratedUrl(null)
      setCoverPrompt('')
      setBookFile(null)
      setAdding(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that book.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGenerateCover() {
    if (!coverPrompt.trim() || coverBusy) return
    setCoverBusy(true)
    setCoverError('')
    try {
      const res = await fetch('/api/generate-illustration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: coverPrompt.trim() }),
      })
      const data = await res.json()
      if (!res.ok || typeof data?.image !== 'string') {
        throw new Error(data?.error || 'Could not generate that cover.')
      }
      setCoverGeneratedUrl(data.image)
      setCoverFile(null)
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : 'Could not generate that cover.')
    } finally {
      setCoverBusy(false)
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
            className="rounded-full border-2 border-ink/15 px-4 py-1.5 text-sm font-bold text-ink transition-colors hover:bg-page/60"
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
              {bookTypes.map((bookTypeOption) => (
                <option key={bookTypeOption.id} value={bookTypeOption.id}>
                  {bookTypeOption.emoji} {bt(`types.${bookTypeOption.id}.name`)}
                </option>
              ))}
              <option value="chapterbook">📗 Chapter book (prose, not panels)</option>
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
                onChange={(e) => {
                  setCoverFile(e.target.files?.[0] ?? null)
                  setCoverGeneratedUrl(null)
                }}
                className="w-full text-sm text-ink/70"
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={coverPrompt}
                  onChange={(e) => setCoverPrompt(e.target.value)}
                  placeholder="…or describe a cover to generate"
                  className={`${inputClass} py-1.5 text-sm`}
                />
                <button
                  type="button"
                  onClick={() => void handleGenerateCover()}
                  disabled={coverBusy || !coverPrompt.trim()}
                  className="shrink-0 rounded-full border-2 border-primary/40 px-3 py-1.5 text-sm font-bold text-ink transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {coverBusy ? 'Generating…' : '🖼️ Generate'}
                </button>
              </div>
              {coverError && <p className="mt-1.5 text-xs font-semibold text-red-600">{coverError}</p>}
              {coverGeneratedUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={coverGeneratedUrl} alt="Generated cover" className="h-16 w-12 rounded-md object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverGeneratedUrl(null)}
                    className="text-xs font-bold text-ink/50 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
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
              onClick={() => {
                setAdding(false)
                setCoverFile(null)
                setCoverGeneratedUrl(null)
                setCoverPrompt('')
                setCoverError('')
              }}
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
            <li key={book.id} className="rounded-2xl border-2 border-ink/10 bg-white/60 p-3">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-page">
                  {book.coverUrl ? (
                    <ShimmerNextImage src={book.coverUrl} alt="" fill sizes="40px" className="object-cover" />
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
                  onClick={() => setExpandedChapters((prev) => ({ ...prev, [book.id]: !prev[book.id] }))}
                  className="shrink-0 text-sm font-bold text-ink/50 hover:underline"
                >
                  Chapters
                </button>
                <button
                  type="button"
                  disabled={busyId === book.id}
                  onClick={() => handleDelete(book.id, book.title)}
                  className="shrink-0 text-sm font-bold text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
              {expandedChapters[book.id] && (
                <ChapterPanel userId={userId} bookId={book.id} bookType={book.bookType} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const CHAPTER_STICKERS = ['💥', '⭐', '✨', '🔥', '❗', '👊', '😱', '💦']

function ChapterPanel({
  userId,
  bookId,
  bookType,
}: {
  userId: string
  bookId: string
  bookType: Book['bookType']
}) {
  const isText = bookType === 'chapterbook'
  const isManga = bookType === 'manga'
  const theme = getBookFormatTheme(bookType)
  const [chapters, setChapters] = useState<Chapter[] | null>(null)
  const [adding, setAdding] = useState(false)
  const [chapterTitle, setChapterTitle] = useState('')
  const [pageUrls, setPageUrls] = useState<string[]>([])
  const [pageCaptions, setPageCaptions] = useState<string[]>([])
  const [pageViewIndex, setPageViewIndex] = useState(0)
  const [pageTurnDir, setPageTurnDir] = useState<'next' | 'prev'>('next')
  const [pageImagePrompt, setPageImagePrompt] = useState('')
  const [pageImageBusy, setPageImageBusy] = useState(false)
  const [pageImageError, setPageImageError] = useState('')
  const [pageTexts, setPageTexts] = useState<string[]>(() => Array(MAX_PAGES_PER_CHAPTER).fill(''))
  const [chapterPageIndex, setChapterPageIndex] = useState(0)
  const [chapterPageTurnDir, setChapterPageTurnDir] = useState<'next' | 'prev'>('next')
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageBusy, setImageBusy] = useState(false)
  const [imageError, setImageError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId])

  async function load() {
    const supabase = createClient()
    if (!supabase) {
      setChapters([])
      return
    }
    const { data } = await supabase
      .from('book_chapters')
      .select('id, book_id, chapter_number, title, body, pages, page_captions, published_at')
      .eq('book_id', bookId)
      .order('chapter_number', { ascending: true })
    setChapters(
      (data ?? []).map((row) => ({
        id: row.id,
        bookId: row.book_id,
        chapterNumber: row.chapter_number,
        title: row.title,
        body: row.body,
        pages: row.pages ?? [],
        pageCaptions: row.page_captions ?? [],
        publishedAt: row.published_at,
      })),
    )
  }

  const nextNumber = chapters && chapters.length > 0 ? Math.max(...chapters.map((c) => c.chapterNumber)) + 1 : 1

  function insertAtCursor(snippet: string) {
    const el = textareaRef.current
    const current = pageTexts[chapterPageIndex] ?? ''
    const start = el?.selectionStart ?? current.length
    const end = el?.selectionEnd ?? current.length
    setPageTexts((prev) => {
      const next = [...prev]
      next[chapterPageIndex] = current.slice(0, start) + snippet + current.slice(end)
      return next
    })
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      const pos = start + snippet.length
      el.setSelectionRange(pos, pos)
    })
  }

  async function loadFromNotebook() {
    const supabase = createClient()
    if (!supabase) return
    const { data } = await supabase.from('notebooks').select('content').eq('user_id', userId).maybeSingle()
    if (!data?.content) return
    const content = data.content as string
    setPageTexts((prev) => {
      const next = [...prev]
      next[chapterPageIndex] = content
      return next
    })
  }

  async function handleGenerateImage() {
    if (!imagePrompt.trim() || imageBusy) return
    setImageBusy(true)
    setImageError('')
    try {
      const res = await fetch('/api/generate-illustration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt.trim() }),
      })
      const data = await res.json()
      if (!res.ok || typeof data?.image !== 'string') {
        throw new Error(data?.error || 'Could not generate that image.')
      }
      insertAtCursor(`\n![${imagePrompt.trim()}](${data.image})\n`)
      setImagePrompt('')
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Could not generate that image.')
    } finally {
      setImageBusy(false)
    }
  }

  async function handleUploadInlineImage(file: File) {
    setImageError('')
    if (!ACCEPTED_PAGE.includes(file.type) || file.size > MAX_PAGE_BYTES) {
      setImageError('Images must be PNG, JPEG, or WebP, 10MB max.')
      return
    }
    const supabase = createClient()
    if (!supabase) return
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${userId}/chapter-${bookId}-${nextNumber}-inline-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('books')
      .upload(path, file, { contentType: file.type })
    if (uploadError) {
      setImageError(uploadError.message)
      return
    }
    const url = supabase.storage.from('books').getPublicUrl(path).data.publicUrl
    insertAtCursor(`\n![](${url})\n`)
  }

  async function handleBulkAddPages(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setPageImageError('')
    const supabase = createClient()
    if (!supabase) return
    const remaining = MAX_PAGES_PER_CHAPTER - pageUrls.length
    const files = Array.from(fileList).slice(0, Math.max(remaining, 0))
    if (fileList.length > files.length) {
      setPageImageError(`A chapter can have up to ${MAX_PAGES_PER_CHAPTER} pages — only added ${files.length}.`)
    }
    let count = pageUrls.length
    for (const file of files) {
      if (!ACCEPTED_PAGE.includes(file.type) || file.size > MAX_PAGE_BYTES) {
        setPageImageError('Pages must be PNG, JPEG, or WebP images, 10MB max each.')
        continue
      }
      count += 1
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${userId}/chapter-${bookId}-${nextNumber}-page-${count}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('books')
        .upload(path, file, { contentType: file.type })
      if (uploadError) {
        setPageImageError(uploadError.message)
        continue
      }
      const url = supabase.storage.from('books').getPublicUrl(path).data.publicUrl
      setPageUrls((prev) => [...prev, url])
      setPageCaptions((prev) => [...prev, ''])
      setPageTurnDir('next')
      setPageViewIndex(count - 1)
    }
  }

  async function handleGeneratePage() {
    if (!pageImagePrompt.trim() || pageImageBusy || pageUrls.length >= MAX_PAGES_PER_CHAPTER) return
    setPageImageBusy(true)
    setPageImageError('')
    try {
      const res = await fetch('/api/generate-illustration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: pageImagePrompt.trim() }),
      })
      const data = await res.json()
      if (!res.ok || typeof data?.image !== 'string') {
        throw new Error(data?.error || 'Could not generate that page.')
      }
      setPageUrls((prev) => [...prev, data.image])
      setPageCaptions((prev) => [...prev, ''])
      setPageTurnDir('next')
      setPageViewIndex(pageUrls.length)
      setPageImagePrompt('')
    } catch (err) {
      setPageImageError(err instanceof Error ? err.message : 'Could not generate that page.')
    } finally {
      setPageImageBusy(false)
    }
  }

  function removePage(index: number) {
    setPageUrls((prev) => prev.filter((_, i) => i !== index))
    setPageCaptions((prev) => prev.filter((_, i) => i !== index))
    setPageViewIndex((prev) => Math.min(prev, Math.max(pageUrls.length - 2, 0)))
  }

  function updatePageCaption(index: number, caption: string) {
    setPageCaptions((prev) => {
      const next = [...prev]
      next[index] = caption
      return next
    })
  }

  async function handleAddChapter(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const chapterBody = pageTexts.map((p) => p.trim()).filter(Boolean).join('\n\n')

    if (isText) {
      if (!chapterBody) {
        setError('Write something before publishing this chapter.')
        return
      }
    } else if (pageUrls.length === 0) {
      setError('Add at least one page — upload or generate one below.')
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
      if (isText) {
        const { error: insertError } = await supabase.from('book_chapters').insert({
          book_id: bookId,
          chapter_number: nextNumber,
          title: chapterTitle.trim() || null,
          body: chapterBody,
          pages: [],
        })
        if (insertError) throw insertError
        setPageTexts(Array(MAX_PAGES_PER_CHAPTER).fill(''))
        setChapterPageIndex(0)
      } else {
        const { error: insertError } = await supabase.from('book_chapters').insert({
          book_id: bookId,
          chapter_number: nextNumber,
          title: chapterTitle.trim() || null,
          pages: pageUrls,
          page_captions: pageCaptions,
        })
        if (insertError) throw insertError
        setPageUrls([])
        setPageCaptions([])
        setPageViewIndex(0)
      }

      setChapterTitle('')
      setAdding(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that chapter.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteChapter(id: string, number: number) {
    if (!confirm(`Delete chapter ${number}? This can't be undone.`)) return
    setBusyId(id)
    const supabase = createClient()
    await supabase?.from('book_chapters').delete().eq('id', id)
    setBusyId(null)
    await load()
  }

  return (
    <div className="mt-2 rounded-xl bg-page/60 p-3">
      {chapters === null && <p className="text-xs font-semibold text-ink/40">Loading chapters…</p>}
      {chapters !== null && chapters.length === 0 && !adding && (
        <p className="text-xs font-semibold text-ink/40">No chapters yet.</p>
      )}
      {chapters !== null && chapters.length > 0 && (
        <ul className="space-y-1">
          {chapters.map((chapter) => (
            <li key={chapter.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-ink/80">
                Ch. {chapter.chapterNumber}
                {chapter.title ? ` · ${chapter.title}` : ''}{' '}
                <span className="text-xs text-ink/40">
                  {chapter.body
                    ? `(${chapter.body.trim().split(/\s+/).length} words)`
                    : `(${chapter.pages.length} pages)`}
                </span>
              </span>
              <button
                type="button"
                disabled={busyId === chapter.id}
                onClick={() => void handleDeleteChapter(chapter.id, chapter.chapterNumber)}
                className="shrink-0 text-xs font-bold text-red-600 hover:underline disabled:opacity-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {!adding ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2 text-sm font-bold text-ink/70 hover:underline"
        >
          + Add chapter {nextNumber}
        </button>
      ) : (
        <form onSubmit={handleAddChapter} className="mt-2 space-y-2 border-t-2 border-ink/10 pt-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-ink/60">
              Chapter {nextNumber} title (optional)
            </label>
            <input
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              className="w-full rounded-lg border-2 border-ink/15 bg-white px-3 py-1.5 text-sm text-ink focus:border-primary/50"
            />
          </div>

          {isText ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void loadFromNotebook()}
                  className="rounded-full border-2 border-ink/15 bg-white px-3 py-1 text-xs font-bold text-ink/70 hover:bg-page"
                >
                  Load from Notebook
                </button>
                <span className="text-xs font-semibold text-ink/40">
                  loads into the page you&rsquo;re on — or write straight in below
                </span>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-ink/60">
                  Page {chapterPageIndex + 1} of {MAX_PAGES_PER_CHAPTER}
                </label>
                <div className="flex items-center gap-2" style={{ perspective: '1400px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setChapterPageTurnDir('prev')
                      setChapterPageIndex((i) => Math.max(i - 1, 0))
                    }}
                    disabled={chapterPageIndex === 0}
                    aria-label="Previous page"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink/15 bg-white text-base font-bold text-ink disabled:opacity-30"
                  >
                    ‹
                  </button>

                  <textarea
                    key={chapterPageIndex}
                    ref={textareaRef}
                    value={pageTexts[chapterPageIndex] ?? ''}
                    onChange={(e) =>
                      setPageTexts((prev) => {
                        const next = [...prev]
                        next[chapterPageIndex] = e.target.value
                        return next
                      })
                    }
                    rows={10}
                    placeholder={chapterPageIndex === 0 ? 'Once upon a time...' : `Page ${chapterPageIndex + 1}…`}
                    className={`min-w-0 flex-1 resize-y px-4 py-3 text-[15px] leading-relaxed focus:outline-none ${
                      chapterPageTurnDir === 'prev' ? 'animate-page-turn-prev' : 'animate-page-turn-next'
                    }`}
                    style={{
                      background: theme.pageBg,
                      color: theme.ink,
                      fontFamily: theme.bodyFont,
                      border: theme.pageBorder === 'none' ? `1px solid ${theme.ink}22` : theme.pageBorder,
                      borderRadius: theme.pageRadius,
                      boxShadow: theme.pageShadow,
                      transformOrigin: 'left center',
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setChapterPageTurnDir('next')
                      setChapterPageIndex((i) => Math.min(i + 1, MAX_PAGES_PER_CHAPTER - 1))
                    }}
                    disabled={chapterPageIndex >= MAX_PAGES_PER_CHAPTER - 1}
                    aria-label="Next page"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink/15 bg-white text-base font-bold text-ink disabled:opacity-30"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="rounded-lg border-2 border-ink/10 bg-white/70 p-2.5">
                <p className="mb-1.5 text-xs font-bold text-ink/60">Add a sticker or an image at the cursor</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {CHAPTER_STICKERS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => insertAtCursor(emoji)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink/15 bg-white text-base hover:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
                  <label className="ml-1 cursor-pointer rounded-full border-2 border-ink/15 bg-white px-3 py-1 text-xs font-bold text-ink/70 hover:bg-page">
                    Upload image
                    <input
                      type="file"
                      accept={ACCEPTED_PAGE.join(',')}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) void handleUploadInlineImage(file)
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <input
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe an image to generate…"
                    className="min-w-0 flex-1 rounded-lg border-2 border-ink/15 bg-white px-2.5 py-1.5 text-xs text-ink focus:border-primary/50"
                  />
                  <DictateButton
                    onResult={setImagePrompt}
                    label="Speak"
                    className="rounded-full border-2 border-ink/15 bg-white px-3 py-1.5 text-xs font-bold text-ink/70 hover:bg-page"
                  />
                  <button
                    type="button"
                    onClick={() => void handleGenerateImage()}
                    disabled={imageBusy || !imagePrompt.trim()}
                    className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-content disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {imageBusy ? 'Generating…' : '🖼️ Generate'}
                  </button>
                </div>
                {imageError && <p className="mt-1.5 text-xs font-semibold text-red-600">{imageError}</p>}
              </div>
            </>
          ) : (
            <div>
              <label className="mb-1 block text-xs font-bold text-ink/60">
                Pages, in order ({pageUrls.length} / {MAX_PAGES_PER_CHAPTER})
                {isManga && ' — manga reads right to left, so add pages in reading order'}
              </label>

              <div className="mt-2 flex items-center gap-2" style={{ perspective: '1400px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setPageTurnDir('prev')
                    setPageViewIndex((i) => Math.max(i - 1, 0))
                  }}
                  disabled={pageViewIndex === 0}
                  aria-label="Previous page"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink/15 bg-white text-base font-bold text-ink disabled:opacity-30"
                >
                  ‹
                </button>

                <div
                  key={pageViewIndex}
                  className={`relative aspect-[3/4] flex-1 overflow-hidden ${
                    pageTurnDir === 'prev' ? 'animate-page-turn-prev' : 'animate-page-turn-next'
                  }`}
                  style={{
                    border: theme.pageBorder === 'none' ? `1px solid ${theme.ink}22` : theme.pageBorder,
                    borderRadius: theme.pageRadius,
                    boxShadow: theme.pageShadow,
                    background: theme.pageBg,
                    transformOrigin: 'left center',
                  }}
                >
                  {pageViewIndex < pageUrls.length ? (
                    theme.captionStyle === 'big' ? (
                      <div className="flex h-full w-full flex-col">
                        <div className="relative flex-[3] overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={pageUrls[pageViewIndex]}
                            alt={`Page ${pageViewIndex + 1}`}
                            className="h-full w-full object-cover"
                          />
                          {theme.illustTexture !== 'flat' && (
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0"
                              style={textureOverlayStyle(theme.illustTexture, theme.ink)}
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => removePage(pageViewIndex)}
                            aria-label={`Remove page ${pageViewIndex + 1}`}
                            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white hover:bg-black/80"
                          >
                            ×
                          </button>
                        </div>
                        <div
                          className="flex flex-1 items-center justify-center px-3 py-2"
                          style={{ background: theme.accentSoft, borderTop: `2px solid ${theme.ink}22` }}
                        >
                          <input
                            value={pageCaptions[pageViewIndex] ?? ''}
                            onChange={(e) => updatePageCaption(pageViewIndex, e.target.value)}
                            placeholder={`Write what happens on page ${pageViewIndex + 1}…`}
                            className="w-full bg-transparent text-center text-base font-bold focus:outline-none"
                            style={{ fontFamily: theme.displayFont, color: theme.ink }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pageUrls[pageViewIndex]}
                          alt={`Page ${pageViewIndex + 1}`}
                          className="h-full w-full object-contain"
                          style={theme.grayscale ? { filter: 'grayscale(1) contrast(1.05)' } : undefined}
                        />
                        {theme.illustTexture !== 'flat' && (
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0"
                            style={textureOverlayStyle(theme.illustTexture, theme.ink)}
                          />
                        )}
                        <span
                          className="absolute bottom-0 left-0 w-full px-2 py-1 text-xs font-bold text-white"
                          style={{
                            fontFamily: theme.displayFont,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                          }}
                        >
                          Page {pageViewIndex + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePage(pageViewIndex)}
                          aria-label={`Remove page ${pageViewIndex + 1}`}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white hover:bg-black/80"
                        >
                          ×
                        </button>
                        <div
                          className="absolute left-3 top-3 max-w-[80%]"
                          style={{
                            background: '#fff',
                            border: `2px solid ${theme.ink}`,
                            borderRadius: theme.captionStyle === 'manga' ? '3px' : '16px',
                            padding: '6px 10px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                          }}
                        >
                          <input
                            value={pageCaptions[pageViewIndex] ?? ''}
                            onChange={(e) => updatePageCaption(pageViewIndex, e.target.value)}
                            placeholder="Add a caption…"
                            className="w-full min-w-[9ch] bg-transparent text-xs font-bold focus:outline-none"
                            style={{ fontFamily: theme.bodyFont, color: '#141414' }}
                          />
                          <span
                            aria-hidden="true"
                            className="absolute -bottom-[6px] left-4 h-3 w-3 rotate-45"
                            style={{
                              background: '#fff',
                              borderRight: `2px solid ${theme.ink}`,
                              borderBottom: `2px solid ${theme.ink}`,
                            }}
                          />
                        </div>
                      </>
                    )
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 p-4 text-center">
                      <span className="text-2xl" style={{ color: `${theme.ink}55` }}>
                        +
                      </span>
                      <p className="text-xs font-bold" style={{ color: theme.soft, fontFamily: theme.bodyFont }}>
                        Add page {pageUrls.length + 1}
                      </p>
                      <label
                        className="cursor-pointer rounded-full border-2 px-3 py-1 text-xs font-bold"
                        style={{ borderColor: `${theme.ink}33`, color: theme.ink }}
                      >
                        Upload page
                        <input
                          type="file"
                          accept={ACCEPTED_PAGE.join(',')}
                          multiple
                          disabled={pageUrls.length >= MAX_PAGES_PER_CHAPTER}
                          onChange={(e) => {
                            void handleBulkAddPages(e.target.files)
                            e.target.value = ''
                          }}
                          className="hidden"
                        />
                      </label>
                      <div className="flex w-full flex-wrap items-center justify-center gap-1.5">
                        <input
                          value={pageImagePrompt}
                          onChange={(e) => setPageImagePrompt(e.target.value)}
                          placeholder="Describe this page…"
                          disabled={pageUrls.length >= MAX_PAGES_PER_CHAPTER}
                          className="min-w-0 flex-1 rounded-lg border-2 border-ink/15 bg-white px-2 py-1.5 text-xs text-ink focus:border-primary/50 disabled:opacity-50"
                        />
                        <DictateButton
                          onResult={setPageImagePrompt}
                          label="Speak"
                          className="rounded-full border-2 border-ink/15 bg-white px-2.5 py-1.5 text-xs font-bold text-ink/70 hover:bg-page"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleGeneratePage()}
                        disabled={pageImageBusy || !pageImagePrompt.trim() || pageUrls.length >= MAX_PAGES_PER_CHAPTER}
                        className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-content disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {pageImageBusy ? 'Generating…' : '🖼️ Generate page'}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPageTurnDir('next')
                    setPageViewIndex((i) => Math.min(i + 1, pageUrls.length))
                  }}
                  disabled={pageViewIndex >= pageUrls.length}
                  aria-label="Next page"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink/15 bg-white text-base font-bold text-ink disabled:opacity-30"
                >
                  ›
                </button>
              </div>

              {pageUrls.length > 0 && (
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  {pageUrls.map((_, i) => (
                    <span
                      key={i}
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: i === pageViewIndex ? 18 : 6,
                        background: i === pageViewIndex ? theme.accent : `${theme.ink}26`,
                      }}
                    />
                  ))}
                  <span
                    className="h-1.5 w-1.5 rounded-full border"
                    style={{
                      borderColor: `${theme.ink}4d`,
                      background: pageViewIndex === pageUrls.length ? theme.accent : 'transparent',
                    }}
                  />
                </div>
              )}
              {pageImageError && <p className="mt-1.5 text-center text-xs font-semibold text-red-600">{pageImageError}</p>}
            </div>
          )}

          {error && (
            <p role="alert" className="text-xs font-semibold text-red-600">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-content disabled:opacity-60"
            >
              {submitting ? 'Publishing…' : 'Add chapter'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false)
                setError(null)
                setPageUrls([])
                setPageCaptions([])
                setPageViewIndex(0)
                setPageImagePrompt('')
                setPageImageError('')
              }}
              className="rounded-full px-3 py-1.5 text-sm font-bold text-ink/60 hover:bg-ink/10"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
