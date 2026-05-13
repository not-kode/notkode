import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://notkode.com.br'),
  title: 'Notkode',
  description: 'Custom technology, with AI inside.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-surface-base text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
