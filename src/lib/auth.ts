import type { Client } from '@libsql/client/web'

export const SESSION_COOKIE = 'sb_session'
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const PBKDF2_ITERATIONS = 100_000
const HASH_BYTES = 32

export interface SessionUser {
  id: string
  name: string
  email: string
}

function toHex(bytes: ArrayBuffer | Uint8Array<ArrayBuffer>): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

async function deriveHash(password: string, salt: BufferSource): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    HASH_BYTES * 8,
  )
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await deriveHash(password, salt)
  return { hash: toHex(hash), salt: toHex(salt) }
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const derived = await deriveHash(password, fromHex(salt))
  return toHex(derived) === hash
}

function generateToken(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(32)))
}

export async function createSession(db: Client, userId: string): Promise<{ token: string; maxAge: number }> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString()
  await db.execute({
    sql: 'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
    args: [token, userId, expiresAt],
  })
  return { token, maxAge: SESSION_DURATION_MS / 1000 }
}

export async function getSessionUser(db: Client, token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null
  const result = await db.execute({
    sql: `SELECT users.id as id, users.name as name, users.email as email
          FROM sessions JOIN users ON users.id = sessions.user_id
          WHERE sessions.token = ? AND sessions.expires_at > ?`,
    args: [token, new Date().toISOString()],
  })
  const row = result.rows[0]
  if (!row) return null
  return { id: String(row.id), name: String(row.name), email: String(row.email) }
}

export async function deleteSession(db: Client, token: string): Promise<void> {
  await db.execute({ sql: 'DELETE FROM sessions WHERE token = ?', args: [token] })
}
