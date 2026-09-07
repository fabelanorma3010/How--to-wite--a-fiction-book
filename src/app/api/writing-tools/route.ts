import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { GeminiError, geminiChat, hasGeminiKey } from '../../../lib/gemini'
import { checkAiLimit } from '../../../lib/aiLimits'

const ANTHROPIC_MODEL = 'claude-opus-5'
const MAX_INPUT_CHARS = 50_000
const MAX_TOKENS = 2000

const MODES = {
  summarize: {
    system:
      'You are a summarization assistant. Read the text the user provides and return a brief, faithful summary: one sentence of overview, then 3–7 key points as "- " bullets, then a short "Action items" or "Decisions" list ONLY if the text actually contains any. No preamble like "Here is the summary", no closing remarks — just the summary.',
  },
  critique: {
    system:
      'You are a constructive writing critic. Read the piece the user provides and give focused feedback in this shape: a 1–2 sentence overall impression, then "What works" (2–4 "- " bullets), then "What to improve" (3–5 "- " bullets covering structure, clarity, argument/evidence and style as relevant), then "Suggested next steps" (2–3 concrete actions). Be direct and specific but encouraging. No preamble.',
  },
  structure: {
    system:
      "You are a note-organizing assistant. Take the user's rough notes and reorganize them into a clean, scannable structure without losing information: group related points under short \"## \" headings, use \"- \" bullets, and pull any tasks into a final \"## Action items\" list. Keep wording concise. Output Markdown only — no preamble or commentary.",
  },
  grammar: {
    system:
      "You are a grammar and spelling correction assistant. Read the text the user provides and fix grammar, spelling, punctuation, and awkward phrasing, while preserving the author's voice, meaning, tone, and paragraph/line breaks as closely as possible — do not rewrite for style, shorten it, or change what it says. Output ONLY the corrected text, with no preamble, no explanation of what changed, and no commentary.",
  },
} as const

type Mode = keyof typeof MODES

function isMode(value: unknown): value is Mode {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(MODES, value)
}

export async function POST(request: Request) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!hasGeminiKey() && !anthropicKey) {
    return NextResponse.json(
      { error: 'Writing tools are not configured yet (missing GEMINI_API_KEY or ANTHROPIC_API_KEY).' },
      { status: 503 },
    )
  }

  let text: unknown
  let mode: unknown
  try {
    const body = await request.json()
    text = body?.text
    mode = body?.mode
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!isMode(mode)) {
    return NextResponse.json({ error: 'Unknown tool.' }, { status: 400 })
  }
  if (typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ error: 'Paste or upload some text first.' }, { status: 400 })
  }
  if (text.length > MAX_INPUT_CHARS) {
    return NextResponse.json(
      { error: `That's a lot of text — keep it under ${MAX_INPUT_CHARS.toLocaleString()} characters.` },
      { status: 400 },
    )
  }

  const limited = await checkAiLimit(request, 'tools')
  if (limited) return NextResponse.json({ error: limited.error }, { status: limited.status })

  const system = MODES[mode].system
  const content = text.trim()

  // Prefer Gemini; fall through to Anthropic if Gemini fails and its key is set.
  if (hasGeminiKey()) {
    try {
      const result = await geminiChat(system, [{ role: 'user', text: content }], MAX_TOKENS)
      return NextResponse.json({ result })
    } catch (err) {
      if (!anthropicKey) {
        const status = err instanceof GeminiError ? err.status : 502
        const message = err instanceof Error ? err.message : 'Could not process that text.'
        return NextResponse.json({ error: message }, { status })
      }
      // else: fall through to Anthropic
    }
  }

  if (!anthropicKey) {
    return NextResponse.json({ error: 'Writing tools are not configured.' }, { status: 503 })
  }

  try {
    const client = new Anthropic({ apiKey: anthropicKey })
    const response = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages: [{ role: 'user', content }],
    })
    const block = response.content.find((b) => b.type === 'text')
    if (!block || block.type !== 'text') {
      return NextResponse.json({ error: 'The AI had nothing to say.' }, { status: 502 })
    }
    return NextResponse.json({ result: block.text })
  } catch (err) {
    const message =
      err instanceof Anthropic.APIError ? `AI error: ${err.message}` : 'Something went wrong.'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
