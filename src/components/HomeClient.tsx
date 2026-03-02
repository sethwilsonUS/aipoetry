'use client';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { STYLES } from '../../convex/stylesConfig';
import UserGen from '@/components/usergen';

interface HomeClientProps {
  identifier: string;
}

export default function HomeClient({ identifier }: HomeClientProps) {
  const poemIds = useQuery(api.poems.listIds);

  if (!poemIds) {
    return (
      <div className='garden-bed p-8 max-w-lg mx-auto space-y-5'>
        <div className='text-center space-y-3 mb-8'>
          <div className='skeleton h-9 w-48 mx-auto rounded-lg' />
          <div className='skeleton h-4 w-64 mx-auto rounded' />
        </div>
        <div className='skeleton h-12 w-full rounded-xl' />
        <div className='skeleton h-12 w-full rounded-xl' />
        <div className='skeleton h-12 w-full rounded-xl' />
      </div>
    );
  }

  return <UserGen styles={STYLES} poemIds={poemIds} identifier={identifier} />;
}
