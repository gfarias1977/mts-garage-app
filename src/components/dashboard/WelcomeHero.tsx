'use client';

import { Gauge } from 'lucide-react';
import { useI18n } from '@/i18n';

export function WelcomeHero() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent">
        <Gauge size={40} className="text-accent-foreground" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('welcome.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('welcome.subtitle')}</p>
      </div>
      <p className="max-w-md text-sm text-muted-foreground">{t('welcome.description')}</p>
    </div>
  );
}
