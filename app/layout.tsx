import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EtsyKeyword - Etsy SEO & Keyword Research Tool',
  description: 'AI-powered keyword research, SEO optimization, shop health analytics, and trend tracking for Etsy sellers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
