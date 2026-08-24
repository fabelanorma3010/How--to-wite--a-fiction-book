import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { bookTypes, type BookTypeId } from '../../../data/bookTypes'

const MODEL = 'claude-opus-5'
const MAX_TOKENS = 400
const MAX_MESSAGE_LENGTH = 1000
const MAX_HISTORY = 20

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    (v.role === 'user' || v.role === 'assistant') &&
    typeof v.text === 'string' &&
    v.text.trim().length > 0 &&
    v.text.length <= MAX_MESSAGE_LENGTH
  )
}

function buildSystemPrompt(genreName: string): string {
  return [
    `You are "Fiction Helper," a friendly in-app creative assistant on Storyburst, a site that helps people write and illustrate ${genreName}s.`,
    'You help brainstorm villains, heroes, plot twists, titles, dialogue, illustration ideas, action beats, pacing, and self-publishing questions (KDP, ISBNs, formats, marketing).',
    'Keep replies short and punchy — one to four sentences, sized for a chat bubble, never an essay. Use at most one or two emoji, and only when they fit naturally.',
    'Stay in character as a creative writing and illustration helper. If asked something wildly off-topic, gently steer the conversation back to their book.',
    `Tailor your ideas to the ${genreName} format specifically whenever it's relevant.`,
  ].join(' ')
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI helper is not configured yet (missing ANTHROPIC_API_KEY).' }, { status: 503 })
  }

  let messages: unknown
  let genre: unknown
  try {
    const body = await request.json()
    messages = body?.messages
    genre = body?.genre
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!Array.isArray(messages) || messages.length === 0 || !messages.every(isChatMessage)) {
    return NextResponse.json({ error: 'A valid message history is required.' }, { status: 400 })
  }

  const history = (messages as ChatMessage[]).slice(-MAX_HISTORY)
  if (history[history.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'The last message must be from the user.' }, { status: 400 })
  }

  const activeGenre = bookTypes.find((b) => b.id === genre)
  const genreId: BookTypeId = activeGenre?.id ?? bookTypes[0].id
  const genreName = activeGenre?.name ?? bookTypes[0].name

  try {
    const client = new Anthropic({ apiKey })
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: buildSystemPrompt(genreName),
      messages: history.map((m) => ({ role: m.role, content: m.text })),
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'The AI helper had nothing to say.' }, { status: 502 })
    }

    return NextResponse.json({ reply: textBlock.text, genre: genreId })
  } catch (err) {
    const message =
      err instanceof Anthropic.APIError
        ? `AI helper error: ${err.message}`
        : 'Something went wrong talking to the AI helper.'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
