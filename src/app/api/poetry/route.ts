import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getRandomTopic } from '../..//lib/topic';
import { getRandomStyle } from '../..//lib/style';

export const dynamic = 'force';

export async function GET() {
  const topic: string = getRandomTopic();
  const style = getRandomStyle();

  const prompt = `Write a poem about ${topic} in ${style.description}.`;

  const result = await generateObject({
    model: openai('gpt-4o'),
    prompt,
    schema: z.object({
      title: z.string(),
      lines: z.array(z.string()).length(5),
    })
  });

  const { title, lines } = result.object;

  const returnValue = {
    title,
    lines,
    style: style.name,
  };

  return NextResponse.json(returnValue);
}
