import { createClient, type Client } from '@libsql/client/web'

let client: Client | null | undefined
let schemaReady = false

export function getDb(): Client | null {
  if (client !== undefined) return client

  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  client = url && authToken ? createClient({ url, authToken }) : null
  return client
}

export async function ensureSchema(db: Client): Promise<void> {
  if (schemaReady) return

  await db.batch(
    [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        agreed_to_terms_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        expires_at TEXT NOT NULL
      )`,
    ],
    'write',
  )
  schemaReady = true
}
