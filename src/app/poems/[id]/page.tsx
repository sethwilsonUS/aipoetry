'use client';

import { useCallback, useRef, useState } from 'react';
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
      <ShareLink imageStatus={poem.imageStatus} />
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
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openLightbox = () => dialogRef.current?.showModal();
  const closeLightbox = () => dialogRef.current?.close();

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) closeLightbox();
  };

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
          {/* Thumbnail — clicking opens the lightbox */}
          <button
            type='button'
            onClick={openLightbox}
            className='relative w-full overflow-hidden rounded-xl border border-[var(--border-color)] block cursor-zoom-in group'
            aria-label={`View full-size illustration for "${poemTitle}"`}
          >
            <Image
              src={imageUrl}
              alt={altText}
              width={1024}
              height={768}
              className='w-full h-auto transition-opacity duration-200 group-hover:opacity-90'
              unoptimized
            />
            {/* Expand hint on hover */}
            <span
              className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200'
              aria-hidden='true'
            >
              <span className='flex items-center justify-center w-10 h-10 rounded-full bg-black/50'>
                <svg
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='white'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <polyline points='15 3 21 3 21 9' />
                  <polyline points='9 21 3 21 3 15' />
                  <line x1='21' y1='3' x2='14' y2='10' />
                  <line x1='3' y1='21' x2='10' y2='14' />
                </svg>
              </span>
            </span>
          </button>

          {imageDescription && (
            <figcaption className='mt-3 text-xs text-[var(--text-muted)] italic text-center leading-relaxed'>
              {imageDescription}
            </figcaption>
          )}
        </figure>

        {/* Lightbox dialog — native <dialog> for accessibility */}
        <dialog
          ref={dialogRef}
          onClick={handleBackdropClick}
          aria-label={`Full-size illustration for "${poemTitle}"`}
          className='lightbox-dialog'
        >
          <div className='relative'>
            {/* Close button */}
            <button
              type='button'
              onClick={closeLightbox}
              aria-label='Close lightbox'
              className='absolute top-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors duration-150 cursor-pointer'
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden='true'
              >
                <path d='M18 6 6 18M6 6l12 12' />
              </svg>
            </button>

            {/* Full-size image */}
            <Image
              src={imageUrl}
              alt={altText}
              width={1024}
              height={768}
              className='w-full h-auto block rounded-t-[20px]'
              unoptimized
            />

            {/* Caption */}
            {imageDescription && (
              <p className='px-5 py-3 text-xs text-[var(--text-muted)] italic text-center leading-relaxed border-t border-[var(--border-color)]'>
                {imageDescription}
              </p>
            )}
          </div>
        </dialog>
      </div>
    );
  }

  return null;
}

function ShareLink({ imageStatus }: { imageStatus?: string }) {
  const [copied, setCopied] = useState(false);
  const imageReady =
    !imageStatus || imageStatus === 'complete' || imageStatus === 'error';

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return (
    <div className='max-w-2xl mx-auto px-6 pb-16'>
      <div className='flex flex-col items-center gap-2'>
        <button
          type='button'
          onClick={copy}
          className='inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-all duration-200'
          style={{
            fontFamily: 'var(--font-body), system-ui, sans-serif',
            color: copied
              ? 'var(--accent)'
              : 'var(--text-secondary)',
            borderColor: copied
              ? 'var(--accent-border)'
              : 'var(--border-color)',
            backgroundColor: copied
              ? 'var(--accent-bg)'
              : 'transparent',
          }}
          aria-label='Copy link to this poem'
        >
          {copied ? (
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
              <polyline points='20 6 9 17 4 12' />
            </svg>
          ) : (
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
              <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
              <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
            </svg>
          )}
          {copied ? 'Copied!' : 'Copy link'}
        </button>

        {!imageReady && !copied && (
          <p className='text-xs text-[var(--text-muted)] italic animate-pulse'>
            Illustration still painting — wait for the best link preview
          </p>
        )}
      </div>
    </div>
  );
}
