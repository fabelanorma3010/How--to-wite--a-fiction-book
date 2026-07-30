import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserByToken, SESSION_COOKIE } from '../../../../lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  try {
    const user = await getUserByToken(token)
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Failed to load session', error)
    return NextResponse.json({ user: null })
  }
}
