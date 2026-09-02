import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

/**
 * Runs on every request: refreshes the Supabase Auth session cookie (standard
 * @supabase/ssr pattern) and, on /admin routes, enforces that the signed-in
 * user's email is on ADMIN_EMAILS — bouncing everyone else to /admin/login.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const path = request.nextUrl.pathname
  const isAdminRoute = path === '/admin' || path.startsWith('/admin/')

  let response = NextResponse.next({ request })

  if (!url || !anonKey) {
    if (isAdminRoute && path !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return response
  }

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

  if (isAdminRoute) {
    const isAdmin = Boolean(user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()))
    const onLoginPage = path === '/admin/login'
    if (isAdmin && onLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    if (!isAdmin && !onLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return response
}

export const config = {
  // Everything except Next internals and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.svg|favicon.ico|robots.txt|sitemap.xml).*)'],
}
