import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteSession, SESSION_COOKIE } from '../../../../lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  try {
    await deleteSession(token)
  } catch (error) {
    console.error('Failed to delete session', error)
  }

  cookieStore.delete(SESSION_COOKIE)
  return NextResponse.json({ ok: true })
}
