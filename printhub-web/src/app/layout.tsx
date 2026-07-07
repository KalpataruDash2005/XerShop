import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'PrintHub - On-Demand Printing Services',
  description: 'Print Anything. Anywhere. Anytime. Upload documents, configure print options, and get prints delivered from nearby shops.',
  keywords: ['printing', 'xerox', 'documents', 'photos', 'delivery', 'print shop'],
  authors: [{ name: 'PrintHub' }],
  openGraph: {
    title: 'PrintHub - On-Demand Printing Services',
    description: 'Print Anything. Anywhere. Anytime.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'PrintHub',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-slate-50 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
