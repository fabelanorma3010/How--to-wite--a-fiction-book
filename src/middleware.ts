import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

/**
 * Gate for /admin: a valid Supabase Auth session whose email is on ADMIN_EMAILS.
 * Everyone else is bounced to /admin/login. This is separate from the main
 * site's Turso auth and only runs on /admin routes.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return new NextResponse('Admin is not configured (Supabase env vars missing).', { status: 503 })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const email = user?.email?.toLowerCase()
  const isAdmin = Boolean(email && ADMIN_EMAILS.includes(email))
  const onLoginPage = request.nextUrl.pathname === '/admin/login'

  if (isAdmin && onLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  if (!isAdmin && !onLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  return response
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
