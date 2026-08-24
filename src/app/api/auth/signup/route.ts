import { NextRequest, NextResponse } from 'next/server'
import { getDb, ensureSchema } from '../../../../lib/db'
import { SESSION_COOKIE, createSession, hashPassword } from '../../../../lib/auth'

const MAX_NAME_LENGTH = 80
const MIN_PASSWORD_LENGTH = 8
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  const db = getDb()
  if (!db) {
    return NextResponse.json({ error: "Accounts aren't configured yet (missing TURSO_DATABASE_URL)." }, { status: 503 })
  }

  let name: unknown
  let email: unknown
  let password: unknown
  let agreedToTerms: unknown
  try {
    const body = await request.json()
    name = body?.name
    email = body?.email
    password = body?.password
    agreedToTerms = body?.agreedToTerms
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (typeof name !== 'string' || !name.trim() || name.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }, { status: 400 })
  }
  if (agreedToTerms !== true) {
    return NextResponse.json(
      { error: 'You must agree to the Terms of Service and Privacy Policy to create an account.' },
      { status: 400 },
    )
  }

  const trimmedName = name.trim()
  const normalizedEmail = email.trim().toLowerCase()

  try {
    await ensureSchema(db)

    const existing = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [normalizedEmail] })
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 })
    }

    const { hash, salt } = await hashPassword(password)
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await db.execute({
      sql: 'INSERT INTO users (id, name, email, password_hash, password_salt, agreed_to_terms_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [id, trimmedName, normalizedEmail, hash, salt, now, now],
    })

    const { token, maxAge } = await createSession(db, id)

    const response = NextResponse.json({ user: { id, name: trimmedName, email: normalizedEmail } })
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })
    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Something went wrong creating your account.' }, { status: 502 })
  }
}
