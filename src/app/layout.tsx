import type { Metadata } from 'next';
import '../styles/globals.css';
import Providers from './providers';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Expense Tracker - Track Your Spending',
  description: 'A minimal, aesthetic expense tracker. Add expenses in under 5 seconds.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
