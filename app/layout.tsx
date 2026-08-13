import type { Metadata } from 'next';
import { Jost, Marcellus, Great_Vibes } from 'next/font/google';
import './globals.css';

const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
});

const marcellus = Marcellus({
  variable: '--font-marcellus',
  subsets: ['latin'],
  weight: '400',
});

const greatVibes = Great_Vibes({
  variable: '--font-great-vibes',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Ayesha & Rohan — Welcome to Our World',
  description: 'A guided wedding journey through three celebrations.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${marcellus.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-hidden bg-[#0d0b1e] font-[family-name:var(--font-jost)]">
        {children}
      </body>
    </html>
  );
}
