import { NextRequest, NextResponse } from 'next/server'
import { getDb, ensureSchema } from '../../../../lib/db'
import { SESSION_COOKIE, deleteSession } from '../../../../lib/auth'

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const db = getDb()

  if (db && token) {
    try {
      await ensureSchema(db)
      await deleteSession(db, token)
    } catch {
      // best-effort: still clear the cookie below even if the row couldn't be deleted
    }
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.delete(SESSION_COOKIE)
  return response
}
