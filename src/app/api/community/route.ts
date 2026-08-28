import { NextRequest, NextResponse } from 'next/server'
import { bookTypes } from '../../../data/bookTypes'
import { getDb, ensureSchema } from '../../../lib/db'
import { SESSION_COOKIE, getSessionUser } from '../../../lib/auth'
import { MAX_CONTENT_LENGTH } from '../../../lib/community'

const VALID_TYPES = new Set<string>(bookTypes.map((type) => type.id))

export async function GET() {
  const db = getDb()
  if (!db) {
    return NextResponse.json({ posts: [] })
  }

  try {
    await ensureSchema(db)
    const result = await db.execute(
      'SELECT id, name, book_type as bookType, content, created_at as createdAt FROM community_posts ORDER BY created_at DESC LIMIT 50',
    )
    return NextResponse.json({ posts: result.rows })
  } catch {
    return NextResponse.json({ error: 'Could not load community posts.' }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  const db = getDb()
  if (!db) {
    return NextResponse.json({ error: "The community wall isn't configured yet." }, { status: 503 })
  }

  await ensureSchema(db)
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const user = await getSessionUser(db, token)
  if (!user) {
    return NextResponse.json({ error: 'Log in to share with the community.' }, { status: 401 })
  }

  let bookType: unknown
  let content: unknown
  try {
    const body = await request.json()
    bookType = body?.bookType
    content = body?.content
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

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
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    await db.execute({
      sql: 'INSERT INTO community_posts (id, user_id, name, book_type, content, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, user.id, user.name, bookType, trimmedContent, createdAt],
    })
    return NextResponse.json(
      { post: { id, name: user.name, bookType, content: trimmedContent, createdAt } },
      { status: 201 },
    )
  } catch {
    return NextResponse.json({ error: 'Could not save your post.' }, { status: 502 })
  }
}
