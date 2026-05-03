import { headers } from 'next/headers';
import PoemPageClient from '@/components/poem-page-client';

export default async function PoemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headersList = await headers();
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'anonymous';

  return <PoemPageClient poemId={id} identifier={ip} />;
}
