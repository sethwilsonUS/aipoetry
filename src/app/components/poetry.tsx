interface IPoetry {
    title: string;
    lines: string[];
    style: string;
}

const Poetry = async () => {
  const revalidate = parseInt(process.env.REVALIDATE || '0', 10);

  const poetryRes = await fetch('http://localhost:3000/api/poetry', {
    next: {
      revalidate
    }
  });
  
  const res = await poetryRes.json();
  const  { title, lines, style }: IPoetry = res;

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