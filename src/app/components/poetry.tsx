interface IPoetry {
    text: string;
}

const Poetry = async () => {

  const poetryRes = await fetch('http://localhost:3000/api/poetry', {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic: 'slice', style: 'in the style of a Pindaric ode' } ),
  });
  
  const res = await poetryRes.json();
  const  { text }: IPoetry = res;

  return (
    <div>
      <h1>Poetry</h1>
      <p>{text}</p>
    </div>
  );
}

export default Poetry;