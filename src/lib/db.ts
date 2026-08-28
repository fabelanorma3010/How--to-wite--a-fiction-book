export interface Row {
  [column: string]: string | number | null
}

export interface Client {
  execute(query: string | { sql: string; args?: unknown[] }): Promise<{ rows: Row[] }>
  batch(statements: string[]): Promise<void>
}

interface TursoValue {
  type: 'text' | 'integer' | 'float' | 'null' | 'blob'
  value?: string
}

type TursoResponseEntry =
  | { type: 'ok'; response: { type: string; result?: { cols: { name: string }[]; rows: TursoValue[][] } } }
  | { type: 'error'; error: { message: string } }

function toTursoArg(value: unknown): TursoValue {
  if (value === null || value === undefined) return { type: 'null' }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { type: 'integer', value: String(value) } : { type: 'float', value: String(value) }
  }
  return { type: 'text', value: String(value) }
}

function fromTursoValue(value: TursoValue): string | number | null {
  if (!value || value.type === 'null' || value.value === undefined) return null
  if (value.type === 'integer' || value.type === 'float') return Number(value.value)
  return value.value
}

// A minimal HTTP client for Turso's pipeline API (https://docs.turso.tech/sdk/http/reference),
// used instead of @libsql/client: that package's every entrypoint (default, /web, /http) routes
// through @libsql/hrana-client, which unconditionally imports @libsql/isomorphic-ws — a WebSocket
// dependency this app never needs (we only ever call libsql over plain HTTPS) that fails to bundle
// for the Cloudflare Workers ("workerd") runtime. Talking to the HTTP API directly sidesteps that
// entirely.
function createTursoClient(baseUrl: string, authToken: string): Client {
  const httpUrl = baseUrl.replace(/^libsql:\/\//, 'https://').replace(/\/$/, '')

  async function pipeline(requests: Array<{ type: string; stmt?: { sql: string; args: TursoValue[] } }>) {
    const res = await fetch(`${httpUrl}/v2/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests: [...requests, { type: 'close' }] }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Turso request failed (${res.status}): ${text.slice(0, 300)}`)
    }

    const data = (await res.json()) as { results: TursoResponseEntry[] }
    return data.results
  }

  return {
    async execute(query) {
      const { sql, args = [] } = typeof query === 'string' ? { sql: query, args: [] as unknown[] } : query
      const results = await pipeline([{ type: 'execute', stmt: { sql, args: args.map(toTursoArg) } }])
      const first = results[0]
      if (!first || first.type === 'error') {
        throw new Error(first?.type === 'error' ? first.error.message : 'Turso query failed.')
      }
      const result = first.response.result
      if (!result) return { rows: [] }
      const rows = result.rows.map((row) => {
        const obj: Row = {}
        result.cols.forEach((col, i) => {
          obj[col.name] = fromTursoValue(row[i])
        })
        return obj
      })
      return { rows }
    },
    async batch(statements) {
      const results = await pipeline(statements.map((sql) => ({ type: 'execute', stmt: { sql, args: [] } })))
      const failed = results.find((r) => r.type === 'error')
      if (failed && failed.type === 'error') throw new Error(failed.error.message)
    },
  }
}

let client: Client | null | undefined
let schemaReady = false

export function getDb(): Client | null {
  if (client !== undefined) return client

  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  client = url && authToken ? createTursoClient(url, authToken) : null
  return client
}

export async function ensureSchema(db: Client): Promise<void> {
  if (schemaReady) return

  await db.batch([
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
    `CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      book_type TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
  ])
  schemaReady = true
}
