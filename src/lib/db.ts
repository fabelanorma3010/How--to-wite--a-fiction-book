import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

let sqlClient: NeonQueryFunction<false, false> | null = null
let tableReady: Promise<unknown> | null = null

export async function getDb() {
  if (!sqlClient) {
    const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL
    if (!connectionString) {
      throw new Error(
        'Missing DATABASE_URL environment variable — add your Neon/Postgres connection string to .env.local.',
      )
    }
    sqlClient = neon(connectionString)
  }

  tableReady ??= (async () => {
    await sqlClient!`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        display_name VARCHAR(60) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
    await sqlClient!`
      CREATE TABLE IF NOT EXISTS sessions (
        token VARCHAR(64) PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
    await sqlClient!`
      CREATE TABLE IF NOT EXISTS community_posts (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL DEFAULT 'Anonymous',
        book_type VARCHAR(20) NOT NULL,
        content VARCHAR(500) NOT NULL,
        user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
    await sqlClient!`
      ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE SET NULL
    `
  })()

  await tableReady
  return sqlClient
}

export function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === '23505'
}
