import PoemsList from '@/components/poems-list';

export default function PoemsPage() {
  return (
    <div className='max-w-3xl mx-auto px-4 py-12'>
      <header className='mb-10'>
        <h1
          className='text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3'
          style={{ fontFamily: 'var(--font-display), serif' }}
        >
          The Archive
        </h1>
        <p className='text-[var(--text-secondary)]'>
          Every poem generated so far, in reverse order of planting.
        </p>
      </header>
      <PoemsList />
    </div>
  );
}
