import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/navbar';

export const metadata: Metadata = {
  title: 'Infinite Poetry',
  description: 'AI-generated poems on a variety of topics in a variety of styles.',
  metadataBase: new URL('http://aipoetry.vercel.app/'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
          <main className="flex flex-col items-center justify-between p-12">
            <div className="flex flex-col z-10 w-full max-w-4xl justify-between lg:flex">
              {children}
            </div>
          </main>
      </body>
    </html>
  );
}
