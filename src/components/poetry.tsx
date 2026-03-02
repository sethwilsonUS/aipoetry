import { IPoetry } from '@/types/poetry';

export default function Poetry({ title, lines, styleName, styleExplanation }: IPoetry) {
  return (
    <article
      className='max-w-2xl mx-auto px-6 py-12 sm:py-16'
      aria-labelledby='poem-title'
    >
      {/* Announces completion to screen readers when transitioning from the generating state */}
      <p role='status' className='sr-only'>Poem complete.</p>

      {/* Title */}
      <header className='mb-10'>
        <h1
          id='poem-title'
          className='text-4xl sm:text-5xl font-bold leading-tight text-[var(--text-primary)] mb-4'
          style={{ fontFamily: 'var(--font-display), serif' }}
        >
          {title}
        </h1>

        {/* Style info as native disclosure */}
        <details className='style-info group'>
          <summary
            className='inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-150'
            aria-label={`About the ${styleName} form`}
          >
            <span
              className='italic'
              style={{ fontFamily: 'var(--font-display), serif' }}
            >
              {styleName}
            </span>
            <svg className='w-3.5 h-3.5 transition-transform duration-200 group-open:rotate-180' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
              <path d='m6 9 6 6 6-6' />
            </svg>
          </summary>
          <div className='mt-3 p-4 garden-bed text-sm text-[var(--text-secondary)] leading-relaxed max-w-prose'>
            {styleExplanation}
          </div>
        </details>
      </header>

      <hr className='garden-divider' />

      {/* Poem lines */}
      <div
        className='space-y-1.5'
        aria-label='Poem text'
        role='region'
      >
        {lines.map((line, index) => (
          <p
            key={index}
            className='text-lg sm:text-xl leading-relaxed text-[var(--text-primary)]'
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            {line || '\u00A0'}
          </p>
        ))}
      </div>
    </article>
  );
}
