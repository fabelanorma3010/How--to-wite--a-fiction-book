import { NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '../../../../lib/supabase/server'

// Diagnostic endpoint: confirms the Supabase connection works by reading a
// couple of rows from `posts`. Safe to leave in — it only returns published
// posts, which are world-readable under the RLS policy.
export async function GET() {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json(
      {
        ok: false,
        configured: isSupabaseConfigured,
        error: 'Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).',
      },
      { status: 503 },
    )
  }

  const { data, error } = await supabase
    .from('posts')
    .select('id, title, category, tags, published_at')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(2)

  if (error) {
    return NextResponse.json(
      { ok: false, configured: true, error: error.message, code: error.code, hint: error.hint },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true, configured: true, count: data.length, sample: data })
}
