import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { isAdminEmail } from '../../../../lib/admin'

// Tells the client whether the current visitor is a signed-in admin, so the
// header can show an "Admin" link only to them. Never exposes the allowlist.
export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ isAdmin: false })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return NextResponse.json({ isAdmin: isAdminEmail(user?.email) })
  } catch {
    return NextResponse.json({ isAdmin: false })
  }
}
