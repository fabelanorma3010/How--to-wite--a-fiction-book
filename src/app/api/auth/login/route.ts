import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDb } from '../../../../lib/db'
import { createSession, verifyPasswordSafely, SESSION_COOKIE } from '../../../../lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { email, password } = (body ?? {}) as Record<string, unknown>
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

  if (!normalizedEmail || typeof password !== 'string' || !password) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 })
  }

  try {
    const sql = await getDb()
    const [row] = await sql`
      SELECT id, email, display_name AS "displayName", password_hash AS "passwordHash"
      FROM users
      WHERE email = ${normalizedEmail}
    `

    const passwordMatches = await verifyPasswordSafely(password, row?.passwordHash)
    if (!row || !passwordMatches) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const { token, expiresAt } = await createSession(row.id)
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    })

    return NextResponse.json({
      user: { id: row.id, email: row.email, displayName: row.displayName },
    })
  } catch (error) {
    console.error('Failed to log in', error)
    return NextResponse.json({ error: 'Could not log in.' }, { status: 500 })
  }
}
