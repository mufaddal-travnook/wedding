import type { Metadata } from 'next';
import { Jost, Marcellus, Great_Vibes } from 'next/font/google';
import { defaultConfig } from '@/app/config/default-config';
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

const { couple } = defaultConfig;

export const metadata: Metadata = {
  title: `${couple.name1} & ${couple.name2} — ${couple.tagline}`,
  description: `A guided wedding journey for ${couple.name1} & ${couple.name2} · ${couple.date} · ${couple.location}.`,
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
