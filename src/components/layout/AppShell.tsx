'use client';

import { cn } from '@/lib/utils';
import { useLayoutStore } from '@/store/layout';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { position } = useLayoutStore();

  if (position === 'top') {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        <Header />
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-screen overflow-hidden bg-background',
        position === 'right' && 'flex-row-reverse',
      )}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
