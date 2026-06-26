import type { Metadata, Viewport } from 'next';
import { LanguageProvider } from '@/components/LanguageContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ramayani — Buku Resep',
  description:
    'Original recipes from the Ramayani Restaurant, Los Angeles, est. 1983.',
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
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
