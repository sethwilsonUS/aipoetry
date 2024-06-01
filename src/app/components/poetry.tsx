import { revalidatePath } from 'next/cache';
import { kv } from '@vercel/kv';
import getRandomPoem from '../lib/getRandomPoem';
import IPoetry from '@/types/poetry';

const Poetry = async () => {
  revalidatePath('/');

  const env = process.env.NODE_ENV;
  const noCache = process.env.NO_CACHE === 'true';

  console.log(`NODE_ENV: ${env}`);

  let poetryRes: IPoetry | null = null;

  if (noCache) {
    poetryRes = await getRandomPoem();
  } else {
    poetryRes = await kv.get(`${env}NewPoem`);

    if (!poetryRes) {
      const revalidate = parseInt(process.env.REVALIDATE || '3600', 10);
      poetryRes = await getRandomPoem();
      await kv.set(`${env}NewPoem`, poetryRes, { ex: revalidate });
    }
  }
  
  const { title, lines, styleName, styleExplanation } = poetryRes;

  return (
    <div>
      <h2>{title}</h2>
      <br />
      <div>
        {lines.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <br />
      <p>Style: {styleName}</p>
      <p>{styleExplanation}</p>
    </div>
  );
}

export default Poetry;