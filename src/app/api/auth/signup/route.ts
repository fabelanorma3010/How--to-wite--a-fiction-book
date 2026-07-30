import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDb, isUniqueViolation } from '../../../../lib/db'
import { createSession, hashPassword, SESSION_COOKIE } from '../../../../lib/auth'
import { MAX_NAME_LENGTH } from '../../../../lib/community'

export const dynamic = 'force-dynamic'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 200

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { email, password, displayName } = (body ?? {}) as Record<string, unknown>

  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  if (
    typeof password !== 'string' ||
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return NextResponse.json(
      { error: `Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters.` },
      { status: 400 },
    )
  }

  const trimmedName = typeof displayName === 'string' ? displayName.trim().slice(0, MAX_NAME_LENGTH) : ''
  if (!trimmedName) {
    return NextResponse.json({ error: 'Display name is required.' }, { status: 400 })
  }

  try {
    const sql = await getDb()
    const passwordHash = await hashPassword(password)

    const [user] = await sql`
      INSERT INTO users (email, password_hash, display_name)
      VALUES (${normalizedEmail}, ${passwordHash}, ${trimmedName})
      RETURNING id, email, display_name AS "displayName"
    `

    const { token, expiresAt } = await createSession(user.id)
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: 'That email is already registered.' }, { status: 409 })
    }
    console.error('Failed to sign up', error)
    return NextResponse.json({ error: 'Could not create your account.' }, { status: 500 })
  }
}
