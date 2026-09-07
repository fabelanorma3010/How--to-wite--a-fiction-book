import type { Metadata } from 'next'
import Link from 'next/link'
import { getChapterById, getBookChapters } from '@/lib/books'
import ChapterReaderClient from './ChapterReaderClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapterId: string }>
}): Promise<Metadata> {
  const { chapterId } = await params
  const chapter = await getChapterById(chapterId)
  return { title: chapter ? `${chapter.bookTitle} — Ch. ${chapter.chapterNumber}` : 'Chapter' }
}

export default async function ChapterReaderPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params
  const chapter = await getChapterById(chapterId)

  if (!chapter) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-noir-on-surface">
        <p className="font-noir-display text-[20px]">This chapter isn&apos;t available.</p>
        <Link href="/library" className="text-noir-secondary-fixed-dim underline">
          Back to Discover
        </Link>
      </div>
    )
  }

  const siblings = await getBookChapters(chapter.bookId)
  const index = siblings.findIndex((s) => s.id === chapter.id)
  const prev = index > 0 ? siblings[index - 1] : null
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null

  return (
    <ChapterReaderClient
      chapter={chapter}
      prev={prev ? { id: prev.id, chapterNumber: prev.chapterNumber } : null}
      next={next ? { id: next.id, chapterNumber: next.chapterNumber } : null}
    />
  )
}
