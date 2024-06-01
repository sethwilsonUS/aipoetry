import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getRandomTopic } from './topic';
import { getRandomStyle } from './style';

interface IPoetry {
  title: string;
  lines: string[];
  style: string;
}

const getRandomPoem = async (): Promise<IPoetry> => {
  const topic: string = getRandomTopic();
  const style = getRandomStyle();

  const prompt = `Write a poem about ${topic} in ${style.description}.`;

  const result = await generateObject({
    model: openai('gpt-4o'),
    prompt,
    schema: style.format,
  });

  const { title, lines } = result.object;

  const returnValue = {
    title,
    lines,
    style: style.name,
  };

  return returnValue;
}

export default getRandomPoem;