import { kv } from '@vercel/kv';
import getRandomPoem from '../lib/getRandomPoem';

interface IPoetry {
    title: string;
    lines: string[];
    style: string;
}

const Poetry = async () => {
  const revalidate = parseInt(process.env.REVALIDATE || '3600', 10);

  let poetryRes: IPoetry | null = await kv.get('newPoem');

  if (!poetryRes) {
    poetryRes = await getRandomPoem();
    await kv.set('newPoem', poetryRes, { ex: revalidate });
  }
  
  const { title, lines, style } = poetryRes;

  return (
    <div>
      <h1>Poetry</h1>
      <p>Style: {style}</p>
      <h2>{title}</h2>
      <div>
        {lines.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  );
}

export default Poetry;