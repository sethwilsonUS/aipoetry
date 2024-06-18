import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { revalidatePath } from 'next/cache';

import { insertTopic, insertStyle } from './supabase';
import schemify from './schemify';

const generatePoem = async (topicName: string, styleName: string): Promise<any> => {
  const topic = await insertTopic(topicName);
  const style = await insertStyle(styleName);

  const schema = schemify(style.lines);

  const prompt = `Write a poem about ${topic} in ${style.description}. Also give the poem a title.
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
    topic,
    style,
    temperature,
    model,
    prompt,
  };

  revalidatePath('/poems');

  const clientPayload = {
    title,
    lines,
    styleName: style.name,
    styleExplanation: style.explanation,
  };

  return poem;
};

export default generatePoem;