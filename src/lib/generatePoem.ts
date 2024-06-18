'use server';

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';

import { getStyleByName } from './supabase';
import schemify from './schemify';

const generatePoem = async (topicName: string, styleName: string): Promise<any> => {
  const style = await getStyleByName(styleName);

  const schema = schemify(style.number_of_lines);

  const prompt = `Write a poem about ${topicName} in ${style.description}. Also give the poem a title.
                  Make sure the title is also poetic and relevant to the poem.
                  Also, please, no blank lines between stanzas.
  `;

  const model = 'gpt-4o';
  const temperature = 1.3;

  const result = await generateObject({
    model: openai(model),
    prompt,
    schema,
    maxRetries: 3,
    temperature,
  });

  const { title, lines } = result.object;

  const poem = {
    title,
    lines,
    topic: topicName,
    style,
    temperature,
    model,
    prompt,
  };

  return poem;
};

export default generatePoem;