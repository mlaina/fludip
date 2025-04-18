import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  const { name, text, lng_target = 'en', lng_source = 'es' } = await request.json()

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: `You are a language tutor. You never do literal translation.
Rewrite and enrich the users ideas in natural, idiomatic ${lng_target},
using new vocabulary and grammar structures.`
        },
        {
          role: 'user',
          content: `The user's name is ${name}. They wrote: "${text}".  Write ONE long, fluent sentence in ${lng_target} that keeps the meaning
but is **not** a word‑for‑word translation. plus EXACTLY five short related sentences. Return ONLY valid JSON with keys "long_sentence" and "short_sentences".`
        }
      ],
      response_format: { type: 'json_object' }, // <-- la bonne option
      temperature: 0.7
    })

    const parsed = JSON.parse(completion.choices[0].message.content)

    return NextResponse.json({
      large: parsed.long_sentence,
      shorts: parsed.short_sentences
    })
  } catch (error: any) {
    console.error('OpenAI error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

