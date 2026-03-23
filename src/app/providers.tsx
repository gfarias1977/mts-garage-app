'use client';

import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { LanguageProvider } from '@/i18n';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
