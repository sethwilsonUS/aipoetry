import type { Metadata } from 'next';
import { Fraunces, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/navbar';
import { ThemeProvider } from '@/components/theme-provider';
import ConvexClientProvider from '@/components/convex-provider';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// Inline script to prevent flash of wrong theme before React hydrates.
const themeScript = '(function(){try{var t=localStorage.getItem(\'theme\');var theme=t===\'light\'||t===\'dark\'?t:window.matchMedia(\'(prefers-color-scheme: dark)\').matches?\'dark\':\'light\';document.documentElement.classList.add(theme);document.documentElement.style.colorScheme=theme;}catch(e){document.documentElement.classList.add(\'dark\');}})();';

// CSS-only theme icon visibility — applied before hydration so no flash.
const themeToggleCss = '.theme-icon-sun,.theme-icon-moon{display:none;}.dark .theme-icon-sun{display:inline-flex;}.light .theme-icon-moon{display:inline-flex;}';

export const metadata: Metadata = {
  title: 'Infinite Poetry',
  description: 'AI-generated poems on a variety of topics in a variety of styles.',
  metadataBase: new URL('https://infinitepoetry.ai/'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <style dangerouslySetInnerHTML={{ __html: themeToggleCss }} />
      </head>
      <body>
        <ConvexClientProvider>
          <ThemeProvider>
            <a href='#main-content' className='skip-link'>
              Skip to main content
            </a>
            <Navbar />
            <main
              id='main-content'
              role='main'
              className='pt-14 min-h-screen animated-gradient'
            >
              {children}
            </main>
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
