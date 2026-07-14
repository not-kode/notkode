import './globals.css';
import type { Metadata } from 'next';
import { DM_Sans, JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';

// Fontes auto-hospedadas via next/font: sem @import externo (que bloqueava o render),
// com preload e fallback automáticos. Expõem as CSS variables usadas no Tailwind.
const dmSans = DM_Sans({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-dm',
  display: 'swap',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});
const parabole = localFont({
  src: '../../public/fonts/Parabole.woff2',
  variable: '--font-bricolage',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://notkode.com.br'),
  title: 'Notkode',
  description: 'Custom technology, with AI inside.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${dmSans.variable} ${jetbrainsMono.variable} ${parabole.variable}`}
    >
      <body className="min-h-screen bg-surface-base text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
