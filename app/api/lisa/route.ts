import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  const { name, text, lng_target, lng_source = 'es' } = await request.json()

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',               // GPT‑4.1
      messages: [
        {
          role: 'system',
          content: `You are a language tutor helping learners express themselves in ${lng_target}.`
        },
        {
          role: 'user',
          content: `The user's name is ${name}. Today they want to say: "${text}". Generate **one** long natural sentence in ${lng_target}, plus **exactly five** short related sentences to help them learn.`
        }
      ],
      response_format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            long_sentence: { type: 'string' },
            short_sentences: {
              type: 'array',
              items: { type: 'string' },
              minItems: 5,
              maxItems: 5
            }
          },
          required: ['long_sentence', 'short_sentences'],
          additionalProperties: false
        }
      },
      temperature: 0.7
    })

    // Le modèle renvoie le JSON en texte dans `content`
    const raw = completion.choices[0].message.content
    const parsed = JSON.parse(raw)

    return NextResponse.json({
      large: parsed.long_sentence,
      shorts: parsed.short_sentences
    })
  } catch (error: any) {
    console.error('OpenAI error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
