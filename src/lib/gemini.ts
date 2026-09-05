// Thin REST wrappers for the Google Gemini API (no SDK — matches how the
// OpenAI image route already hand-rolls its fetch). Used by
// /api/generate-illustration and /api/fiction-helper when GEMINI_API_KEY is
// set, in preference to OPENAI_API_KEY / ANTHROPIC_API_KEY.

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
// If Google retires a model ("no longer available to new users"), its error
// message names the replacement — swap it in here.
const CHAT_MODEL = 'gemini-3.6-flash'
const IMAGE_MODEL = 'gemini-2.5-flash-image'

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY)
}

/** An upstream Gemini failure, carrying an HTTP status to forward to the client. */
export class GeminiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'GeminiError'
    this.status = status
  }
}

async function callGemini(model: string, body: unknown): Promise<unknown> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new GeminiError('GEMINI_API_KEY is not set.', 503)

  let res: Response
  try {
    res = await fetch(`${BASE}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
    })
  } catch {
    throw new GeminiError('Could not reach Google Gemini.', 502)
  }

  if (!res.ok) {
    let message = `Gemini returned ${res.status}.`
    try {
      const err = (await res.json()) as { error?: { message?: string } }
      if (err?.error?.message) message = err.error.message
    } catch {
      // non-JSON error body — keep the generic status message
    }
    throw new GeminiError(message, res.status === 429 ? 429 : 502)
  }

  return res.json()
}

type GeminiPart = { text?: string; inlineData?: { mimeType?: string; data?: string } }
type GeminiResponse = { candidates?: Array<{ content?: { parts?: GeminiPart[] } }> }

/** Returns a `data:` URI for the generated image. */
export async function geminiGenerateImage(prompt: string): Promise<string> {
  const data = (await callGemini(IMAGE_MODEL, {
    contents: [{ parts: [{ text: prompt }] }],
  })) as GeminiResponse

  const parts = data?.candidates?.[0]?.content?.parts ?? []
  const image = parts.find((p) => p.inlineData?.data)?.inlineData
  if (!image?.data) throw new GeminiError('Gemini returned no image.', 502)

  return `data:${image.mimeType ?? 'image/png'};base64,${image.data}`
}

export interface GeminiTurn {
  role: 'user' | 'assistant'
  text: string
}

export async function geminiChat(
  systemPrompt: string,
  history: GeminiTurn[],
  maxOutputTokens: number,
): Promise<string> {
  const data = (await callGemini(CHAT_MODEL, {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    })),
    generationConfig: { maxOutputTokens },
  })) as GeminiResponse

  const text = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text)
    .filter(Boolean)
    .join('')
    .trim()

  if (!text) throw new GeminiError('The AI helper had nothing to say.', 502)
  return text
}
