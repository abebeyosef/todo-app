import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'ToDo',
  description: 'Personal Task & Habit Manager',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden">
        <Providers>
          <Suspense>
            <Sidebar />
          </Suspense>
          <MainContent>
            <Suspense>{children}</Suspense>
          </MainContent>
        </Providers>
      </body>
    </html>
  );
}
