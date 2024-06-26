import { Skeleton } from '../components/ui/skeleton';

const Loading = () => {
  return (
    <>
      <div className='w-full p-4 lg:p-12 bg-white dark:bg-gray-900'>
        <article className='prose prose-gray max-w-3xl mx-auto dark:prose-invert'>
          <div>
            <Skeleton className='animate-pulse duration-700 h-12 w-[270px] lg:w-[720px] mb-2' />
            <div className='space-y-4 pt-6'>
              <Skeleton className='animate-pulse duration-700 h-4 w-[250px]' />
              <Skeleton className='animate-pulse duration-700 h-4 w-[180px]' />
              <Skeleton className='animate-pulse duration-700 h-4 w-[210px]' />
              <Skeleton className='animate-pulse duration-700 h-4 w-[200px]' />
            </div>
          </div>
        </article>
      </div>
      <div className='w-full flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-gray-900 dark:bg-gray-800 dark:text-gray-50'>
        <span>Generating your next poem . . .</span>
      </div>
    </>
  );
};

export default Loading;