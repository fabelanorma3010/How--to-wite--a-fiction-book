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

  tableReady ??= sqlClient`
    CREATE TABLE IF NOT EXISTS community_posts (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(60) NOT NULL DEFAULT 'Anonymous',
      book_type VARCHAR(20) NOT NULL,
      content VARCHAR(500) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await tableReady
  return sqlClient
}
