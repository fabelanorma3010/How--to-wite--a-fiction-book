import { NextRequest, NextResponse } from 'next/server'
import { getDb, ensureSchema } from '../../../../lib/db'
import { SESSION_COOKIE, getSessionUser } from '../../../../lib/auth'

export async function GET(request: NextRequest) {
  const db = getDb()
  if (!db) {
    return NextResponse.json({ user: null })
  }

  try {
    await ensureSchema(db)
    const token = request.cookies.get(SESSION_COOKIE)?.value
    const user = await getSessionUser(db, token)
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null })
  }
}
