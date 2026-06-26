import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import { LanguageProvider } from '@/components/LanguageContext';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
});

const lato = Lato({
  subsets: ['latin'],
  variable: '--font-lato',
  display: 'swap',
  weight: ['300', '400', '700'],
});

export const metadata: Metadata = {
  title: 'Ramayani — Buku Resep',
  description:
    'Resep-resep asli dari Restoran Ramayani, Los Angeles. Original recipes from the Ramayani Restaurant, est. 1983.',
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
    <html lang="id" className={`${playfair.variable} ${lato.variable}`}>
      <body>
        {/* Batik gold texture at 6% — sits behind all content */}
        <div className="batik-bg" aria-hidden="true" />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
