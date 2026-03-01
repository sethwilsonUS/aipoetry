'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface Style {
  _id: string;
  name: string;
  description: string;
}

interface PoemId {
  id: string;
}

interface UserGenProps {
  styles: Style[];
  poemIds: PoemId[];
}

export default function UserGen({ styles, poemIds }: UserGenProps) {
  const router = useRouter();
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  const initAndSchedule = useMutation(api.initPoem.initAndSchedule);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const topic = formData.get('topic') as string;
    const style = formData.get('style') as string;

    if (!topic.trim() || !style) {
      setFormError('Please fill in both fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await initAndSchedule({
        topic: topic.trim(),
        styleName: style,
        identifier: 'anonymous',
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
            Choose a topic and a poetic form. All generated poems are public.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className='space-y-5'>
          {/* Topic */}
          <div className='space-y-2'>
            <label
              htmlFor='topic-input'
              className='block text-sm font-semibold text-[var(--text-primary)]'
            >
              Topic
            </label>
            <input
              id='topic-input'
              type='text'
              name='topic'
              placeholder='e.g. coffee, wild horses, Oxford commas…'
              required
              disabled={isSubmitting}
              className='input-field'
              aria-describedby='topic-hint'
            />
            <p id='topic-hint' className='sr-only'>
              Enter the topic you&apos;d like your poem to be about
            </p>
          </div>

          {/* Style */}
          <div className='space-y-2'>
            <label
              htmlFor='style-select'
              className='block text-sm font-semibold text-[var(--text-primary)]'
            >
              Poetic Form
            </label>
            <select
              id='style-select'
              name='style'
              required
              disabled={isSubmitting}
              className='input-field select-field'
              defaultValue=''
              aria-describedby='style-hint'
            >
              <option value='' disabled>
                Select a form…
              </option>
              {styles.map((style) => (
                <option key={style._id} value={style.name}>
                  {style.name}
                </option>
              ))}
            </select>
            <p id='style-hint' className='sr-only'>
              Choose the poetic form for your generated poem
            </p>
          </div>

          {/* Archive opt-in */}
          <label className='flex items-start gap-3 cursor-pointer group'>
            <input
              type='checkbox'
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={isSubmitting}
              className='mt-0.5 w-4 h-4 rounded border-2 border-[var(--accent-border)] accent-[var(--accent)] cursor-pointer shrink-0'
              aria-describedby='public-hint'
            />
            <span className='text-sm leading-snug'>
              <span className='font-semibold text-[var(--text-primary)]'>
                Add to public archive
              </span>
              <span className='block text-[var(--text-muted)] mt-0.5'>
                By default your poem is private — only accessible via its direct link.
                Check this to share it in the Archive.
              </span>
            </span>
          </label>
          <p id='public-hint' className='sr-only'>
            When unchecked, your poem will only be accessible via its direct URL and will not
            appear in the public archive.
          </p>

          {/* Error */}
          {formError && (
            <div className='alert-error' role='alert' aria-live='polite'>
              <svg className='w-5 h-5 shrink-0 mt-0.5' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                <circle cx='12' cy='12' r='10' />
                <path d='M12 8v4M12 16h.01' />
              </svg>
              <span>{formError}</span>
            </div>
          )}

          {/* Submit */}
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

          {/* Divider */}
          <div className='flex items-center gap-3 py-1'>
            <hr className='flex-1 border-[var(--border-color)]' />
            <span className='text-xs text-[var(--text-muted)] font-medium uppercase tracking-widest'>
              or
            </span>
            <hr className='flex-1 border-[var(--border-color)]' />
          </div>

          {/* Random */}
          <button
            type='button'
            className='btn-secondary'
            onClick={showRandomPoem}
            disabled={isSubmitting || poemIds.length === 0}
            aria-describedby='plucky-hint'
          >
            <DiceIcon className='w-4 h-4' aria-hidden='true' />
            I&apos;m Feeling Plucky!
          </button>
          <p id='plucky-hint' className='sr-only'>
            Navigate to a randomly selected poem from the archive
          </p>
        </form>
      </div>
    </section>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
      <path d='M21 12a9 9 0 1 1-6.219-8.56' />
    </svg>
  );
}

function PenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
      <path d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' />
    </svg>
  );
}

function DiceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
      <rect width='18' height='18' x='3' y='3' rx='2' ry='2' />
      <path d='M16 8h.01M8 8h.01M12 12h.01M16 16h.01M8 16h.01' />
    </svg>
  );
}
