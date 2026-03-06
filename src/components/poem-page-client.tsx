'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { STYLES } from '../../convex/stylesConfig';
import { IMAGE_STYLES } from '../../convex/imageStyles';
import Poetry from '@/components/poetry';
import PoemFormFields from '@/components/poem-form-fields';
import Link from 'next/link';
import Image from 'next/image';

interface PoemPageClientProps {
  poemId: string;
  identifier: string;
}

export default function PoemPageClient({ poemId, identifier }: PoemPageClientProps) {
  const poem = useQuery(api.poems.getById, {
    id: poemId as Id<'poems'>,
  });

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

  if (poem.status === 'generating') {
    return (
      <article
        className='max-w-2xl mx-auto px-6 py-12 sm:py-16'
        aria-label='Poem being generated'
      >
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

  const isPrivate = poem.isPublic !== true;

  return (
    <>
      <Poetry
        title={poem.title}
        lines={poem.lines}
        styleName={poem.styleName}
        styleExplanation={poem.styleExplanation}
      >
        {isPrivate && (
          <PoemActions
            poemId={poemId}
            identifier={identifier}
            topicName={poem.topicName}
            styleName={poem.styleName}
            imageStatus={poem.imageStatus}
          />
        )}
      </Poetry>

      <PoemImage
        imageStatus={poem.imageStatus}
        imageUrl={poem.imageUrl ?? null}
        poemTitle={poem.title}
        imageDescription={poem.imageDescription}
      />

      {isPrivate && poem.imageStatus !== 'generating' && (
        <ImageActions
          poemId={poemId}
          identifier={identifier}
          artStyle={poem.artStyle}
          imageStatus={poem.imageStatus}
        />
      )}

      {isPrivate && (
        <PublishAction poemId={poemId} imageStatus={poem.imageStatus} />
      )}

      <ShareLink imageStatus={poem.imageStatus} />
    </>
  );
}

function PoemActions({
  poemId,
  identifier,
  topicName,
  styleName,
  imageStatus,
}: {
  poemId: string;
  identifier: string;
  topicName: string;
  styleName: string;
  imageStatus?: string;
}) {
  const regeneratePoem = useMutation(api.initPoem.regeneratePoem);
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState(topicName);
  const [style, setStyle] = useState(styleName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const errorId = useId();

  const handleRegenerate = async () => {
    setError('');
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    if (!style) {
      setError('Please select a poetic form.');
      return;
    }

    setIsSubmitting(true);
    try {
      const topicChanged = topic.trim() !== topicName ? topic.trim() : undefined;
      const styleChanged = style !== styleName ? style : undefined;

      const result = await regeneratePoem({
        poemId: poemId as Id<'poems'>,
        identifier,
        topic: topicChanged,
        styleName: styleChanged,
      });

      if (!result.success) {
        setError(result.error || 'Failed to regenerate poem.');
        setIsSubmitting(false);
        return;
      }

      setIsOpen(false);
    } catch {
      setError('An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || imageStatus === 'generating';

  const dismiss = () => { setIsOpen(false); setError(''); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isSubmitting) {
      e.preventDefault();
      dismiss();
    }
  };

  return (
    <div className='mt-8 pt-6' style={{ borderTop: '1px dashed var(--border-color)' }}>
      {!isOpen ? (
        <button
          type='button'
          onClick={() => setIsOpen(true)}
          disabled={isDisabled}
          className='inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-150'
          aria-label='Regenerate this poem with new options'
        >
          <RefreshIcon className='w-3.5 h-3.5' />
          <span
            className='italic'
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            Not quite right? Regenerate
          </span>
        </button>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); handleRegenerate(); }}
          noValidate
          className='garden-bed p-5 space-y-4'
          role='region'
          aria-label='Regenerate poem options'
          aria-describedby={error ? errorId : undefined}
          onKeyDown={handleKeyDown}
        >
          <div className='flex items-center justify-between'>
            <h2
              className='text-sm font-semibold text-[var(--text-primary)]'
              style={{ fontFamily: 'var(--font-display), serif' }}
            >
              Regenerate Poem
            </h2>
            <button
              type='button'
              onClick={dismiss}
              className='inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150'
              aria-label='Cancel regeneration'
            >
              <svg className='w-3.5 h-3.5' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                <path d='M18 6 6 18M6 6l12 12' />
              </svg>
              Cancel
            </button>
          </div>

          <p className='sr-only'>Press Escape to cancel.</p>

          <PoemFormFields
            topic={topic}
            onTopicChange={setTopic}
            styleName={style}
            onStyleNameChange={setStyle}
            styles={STYLES}
            disabled={isSubmitting}
            topicInvalid={!!error && !topic.trim()}
            styleInvalid={!!error && !style}
            autoFocusTopic
          />

          {error && (
            <div id={errorId} role='alert' aria-live='assertive' className='alert-error'>
              <span className='text-sm'>{error}</span>
            </div>
          )}

          <button
            type='submit'
            disabled={isSubmitting}
            className='btn-primary'
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <SpinnerIcon className='w-4 h-4 animate-spin' />
                Regenerating…
              </>
            ) : (
              <>
                <RefreshIcon className='w-4 h-4' />
                Regenerate
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

function ImageActions({
  poemId,
  identifier,
  artStyle,
  imageStatus,
}: {
  poemId: string;
  identifier: string;
  artStyle?: string;
  imageStatus?: string;
}) {
  const requestImage = useMutation(api.requestImage.requestImageGeneration);
  const [selectedStyle, setSelectedStyle] = useState(artStyle || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const artStyleId = useId();

  const hasImage = imageStatus === 'complete';
  const hasError = imageStatus === 'error';

  const handleGenerate = async () => {
    setError('');
    if (!selectedStyle || selectedStyle === 'none') {
      setError('Please select an illustration style.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestImage({
        poemId: poemId as Id<'poems'>,
        artStyle: selectedStyle,
        identifier,
      });

      if (!result.success) {
        setError(result.error || 'Failed to generate image.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageStyles = IMAGE_STYLES.filter((s) => s.name !== 'none');
  const isRegenerate = hasImage || hasError;

  return (
    <div className='max-w-2xl mx-auto px-6 pb-8'>
      <div className='garden-bed p-5 sm:p-6 space-y-5'>
        <div>
          <h2
            className='text-base font-semibold text-[var(--text-primary)] mb-1'
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            {isRegenerate ? 'Try a different illustration' : 'Add an illustration'}
          </h2>
          <p className='text-xs text-[var(--text-muted)] leading-relaxed'>
            {isRegenerate
              ? 'Choose a new style and regenerate the illustration for this poem.'
              : 'Choose an art style to generate an illustration inspired by this poem.'}
          </p>
        </div>

        <div className='space-y-2'>
          <label
            htmlFor={artStyleId}
            className='block text-sm font-semibold text-[var(--text-primary)]'
          >
            Illustration Style
          </label>
          <select
            id={artStyleId}
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            disabled={isSubmitting}
            className='input-field select-field'
          >
            <option value='' disabled>
              Select a style…
            </option>
            {imageStyles.map((s) => (
              <option key={s.name} value={s.name}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className='alert-image-cost' role='note'>
          <svg
            className='w-4 h-4 shrink-0 mt-0.5'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
          >
            <path d='M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z' />
            <path d='M12 8v4M12 16h.01' />
          </svg>
          <span>
            Image generation is significantly more expensive than poem generation. Please use it
            sparingly — this project is self-funded for research purposes.
          </span>
        </div>

        {error && (
          <div role='alert' aria-live='assertive' className='alert-error'>
            <span className='text-sm'>{error}</span>
          </div>
        )}

        <button
          type='button'
          onClick={handleGenerate}
          disabled={isSubmitting || !selectedStyle}
          className='btn-primary'
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <SpinnerIcon className='w-4 h-4 animate-spin' />
              Generating…
            </>
          ) : (
            <>
              <ImageIcon className='w-4 h-4' />
              {isRegenerate ? 'Regenerate Illustration' : 'Generate Illustration'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function PublishAction({
  poemId,
  imageStatus,
}: {
  poemId: string;
  imageStatus?: string;
}) {
  const publishPoem = useMutation(api.poems.publishPoem);
  const [confirming, setConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isDisabled = isSubmitting || imageStatus === 'generating';

  const handlePublish = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const result = await publishPoem({
        poemId: poemId as Id<'poems'>,
      });
      if (!result.success) {
        setError(result.error || 'Failed to publish.');
        setIsSubmitting(false);
      }
    } catch {
      setError('An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className='max-w-2xl mx-auto px-6 pb-8'>
      {!confirming ? (
        <div className='flex justify-center'>
          <button
            type='button'
            onClick={() => setConfirming(true)}
            disabled={isDisabled}
            className='inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl border transition-all duration-200'
            style={{
              color: 'var(--text-secondary)',
              borderColor: 'var(--border-color)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-border)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <GlobeIcon className='w-4 h-4' />
            Publish to Archive
          </button>
        </div>
      ) : (
        <div
          className='garden-bed p-5 sm:p-6 space-y-4'
          role='alertdialog'
          aria-label='Confirm publish to archive'
        >
          <div className='space-y-2'>
            <h2
              className='text-base font-semibold text-[var(--text-primary)]'
              style={{ fontFamily: 'var(--font-display), serif' }}
            >
              Publish to the public archive?
            </h2>
            <p className='text-sm text-[var(--text-secondary)] leading-relaxed'>
              This action <strong className='text-[var(--text-primary)]'>cannot be undone</strong>.
              Once published, the poem and illustration can no longer be regenerated.
              Your poem will be visible to anyone browsing the archive.
            </p>
          </div>

          {error && (
            <div role='alert' aria-live='assertive' className='alert-error'>
              <span className='text-sm'>{error}</span>
            </div>
          )}

          <div className='flex gap-3'>
            <button
              type='button'
              onClick={handlePublish}
              disabled={isSubmitting}
              className='btn-primary flex-1'
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <SpinnerIcon className='w-4 h-4 animate-spin' />
                  Publishing…
                </>
              ) : (
                <>
                  <GlobeIcon className='w-4 h-4' />
                  Yes, publish
                </>
              )}
            </button>
            <button
              type='button'
              onClick={() => { setConfirming(false); setError(''); }}
              disabled={isSubmitting}
              className='btn-secondary flex-1'
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
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
      <div className='max-w-2xl mx-auto px-6 pb-8' aria-busy='true' aria-label='Generating illustration'>
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
      <div className='max-w-2xl mx-auto px-6 pb-8'>
        <hr className='garden-divider mb-10' />
        <figure>
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

        <dialog
          ref={dialogRef}
          onClick={handleBackdropClick}
          aria-label={`Full-size illustration for "${poemTitle}"`}
          className='lightbox-dialog'
        >
          <div className='relative'>
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

            <Image
              src={imageUrl}
              alt={altText}
              width={1024}
              height={768}
              className='w-full h-auto block rounded-t-[20px]'
              unoptimized
            />

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

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
      <path d='M21 12a9 9 0 1 1-6.219-8.56' />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
      <path d='M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' />
      <path d='M21 3v5h-5' />
      <path d='M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' />
      <path d='M8 16H3v5' />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
      <rect width='18' height='18' x='3' y='3' rx='2' ry='2' />
      <circle cx='9' cy='9' r='2' />
      <path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
      <circle cx='12' cy='12' r='10' />
      <path d='M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20' />
      <path d='M2 12h20' />
    </svg>
  );
}
