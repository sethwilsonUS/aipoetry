import PoemsList from '@/components/poems-list';

const Poems = () => {
  return (
    <div className='w-full p-4 lg:p-12 bg-white dark:bg-gray-900'>
      <article className='prose prose-gray max-w-3xl mx-auto dark:prose-invert'>
        <h1 className='text-4xl font-bold tracking-tight lg:text-5xl pr-2'>The Poetry Archive</h1>
        <br />
        <PoemsList />
      </article>
    </div>
  );
};

export default Poems;
