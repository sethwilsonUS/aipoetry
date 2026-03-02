'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { StyleConfig } from '../../convex/stylesConfig';
import { IMAGE_STYLES } from '../../convex/imageStyles';

interface PoemId {
  id: string;
}

interface UserGenProps {
  styles: StyleConfig[];
  poemIds: PoemId[];
  identifier: string;
}

export default function UserGen({ styles, poemIds, identifier }: UserGenProps) {
  const router = useRouter();
  const initAndSchedule = useMutation(api.initPoem.initAndSchedule);

  // Controlled state for every form field — no FormData reads.
  const [topic, setTopic] = useState('');
  const [styleName, setStyleName] = useState('');
  const [artStyle, setArtStyle] = useState('none');
  const [isPublic, setIsPublic] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useId() produces stable, unique IDs that are safe across SSR + hydration.
  const topicId = useId();
  const styleId = useId();
  const artStyleId = useId();
  const errorId = useId();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    if (!topic.trim()) {
      setFormError('Please enter a topic.');
      return;
    }
    if (!styleName) {
      setFormError('Please select a poetic form.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await initAndSchedule({
        topic: topic.trim(),
        styleName,
        artStyle,
        identifier,
        isPublic,
      });

      if (!result.success) {
        setFormError(result.error || 'Failed to generate poem.');
        setIsSubmitting(false);
        return;
      }

      router.push(`/poems/${result.poemId}`);
    } catch {
      setFormError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const showRandomPoem = () => {
    if (poemIds.length === 0) return;
    const random = poemIds[Math.floor(Math.random() * poemIds.length)];
    router.push(`/poems/${random.id}`);
  };

  return (
    <section aria-labelledby='gen-heading'>
      <div className='garden-bed p-6 sm:p-8 max-w-lg mx-auto'>
        <div className='text-center mb-8'>
          <h1
            id='gen-heading'
            className='text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3'
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            Generate a Poem
          </h1>
          <p className='text-[var(--text-secondary)] text-sm leading-relaxed'>
            Choose a topic and a poetic form. Private by default — check the box below to share in
            the Archive.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-describedby={formError ? errorId : undefined}
          className='space-y-5'
        >
          {/* ── Topic ── */}
          <div className='space-y-2'>
            <label
              htmlFor={topicId}
              className='block text-sm font-semibold text-[var(--text-primary)]'
            >
              Topic
            </label>
            <input
              id={topicId}
              type='text'
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder='e.g. coffee, wild horses, Oxford commas…'
              required
              aria-required='true'
              aria-invalid={formError && !topic.trim() ? 'true' : 'false'}
              disabled={isSubmitting}
              className='input-field'
            />
          </div>

          {/* ── Poetic Form ── */}
          <div className='space-y-2'>
            <label
              htmlFor={styleId}
              className='block text-sm font-semibold text-[var(--text-primary)]'
            >
              Poetic Form
            </label>
            <select
              id={styleId}
              value={styleName}
              onChange={(e) => setStyleName(e.target.value)}
              required
              aria-required='true'
              aria-invalid={formError && !styleName ? 'true' : 'false'}
              disabled={isSubmitting}
              className='input-field select-field'
            >
              <option value='' disabled>
                Select a form…
              </option>
              {styles.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* ── Illustration Style ── */}
          <div className='space-y-2'>
            <label
              htmlFor={artStyleId}
              className='block text-sm font-semibold text-[var(--text-primary)]'
            >
              Illustration Style
            </label>
            <select
              id={artStyleId}
              value={artStyle}
              onChange={(e) => setArtStyle(e.target.value)}
              disabled={isSubmitting}
              className='input-field select-field'
            >
              {IMAGE_STYLES.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* ── Image cost notice ── */}
          {artStyle !== 'none' && (
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
          )}

          {/* ── Public toggle ──
               Uses <button role="checkbox"> so Tab focus works on macOS by default.
               Native <input type="checkbox"> is excluded from the macOS Tab sequence
               unless the user has "Full Keyboard Access" enabled in System Preferences.
               Focus styles live in .toggle-btn in globals.css — not inline Tailwind —
               so they can't be overridden by specificity collisions. */}
          <button
            type='button'
            role='checkbox'
            aria-checked={isPublic}
            onClick={() => setIsPublic((v) => !v)}
            disabled={isSubmitting}
            className='toggle-btn'
          >
            <span
              className='toggle-indicator'
              data-checked={String(isPublic)}
              aria-hidden='true'
            >
              {isPublic && (
                <svg viewBox='0 0 10 10' fill='none' aria-hidden='true' style={{ width: 10, height: 10 }}>
                  <path
                    d='M1.5 5l2.5 2.5 4.5-4.5'
                    stroke='white'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              )}
            </span>
            <span className='text-sm leading-snug'>
              <span className='font-semibold text-[var(--text-primary)]'>
                Add to public archive
              </span>
              <span className='block text-[var(--text-muted)] mt-0.5'>
                By default your poem is private — only accessible via its direct link. Check this
                to share it in the Archive.
              </span>
            </span>
          </button>

          {/* ── Validation error ── */}
          {formError && (
            <div
              id={errorId}
              role='alert'
              aria-live='assertive'
              className='alert-error'
            >
              <svg
                className='w-5 h-5 shrink-0 mt-0.5'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth={2}
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden='true'
              >
                <circle cx='12' cy='12' r='10' />
                <path d='M12 8v4M12 16h.01' />
              </svg>
              <span>{formError}</span>
            </div>
          )}

          {/* ── Submit ── */}
          <button
            type='submit'
            className='btn-primary'
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <SpinnerIcon className='w-4 h-4 animate-spin' aria-hidden='true' />
                Composing…
              </>
            ) : (
              <>
                <PenIcon className='w-4 h-4' aria-hidden='true' />
                Generate a Poem
              </>
            )}
          </button>

          {/* ── Divider ── */}
          <div className='flex items-center gap-3 py-1' aria-hidden='true'>
            <hr className='flex-1 border-[var(--border-color)]' />
            <span className='text-xs text-[var(--text-muted)] font-medium uppercase tracking-widest'>
              or
            </span>
            <hr className='flex-1 border-[var(--border-color)]' />
          </div>

          {/* ── Random ── */}
          <button
            type='button'
            className='btn-secondary'
            onClick={showRandomPoem}
            disabled={isSubmitting || poemIds.length === 0}
            aria-label='Navigate to a randomly selected poem from the archive'
          >
            <DiceIcon className='w-4 h-4' aria-hidden='true' />
            I&apos;m Feeling Plucky!
          </button>
        </form>
      </div>
    </section>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M21 12a9 9 0 1 1-6.219-8.56' />
    </svg>
  );
}

function PenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' />
    </svg>
  );
}

function DiceIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <rect width='18' height='18' x='3' y='3' rx='2' ry='2' />
      <path d='M16 8h.01M8 8h.01M12 12h.01M16 16h.01M8 16h.01' />
    </svg>
  );
}
