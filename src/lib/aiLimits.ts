import { createHash } from 'node:crypto'
import { createClient } from './supabase/server'
import { getSupabaseAdmin } from './supabase/admin'

export type AiFeature = 'chat' | 'image' | 'tools'

// Daily caps per bucket. Anonymous callers are bucketed by hashed IP; signed-in
// callers by user id and get the higher number. Generous enough that someone
// actually writing their book won't hit them, low enough to bound API spend —
// especially images, which are the expensive call.
const LIMITS: Record<AiFeature, { anon: number; user: number }> = {
  chat: { anon: 20, user: 60 },
  image: { anon: 3, user: 12 },
  tools: { anon: 8, user: 30 },
}

const SALT = process.env.AI_LIMIT_SALT ?? 'storyburst-ai-rl-v1'

function hashedIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  const ip = (fwd ? fwd.split(',')[0] : request.headers.get('x-real-ip')) ?? 'unknown'
  return createHash('sha256').update(`${SALT}:${ip.trim()}`).digest('hex').slice(0, 32)
}

const noun: Record<AiFeature, string> = { chat: 'messages', image: 'images', tools: 'runs' }

/**
 * Returns null when the caller may proceed, or `{ status, error }` for the route
 * to return when they've hit today's cap. Fails OPEN — if Supabase isn't
 * configured or the check errors, it returns null rather than blocking. The
 * limits are cost protection, not an auth gate.
 */
export async function checkAiLimit(
  request: Request,
  feature: AiFeature,
): Promise<{ status: number; error: string } | null> {
  const admin = getSupabaseAdmin()
  if (!admin) return null

  let bucket: string
  let signedIn = false
  try {
    const supabase = await createClient()
    const userRes = supabase ? await supabase.auth.getUser() : null
    if (userRes?.data.user) {
      bucket = `u:${userRes.data.user.id}`
      signedIn = true
    } else {
      bucket = `ip:${hashedIp(request)}`
    }
  } catch {
    bucket = `ip:${hashedIp(request)}`
  }

  const limit = signedIn ? LIMITS[feature].user : LIMITS[feature].anon

  const { data: allowed, error } = await admin.rpc('check_ai_limit', {
    p_bucket: bucket,
    p_feature: feature,
    p_limit: limit,
  })
  if (error || allowed !== false) return null

  return {
    status: 429,
    error: signedIn
      ? `You've used your ${limit} AI ${noun[feature]} for today — they reset at midnight UTC.`
      : `You've hit today's free limit for this tool. Sign in for a higher daily allowance, or come back tomorrow.`,
  }
}
