import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

/**
 * Runs on every request: refreshes the Supabase Auth session cookie (standard
 * @supabase/ssr pattern) and gates two areas —
 *   /admin/*   → email must be on ADMIN_EMAILS, else bounced to /admin/login
 *   /account/* → must be signed in, else bounced to /login?next=…
 * Everything else (home, tools, /library) stays public.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const path = request.nextUrl.pathname
  const isAdminRoute = path === '/admin' || path.startsWith('/admin/')
  const isAccountRoute = path === '/account' || path.startsWith('/account/')

  let response = NextResponse.next({ request })

  if (!url || !anonKey) {
    if (isAdminRoute && path !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    if (isAccountRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
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
    let isAdmin = Boolean(user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()))
    if (!isAdmin && user) {
      // Second, additive path to admin: a role = 'admin' row in public.users,
      // settable from /admin/members. See src/lib/admin.ts isCurrentUserAdmin.
      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle()
      isAdmin = profile?.role === 'admin'
    }
    const onLoginPage = path === '/admin/login'
    if (isAdmin && onLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    if (!isAdmin && !onLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  if (isAccountRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', path + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  // Everything except Next internals and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.svg|favicon.ico|robots.txt|sitemap.xml).*)'],
}
