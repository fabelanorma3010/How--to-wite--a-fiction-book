import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'

const SUPABASE_URL = 'https://project.supabase.co'
const ALLOWED = `${SUPABASE_URL}/storage/v1/object/public/books/user-1/panel.png`

function proxyRequest(url: string | null) {
  const target = new URL('http://localhost/api/proxy-media')
  if (url !== null) target.searchParams.set('url', url)
  return GET(new Request(target))
}

describe('/api/proxy-media', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('rejects a request with no url param', async () => {
    const res = await proxyRequest(null)
    expect(res.status).toBe(400)
  })

  it('rejects a url outside our own Supabase storage bucket', async () => {
    const res = await proxyRequest('https://evil.example.com/steal-this.png')
    expect(res.status).toBe(400)
  })

  it('rejects everything when NEXT_PUBLIC_SUPABASE_URL is not configured', async () => {
    vi.unstubAllEnvs()
    const res = await proxyRequest(ALLOWED)
    expect(res.status).toBe(400)
  })

  it('streams back a matching url with the upstream content type and a long cache header', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('fake-image-bytes', { status: 200, headers: { 'content-type': 'image/png' } }),
      ),
    )

    const res = await proxyRequest(ALLOWED)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('image/png')
    expect(res.headers.get('cache-control')).toContain('immutable')
    expect(await res.text()).toBe('fake-image-bytes')
    expect(fetch).toHaveBeenCalledWith(ALLOWED)
  })

  it('returns 404 when the upstream fetch is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 403 })))
    const res = await proxyRequest(ALLOWED)
    expect(res.status).toBe(404)
  })

  it('returns 502 when the upstream fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))
    const res = await proxyRequest(ALLOWED)
    expect(res.status).toBe(502)
  })

  it('still matches when the configured Supabase URL has a trailing slash', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', `${SUPABASE_URL}/`)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('bytes', { status: 200, headers: { 'content-type': 'image/png' } })),
    )

    const res = await proxyRequest(ALLOWED)
    expect(res.status).toBe(200)
    expect(fetch).toHaveBeenCalledWith(ALLOWED)
  })
})
