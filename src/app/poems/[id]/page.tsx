'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import Poetry from '@/components/poetry';
import Link from 'next/link';
import Image from 'next/image';

export default function PoemPage({ params }: { params: { id: string } }) {
  const poem = useQuery(api.poems.getById, {
    id: params.id as Id<'poems'>,
  });

  // Loading — initial fetch
  if (poem === undefined) {
    return (
      <div className='max-w-2xl mx-auto px-6 py-16' aria-busy='true' aria-label='Loading poem'>
        <div className='space-y-4'>
          <div className='skeleton h-12 w-3/4 rounded-lg' />
          <div className='skeleton h-4 w-24 rounded' />
          <div className='mt-8 space-y-2'>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className='skeleton h-5 rounded'
                style={{ width: `${60 + Math.random() * 30}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (poem === null) {
    return (
      <div className='max-w-2xl mx-auto px-6 py-16 text-center'>
        <p
          className='text-2xl text-[var(--text-muted)] italic mb-6'
          style={{ fontFamily: 'var(--font-display), serif' }}
        >
          This poem has wandered off.
        </p>
        <Link href='/' className='text-[var(--accent)] hover:underline text-sm'>
          ← Generate a new one
        </Link>
      </div>
    );
  }

  // Error state
  if (poem.status === 'error') {
    return (
      <div className='max-w-2xl mx-auto px-6 py-16 text-center'>
        <p
          className='text-2xl text-[var(--text-muted)] italic mb-3'
          style={{ fontFamily: 'var(--font-display), serif' }}
        >
          The muse went silent.
        </p>
        <p className='text-[var(--text-secondary)] text-sm mb-6'>
          Something went wrong during generation.
        </p>
        <Link href='/' className='text-[var(--accent)] hover:underline text-sm'>
          ← Try again
        </Link>
      </div>
    );
  }

  // Generating — stream lines in as they arrive
  if (poem.status === 'generating') {
    return (
      <article
        className='max-w-2xl mx-auto px-6 py-12 sm:py-16'
        aria-label='Poem being generated'
      >
        {/* Single live announcement — avoids reading every streaming line aloud */}
        <p role='status' className='sr-only'>
          Writing your poem, please wait…
        </p>
        <header className='mb-10'>
          <h1
            className='text-4xl sm:text-5xl font-bold leading-tight text-[var(--text-primary)] mb-2'
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            {poem.title || (
              <span className='text-[var(--text-muted)] italic'>Composing…</span>
            )}
          </h1>
          {poem.title && (
            <p
              className='text-sm text-[var(--text-muted)] italic flex items-center gap-2'
              style={{ fontFamily: 'var(--font-display), serif' }}
            >
              <span
                className='inline-block w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse'
                aria-hidden='true'
              />
              writing…
            </p>
          )}
        </header>

        <hr className='garden-divider' />

        <div className='space-y-1.5' role='region' aria-label='Poem lines being written'>
          {poem.lines.length > 0 ? (
            poem.lines.map((line: string, index: number) => (
              <p
                key={index}
                className='text-lg sm:text-xl leading-relaxed text-[var(--text-primary)] poem-line-appear'
                style={{
                  fontFamily: 'var(--font-display), serif',
                  animationDelay: `${index * 60}ms`,
                }}
              >
                {line || '\u00A0'}
              </p>
            ))
          ) : (
            <p
              className='text-[var(--text-muted)] italic text-lg'
              style={{ fontFamily: 'var(--font-display), serif' }}
            >
              The muse is thinking…
            </p>
          )}
        </div>
      </article>
    );
  }

  // Complete
  return (
    <>
      <Poetry
        title={poem.title}
        lines={poem.lines}
        styleName={poem.styleName}
        styleExplanation={poem.styleExplanation}
      />
      <PoemImage
        imageStatus={poem.imageStatus}
        imageUrl={poem.imageUrl ?? null}
        poemTitle={poem.title}
        imageDescription={poem.imageDescription}
      />
    </>
  );
}

function PoemImage({
  imageStatus,
  imageUrl,
  poemTitle,
  imageDescription,
}: {
  imageStatus?: string;
  imageUrl: string | null;
  poemTitle: string;
  imageDescription?: string;
}) {
  if (!imageStatus || imageStatus === 'error') return null;

  if (imageStatus === 'pending' || imageStatus === 'generating') {
    return (
      <div className='max-w-2xl mx-auto px-6 pb-16' aria-busy='true' aria-label='Generating illustration'>
        <hr className='garden-divider mb-10' />
        <div className='space-y-3'>
          <div className='skeleton h-4 w-32 rounded' />
          <div className='skeleton w-full rounded-xl' style={{ aspectRatio: '4/3' }} />
        </div>
        <p className='text-xs text-[var(--text-muted)] mt-3 italic text-center'>
          Painting your illustration…
        </p>
      </div>
    );
  }

  if (imageStatus === 'complete' && imageUrl) {
    const altText = imageDescription ?? `Illustration for "${poemTitle}"`;
    return (
      <div className='max-w-2xl mx-auto px-6 pb-16'>
        <hr className='garden-divider mb-10' />
        <figure>
          <div className='relative w-full overflow-hidden rounded-xl border border-[var(--border-color)]'>
            <Image
              src={imageUrl}
              alt={altText}
              width={1024}
              height={768}
              className='w-full h-auto'
              unoptimized
            />
          </div>
          {imageDescription && (
            <figcaption className='mt-3 text-xs text-[var(--text-muted)] italic text-center leading-relaxed'>
              {imageDescription}
            </figcaption>
          )}
        </figure>
      </div>
    );
  }

  return null;
}
