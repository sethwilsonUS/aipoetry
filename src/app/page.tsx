'use client';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { STYLES } from '../../convex/stylesConfig';
import UserGen from '@/components/usergen';

export default function Home() {
  const poemIds = useQuery(api.poems.listIds);

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
          {poemIds ? (
            <UserGen styles={STYLES} poemIds={poemIds} />
          ) : (
            <div className='garden-bed p-8 max-w-lg mx-auto space-y-5'>
              <div className='text-center space-y-3 mb-8'>
                <div className='skeleton h-9 w-48 mx-auto rounded-lg' />
                <div className='skeleton h-4 w-64 mx-auto rounded' />
              </div>
              <div className='skeleton h-12 w-full rounded-xl' />
              <div className='skeleton h-12 w-full rounded-xl' />
              <div className='skeleton h-12 w-full rounded-xl' />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
