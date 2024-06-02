import { revalidatePath, } from 'next/cache';
import { kv, } from '@vercel/kv';
import getRandomPoem from '@/lib/getRandomPoem';
import { IPoetry, } from '@/types/poetry';

import Poetry from '../components/poetry';
import Countdown from '../components/countdown';

export default async function Home() {
  revalidatePath('/');

  const env = process.env.NODE_ENV;
  const noCache = process.env.NO_CACHE === 'true';

  console.log(`NODE_ENV: ${env}`);

  let poetryRes: IPoetry | null = null;
  let ttl = 0;

  if (noCache) {
    poetryRes = await getRandomPoem();
  } else {
    poetryRes = await kv.get(`${env}NewPoem`);

    if (!poetryRes) {
      const revalidate = parseInt(process.env.REVALIDATE || '3600', 10);
      poetryRes = await getRandomPoem();
      await kv.set(`${env}NewPoem`, poetryRes, { ex: revalidate, });
    }

    ttl = await kv.ttl(`${env}NewPoem`);
  }

  const { title, lines, styleName, styleExplanation, } = poetryRes;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12">
      <div className="flex flex-col z-10 w-full max-w-5xl items-center justify-between lg:flex">
        <Poetry
          title={title}
          lines={lines}
          styleName={styleName}
          styleExplanation={styleExplanation}
          ttl={ttl}
        />
        <Countdown ttl={ttl} />
      </div>
    </main>
  );
}
