'use client';

import { useI18n } from '@/i18n';

const APP_VERSION = '0.1.0';
const YEAR = new Date().getFullYear();

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="shrink-0 border-t border-border bg-card px-6 py-2.5 text-xs text-muted-foreground flex items-center justify-between">
      <span>
        {t('footer.company')} &copy; {YEAR} &mdash; {t('footer.copyright')}
      </span>
      <span>
        {t('footer.version')} {APP_VERSION}
      </span>
    </footer>
  );
}
