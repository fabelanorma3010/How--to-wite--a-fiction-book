import { NextRequest, NextResponse } from 'next/server'
import { getDb, ensureSchema } from '../../../../lib/db'
import { SESSION_COOKIE, createSession, verifyPassword } from '../../../../lib/auth'

const GENERIC_ERROR = 'Incorrect email or password.'

export async function POST(request: NextRequest) {
  const db = getDb()
  if (!db) {
    return NextResponse.json({ error: "Accounts aren't configured yet (missing TURSO_DATABASE_URL)." }, { status: 503 })
  }

  let email: unknown
  let password: unknown
  try {
    const body = await request.json()
    email = body?.email
    password = body?.password
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    await ensureSchema(db)

    const result = await db.execute({
      sql: 'SELECT id, name, email, password_hash, password_salt FROM users WHERE email = ?',
      args: [normalizedEmail],
    })
    const row = result.rows[0]
    if (!row) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 })
    }

    const valid = await verifyPassword(password, String(row.password_hash), String(row.password_salt))
    if (!valid) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 })
    }

    const { token, maxAge } = await createSession(db, String(row.id))

    const response = NextResponse.json({ user: { id: row.id, name: row.name, email: row.email } })
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Something went wrong signing you in.' }, { status: 502 })
  }
}
