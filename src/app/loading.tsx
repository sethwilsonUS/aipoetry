export default function Loading() {
  return (
    <div className='max-w-2xl mx-auto px-6 py-16'>
      <div className='space-y-4'>
        <div className='skeleton h-12 w-3/4 rounded-lg' />
        <div className='skeleton h-4 w-24 rounded' />
        <div className='mt-8 space-y-2'>
          {[50, 75, 65, 80, 55, 70, 60, 45].map((width, i) => (
            <div
              key={i}
              className='skeleton h-5 rounded'
              style={{ width: `${width}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
