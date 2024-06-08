import Link from 'next/link';

export default function Navbar() {
  return (
    <header className='flex h-16 w-full items-center justify-between bg-[#0070f3] px-4 md:px-6 dark:bg-blue-800'>
      <div className='flex items-center gap-2'>
        <InfinityIcon className='h-6 w-6 text-white' />
        <Link href='/' className='text-lg font-bold text-white' prefetch={false}>
          Infinite Poetry
        </Link>
      </div>
      <div className='flex items-center gap-4'>
        <Link
          href='/about'
          className='text-sm font-medium text-white hover:underline hover:underline-offset-4'
          prefetch={true}
        >
          About
        </Link>
        <Link href='https://github.com/sethwilsonUS' target='_blank' prefetch={false}>
          <GithubIcon className='h-6 w-6 text-white' />
          <span className='sr-only'>GitHub</span>
        </Link>
        <Link href='https://www.linkedin.com/in/sethhwilson/' target='_blank' prefetch={false}>
          <LinkedinIcon className='h-6 w-6 text-white' />
          <span className='sr-only'>LinkedIn</span>
        </Link>
        <Link href='https://artsai.substack.com/' target='_blank' prefetch={false}>
          <MailIcon className='h-6 w-6 text-white' />
          <span className='sr-only'>Newsletter</span>
        </Link>
      </div>
    </header>
  )
}

function GithubIcon(props: any) {
  return (
    <svg
      {...props}
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
      <path d='M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4' />
      <path d='M9 18c-4.51 2-5-2-7-2' />
    </svg>
  )
}

function LinkedinIcon(props: any) {
  return (
    <svg
      {...props}
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
      <path d='M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' />
      <rect width='4' height='12' x='2' y='9' />
      <circle cx='4' cy='4' r='2' />
    </svg>
  )
}

function MailIcon(props: any) {
  return (
    <svg
      {...props}
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
      <rect width='20' height='16' x='2' y='4' rx='2' />
      <path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' />
    </svg>
  )
}

function InfinityIcon(props: any) {
  return (
    <svg
      {...props}
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
      <path d='M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z' />
    </svg>
  )
}