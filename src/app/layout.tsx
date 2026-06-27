import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Barlow } from 'next/font/google';
import { LanguageProvider } from '@/components/LanguageContext';
import './globals.css';

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bc',
  display: 'swap',
});

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-b',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ramayani — Buku Resep',
  description: 'Original recipes from the Ramayani Restaurant, Los Angeles, est. 1983.',
  openGraph: {
    title: 'Ramayani',
    description: 'Original recipes from the Ramayani Restaurant, Los Angeles',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${barlowCondensed.variable} ${barlow.variable}`}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
