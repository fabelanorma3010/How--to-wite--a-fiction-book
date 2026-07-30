import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { bookTypes, type BookTypeId } from '../../../data/bookTypes'
import { getDb } from '../../../lib/db'
import { getUserByToken, SESSION_COOKIE } from '../../../lib/auth'
import { MAX_CONTENT_LENGTH } from '../../../lib/community'

export const dynamic = 'force-dynamic'

const VALID_TYPES = new Set<string>(bookTypes.map((type) => type.id))

export async function GET() {
  try {
    const sql = await getDb()
    const posts = await sql`
      SELECT id, name, book_type AS "bookType", content, created_at AS "createdAt"
      FROM community_posts
      ORDER BY created_at DESC
      LIMIT 50
    `
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Failed to load community posts', error)
    return NextResponse.json({ error: 'Could not load community posts.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const user = await getUserByToken(token)
  if (!user) {
    return NextResponse.json({ error: 'Log in to share with the community.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { bookType, content } = (body ?? {}) as Record<string, unknown>

  if (typeof bookType !== 'string' || !VALID_TYPES.has(bookType)) {
    return NextResponse.json({ error: 'Invalid book type.' }, { status: 400 })
  }

  const trimmedContent = typeof content === 'string' ? content.trim() : ''
  if (!trimmedContent) {
    return NextResponse.json({ error: 'Post content is required.' }, { status: 400 })
  }
  if (trimmedContent.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: `Posts must be ${MAX_CONTENT_LENGTH} characters or fewer.` },
      { status: 400 },
    )
  }

  try {
    const sql = await getDb()
    const [post] = await sql`
      INSERT INTO community_posts (name, book_type, content, user_id)
      VALUES (${user.displayName}, ${bookType as BookTypeId}, ${trimmedContent}, ${user.id})
      RETURNING id, name, book_type AS "bookType", content, created_at AS "createdAt"
    `
    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Failed to create community post', error)
    return NextResponse.json({ error: 'Could not save your post.' }, { status: 500 })
  }
}
