'use server';

// import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
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

  const model = 'claude-3-7-sonnet-latest';
  const temperature = 0.9;

  const result = await generateObject({
    model: anthropic(model),
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