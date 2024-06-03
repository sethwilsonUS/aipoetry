import type { Metadata, } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Infinite Poetry',
  description: 'AI-generated poems on a variety of topics in a variety of styles.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
