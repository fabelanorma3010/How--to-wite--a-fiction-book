import { NextResponse } from 'next/server'

const OPENAI_IMAGES_URL = 'https://api.openai.com/v1/images/generations'
const MAX_PROMPT_LENGTH = 2000

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Image generation is not configured yet (missing OPENAI_API_KEY).' },
      { status: 503 },
    )
  }

  let prompt: unknown
  try {
    const body = await request.json()
    prompt = body?.prompt
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return NextResponse.json({ error: 'A prompt is required.' }, { status: 400 })
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ error: 'Prompt is too long.' }, { status: 400 })
  }

  let upstream: Response
  try {
    upstream = await fetch(OPENAI_IMAGES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        size: '1024x1024',
        n: 1,
      }),
    })
  } catch {
    return NextResponse.json({ error: 'Could not reach the image service.' }, { status: 502 })
  }

  if (!upstream.ok) {
    let message = `Image service returned ${upstream.status}.`
    try {
      const errBody = await upstream.json()
      if (errBody?.error?.message) message = errBody.error.message
    } catch {
      // upstream error body wasn't JSON — keep the generic status message
    }
    return NextResponse.json({ error: message }, { status: upstream.status === 429 ? 429 : 502 })
  }

  const data = await upstream.json()
  const b64 = data?.data?.[0]?.b64_json
  const url = data?.data?.[0]?.url

  if (b64) {
    return NextResponse.json({ image: `data:image/png;base64,${b64}` })
  }
  if (url) {
    return NextResponse.json({ image: url })
  }

  return NextResponse.json({ error: 'Image service returned no image.' }, { status: 502 })
}
