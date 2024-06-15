import Poetry from '@/components/poetry';
import { getPoem } from '@/lib/supabase';

const Page: React.FC<{ params: { id: number } }> = async ({ params }) => {
  const poem = await getPoem(params.id);

  if (!poem) {
    return <h1>Not found</h1>;
  }

  // supabase incorrectly types this as an array
  const { name, user_explanation } = poem.style as any;

  return (
    <>
      <Poetry
        title={poem.title}
        lines={poem.text}
        styleName={name}
        styleExplanation={user_explanation}
      />
    </>
  );
};

export default Page;
