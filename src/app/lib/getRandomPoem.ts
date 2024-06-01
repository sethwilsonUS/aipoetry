import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getRandomTopic } from './topic';
import { getRandomStyle } from './style';
import IPoetry from '@/types/poetry';

const getRandomPoem = async (): Promise<IPoetry> => {
  const topic: string = getRandomTopic();
  const style = getRandomStyle();

  const prompt = `Write a poem about ${topic} in ${style.description}. Also give the poem a title.
                  Make sure the title is also poetic and relevant to the poem.
  `;

  const result = await generateObject({
    model: openai('gpt-4o'),
    prompt,
    schema: style.format,
    maxRetries: 3,
  });

  const { title, lines } = result.object;

  const returnValue = {
    title,
    lines,
    styleName: style.name,
    styleExplanation: style.explanation,
  };


  return returnValue;
}

export default getRandomPoem;