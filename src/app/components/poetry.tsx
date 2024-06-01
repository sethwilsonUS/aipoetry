import { kv } from '@vercel/kv';
import getRandomPoem from '../lib/getRandomPoem';

interface IPoetry {
    title: string;
    lines: string[];
    styleName: string;
    styleExplanation: string;
}

const Poetry = async () => {
  const revalidate = parseInt(process.env.REVALIDATE || '3600', 10);

  let poetryRes: IPoetry | null = await kv.get('newPoem');

  if (!poetryRes) {
    poetryRes = await getRandomPoem();
    await kv.set('newPoem', poetryRes);
    await kv.expire('newPoem', revalidate);
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