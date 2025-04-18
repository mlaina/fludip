import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  const { name, lng_target, lng_source = 'es' } = await request.json()

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'system',
          content: `You are a language-learning assistant. Your role is to reformulate and enrich what the user writes by producing a long, natural, fluent, and correct sentence in the target language: ${lng_target}. Do not translate word for word. Use a natural tone, as if a native speaker were talking casually in a relaxed conversation.`
        },
        { role: 'user', content: name }
      ],
      temperature: 0.9
    })

    const response = chatCompletion.choices[0].message.content

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


