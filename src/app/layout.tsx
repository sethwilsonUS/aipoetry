import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/navbar';

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
        {children}
      </body>
    </html>
  );
}
