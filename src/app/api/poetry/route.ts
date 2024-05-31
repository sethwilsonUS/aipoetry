import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export const dynamic = 'force';

export async function POST(req: Request) {
  const { topic, style } = await req.json();

  const prompt = `Write a poem about ${topic} in ${style}.`;

  const result = await generateText({
    model: openai('gpt-4o'),
    prompt,
  });

  return NextResponse.json({text: result.text, newPoemIn: 3600});
}
