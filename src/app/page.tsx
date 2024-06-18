import { getPoemIds, getStyles } from '@/lib/supabase';
import UserGen from '@/components/usergen';

export default async function Home() {
  const styles = await getStyles();
  const poemIds = await getPoemIds();
  console.log(`style example: ${JSON.stringify(styles[0], null, 2)}`);

  return (
    <div className='w-full p-4 lg:p-12 bg-white dark:bg-gray-900'>
    <article className='prose prose-gray max-w-3xl mx-auto dark:prose-invert'>
      <UserGen styles={styles} poemIds={poemIds} />
    </article>
  </div>

  );
}
