import { headers } from 'next/headers';
import HomeClient from '@/components/HomeClient';

export default async function Home() {
  const headersList = await headers();
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'anonymous';

  return (
    <div className='min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-12'>
      {/* Pattern overlay */}
      <div className='fixed inset-0 pattern-leaves pointer-events-none opacity-40' aria-hidden='true' />

      <div className='relative z-10 w-full max-w-2xl'>
        {/* Hero tagline */}
        <div className='text-center mb-10 animate-fade-in-up'>
          <p
            className='text-lg sm:text-xl text-[var(--text-secondary)] italic leading-relaxed'
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            &ldquo;Can a machine write a poem worth reading?&rdquo;
          </p>
        </div>

        {/* Form */}
        <div className='animate-fade-in-up-d1'>
          <HomeClient identifier={ip} />
        </div>
      </div>
    </div>
  );
}
