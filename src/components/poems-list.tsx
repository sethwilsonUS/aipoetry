'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function PoemsList() {
  const poems = useQuery(api.poems.list);

  if (poems === undefined) {
    return (
      <div className='space-y-3' aria-label='Loading poems' aria-busy='true'>
        {[...Array(6)].map((_, i) => (
          <div key={i} className='garden-bed p-5 flex items-center justify-between gap-4'>
            <div className='skeleton h-5 w-48 rounded' />
            <div className='skeleton h-4 w-24 rounded' />
          </div>
        ))}
      </div>
    );
  }

  if (poems.length === 0) {
    return (
      <div className='garden-bed p-12 text-center'>
        <p className='text-[var(--text-muted)] text-lg italic' style={{ fontFamily: 'var(--font-display), serif' }}>
          The archive is empty. Be the first to plant a poem.
        </p>
      </div>
    );
  }

  return (
    <ul className='space-y-2 list-none p-0 m-0' role='list'>
      {poems
        .filter((poem) => poem.title)
        .map((poem, i) => (
          <li key={poem.id}>
            <Link
              href={`/poems/${poem.id}`}
              className='garden-bed flex items-center justify-between gap-4 p-4 sm:p-5 no-underline group block transition-colors duration-150'
              prefetch={false}
              style={{
                animationDelay: `${i * 40}ms`,
              }}
            >
              <span
                className='text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors duration-150 truncate'
                style={{ fontFamily: 'var(--font-display), serif' }}
              >
                {poem.title}
              </span>
              <span className='text-xs text-[var(--text-muted)] whitespace-nowrap shrink-0 italic'>
                {poem.styleName}
              </span>
            </Link>
          </li>
        ))}
    </ul>
  );
}
