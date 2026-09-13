import { NextResponse } from 'next/server'

/**
 * Streams back a file already public on our own Supabase Storage bucket, from
 * our own origin. Exists solely so client-side canvas code (the Book Panel
 * video export) can draw panel images/videos without tainting the canvas —
 * Supabase's storage responses aren't guaranteed to carry the CORS headers a
 * cross-origin <img>/<video> draw needs, but a same-origin fetch needs none.
 * Restricted to our own storage bucket's URL prefix so this can't be used as
 * an open proxy for arbitrary URLs.
 */
function allowedPrefix(): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return base ? `${base}/storage/v1/object/public/` : null
}

export async function GET(request: Request) {
  const target = new URL(request.url).searchParams.get('url')
  const prefix = allowedPrefix()

  if (!target || !prefix || !target.startsWith(prefix)) {
    return NextResponse.json({ error: 'Invalid or disallowed url.' }, { status: 400 })
  }

  let upstream: Response
  try {
    upstream = await fetch(target)
  } catch {
    return NextResponse.json({ error: 'Could not reach storage.' }, { status: 502 })
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Media not found.' }, { status: 404 })
  }

  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
