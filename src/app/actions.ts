'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import generatePoem from '@/lib/generatePoem';
import { insertPoem } from '@/lib/supabase';
import kv from '@vercel/kv';
import { headers } from 'next/headers';
import { Ratelimit } from '@upstash/ratelimit';

const generateUserPoem = async (input: any) => {
  const rateLimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.fixedWindow(5, '3600s'),
  });

  const ip = headers().get('x-forwarded-for');
  const { success } = await rateLimit.limit(
    ip ?? 'anonymous_ip'
  );

  if (!success) {
    return { error: 'You may generate a maximum of five poems every hour. If you\'re feeling plucky, you can grab a random poem (or three) while you wait!' };
  }

  const { topic, style } = input;

  const poem = await generatePoem(topic, style);

  const id = await insertPoem(poem);

  revalidatePath('/poems');

  redirect(`/poems/${id}`);
};

export default generateUserPoem;
