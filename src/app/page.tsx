import { revalidatePath } from 'next/cache';
import { kv } from '@vercel/kv';
import dynamic from 'next/dynamic'
import getRandomPoem from '@/lib/getRandomPoem';
import { IPoetry } from '@/types/poetry';

import { getPoems } from '@/lib/supabase';

import Poetry from '../components/poetry';
import Countdown from '../components/countdown';

// const Countdown = dynamic(() => import('../components/countdown'), { ssr: false});

export default async function Home() {
  revalidatePath('/');

  const envType = process.env.ENV_TYPE || 'dev';
  const noCache = process.env.NO_CACHE === 'true';

  let poetryRes: IPoetry | null = null;
  let ttl = 0;

  if (noCache) {
    poetryRes = await getRandomPoem();
  } else {
    poetryRes = await kv.get(`${envType}NewPoem`);

    if (!poetryRes) {
      const revalidate = parseInt(process.env.REVALIDATE || '3600', 10);
      poetryRes = await getRandomPoem();
      await kv.set(`${envType}NewPoem`, poetryRes, { ex: revalidate });
    }

    ttl = await kv.ttl(`${envType}NewPoem`);
  }

  const { title, lines, styleName, styleExplanation } = poetryRes;

  const poems = await getPoems();
  console.log(JSON.stringify(poems, null, 2));

  return (
    <main className="flex flex-col items-center justify-between p-12">
      <div className="flex flex-col z-10 w-full max-w-4xl justify-between lg:flex">
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
