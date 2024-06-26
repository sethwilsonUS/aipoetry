import { Button } from '@/components/ui/button';
import { PopoverTrigger, PopoverClose, PopoverContent, Popover } from '@/components/ui/popover';
import { IPoetry } from '@/types/poetry';

const Poetry: React.FC<IPoetry> = (props) => {
  return (
    <div className='w-full p-4 lg:p-12 bg-white dark:bg-gray-900'>
      <article className='prose prose-gray max-w-3xl mx-auto dark:prose-invert'>
        <div className='flex items-center'>
          <h1 className='text-4xl font-bold tracking-tight lg:text-5xl pr-2'>{props.title}</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button className='rounded-full' size='icon' variant='ghost'>
                <InfoIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80 ml-2'>
              <div className='grid gap-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <h4 className='font-medium leading-none'>{props.styleName}</h4>
                    <PopoverClose asChild>
                      <button className='rounded-sm'>
                        <XIcon />
                      </button>
                    </PopoverClose>
                  </div>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {props.styleExplanation}
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <br />
        <div className='space-y-4'>
          {props.lines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </article>
    </div>
  );
};

function InfoIcon(props: any) {
  return (
    <svg
      {...props}
      className='w-4 h-4'
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <circle cx='12' cy='12' r='10' />
      <path d='M12 16v-4' />
      <path d='M12 8h.01' />
    </svg>
  );
}

function XIcon(props: any) {
  return (
    <svg
      {...props}
      className='w-4 h-4'
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M18 6 6 18' />
      <path d='m6 6 12 12' />
    </svg>
  );
}

export default Poetry;