import { revalidatePath } from 'next/cache';
import { kv } from '@vercel/kv';
import dynamic from 'next/dynamic'
import getRandomPoem from '@/lib/getRandomPoem';
import { IPoetry } from '@/types/poetry';

import Poetry from '../components/poetry';
import Countdown from '../components/countdown';

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
  
  return (
    <>
      <Poetry
        title={title}
        lines={lines}
        styleName={styleName}
        styleExplanation={styleExplanation}
      />
      <Countdown ttl={ttl} />
    </>
  );
}
