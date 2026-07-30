import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { getDb } from './db'

export const SESSION_COOKIE = 'storyburst_session'
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000

export interface AuthUser {
  id: number
  email: string
  displayName: string
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

let dummyHash: Promise<string> | null = null

/**
 * Verifies a password against a hash that may not exist (e.g. unknown email).
 * Always runs a real bcrypt comparison so a missing account can't be
 * distinguished from a wrong password by response timing.
 */
export async function verifyPasswordSafely(password: string, hash: string | undefined) {
  if (hash) return verifyPassword(password, hash)
  dummyHash ??= hashPassword('storyburst-dummy-password-for-timing-safety')
  await verifyPassword(password, await dummyHash)
  return false
}

export async function createSession(userId: number) {
  const sql = await getDb()
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  await sql`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (${token}, ${userId}, ${expiresAt.toISOString()})
  `
  return { token, expiresAt }
}

export async function getUserByToken(token: string | undefined): Promise<AuthUser | null> {
  if (!token) return null
  const sql = await getDb()
  const rows = await sql`
    SELECT u.id, u.email, u.display_name AS "displayName"
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `
  return (rows[0] as AuthUser | undefined) ?? null
}

export async function deleteSession(token: string | undefined) {
  if (!token) return
  const sql = await getDb()
  await sql`DELETE FROM sessions WHERE token = ${token}`
}
