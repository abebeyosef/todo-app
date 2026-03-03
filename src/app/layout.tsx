import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import Providers from '@/components/Providers';
import { ToastProvider } from '@/lib/toast';
import GlobalOverlays from '@/components/GlobalOverlays';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ToDo',
  description: 'Personal Task & Habit Manager',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('todo-theme');if(t)document.documentElement.setAttribute('data-theme',t);})();` }} />
      </head>
      <body className="flex h-screen overflow-hidden">
        <Providers>
          <ToastProvider>
            <GlobalOverlays />
            <Suspense>
              <Sidebar />
            </Suspense>
            <MainContent>
              <Suspense>{children}</Suspense>
            </MainContent>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
