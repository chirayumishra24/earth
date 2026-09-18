import type { Metadata, Viewport } from 'next';
import { Fredoka, Bungee } from 'next/font/google';
import './globals.css';

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fredoka',
});

const bungee = Bungee({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bungee',
});

export const viewport: Viewport = {
  themeColor: '#0284c7',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'GLOBE RACERS | Find It. Answer It. Race Across the Earth!',
  description:
    'An interactive, two-team digital classroom geography quiz game for Class 6 based on Locating Places on the Earth.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GlobeRacers',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fredoka.variable} ${bungee.variable}`}>
      <body className="font-game antialiased bg-gradient-to-br from-sky-100 via-blue-50 to-amber-50 text-slate-800 min-h-screen selection:bg-sky-400 selection:text-white">
        {children}
      </body>
    </html>
  );
}
