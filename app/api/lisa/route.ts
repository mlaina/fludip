import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  const { name, text, lng_target, lng_source = 'es' } = await request.json()

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      input: [
        {
          role: 'system',
          content: `You are a language tutor helping learners express themselves in ${lng_target}.`
        },
        {
          role: 'user',
          content: `The user's name is ${name}. Today, they want to talk about: "${text}". Based on this, generate a long, well-formed sentence in ${lng_target}, and 5 short related sentences to help them learn more expressions.`
        }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'learning_output',
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
        }
      }
    })

    const output = response.output


return NextResponse.json({
  large: output.long_sentence,
  shorts: output.short_sentences
})

  } catch (error: any) {
    console.error('OpenAI error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}