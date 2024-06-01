import kv from '@vercel/kv';
import getRandomPoem from '../lib/getRandomPoem';

interface IPoetry {
    title: string;
    lines: string[];
    style: string;
}

const Poetry = async () => {
  const revalidate = parseInt(process.env.REVALIDATE || '0', 10);

  const poetryRes = await kv.get('newPoem');

  if (!poetryRes) {
    await kv.set('newPoem', getRandomPoem());
    await kv.expire('newPoem', revalidate);
  }
  
  const res = await poetryRes.json();
  const { title, lines, style }: IPoetry = res;

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