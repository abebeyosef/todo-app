import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import Providers from '@/components/Providers';
import { ToastProvider } from '@/lib/toast';

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
      <body className="flex h-screen overflow-hidden">
        <Providers>
          <ToastProvider>
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
