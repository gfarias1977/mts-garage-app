'use client';

import { UserButton } from '@clerk/nextjs';
import { Sun, Moon, Monitor, PanelLeftClose, PanelLeftOpen, PanelLeft, PanelRight, PanelTop } from 'lucide-react';
import { useLayoutStore, type SidebarPosition } from '@/store/layout';
import { useTheme, type ThemeVariant } from '@/components/layout/ThemeProvider';
import { useI18n, type Locale } from '@/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  const { collapsed, position, toggleCollapsed, setPosition } = useLayoutStore();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();

  const positions: { value: SidebarPosition; icon: React.ElementType; label: string }[] = [
    { value: 'left', icon: PanelLeft, label: 'Left' },
    { value: 'right', icon: PanelRight, label: 'Right' },
    { value: 'top', icon: PanelTop, label: 'Top' },
  ];

  const themes: { value: ThemeVariant; icon: React.ElementType; labelKey: keyof typeof themeLabels }[] = [
    { value: 'light', icon: Sun, labelKey: 'light' },
    { value: 'dark', icon: Moon, labelKey: 'dark' },
    { value: 'semi-dark', icon: Monitor, labelKey: 'semi-dark' },
  ];

  const themeLabels = {
    light: t('header.theme_light'),
    dark: t('header.theme_dark'),
    'semi-dark': t('header.theme_semi_dark'),
  } as const;

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 shrink-0">
      {/* Left: collapse toggle (hidden in top mode) */}
      <div className="flex items-center gap-2">
        {position !== 'top' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </Button>
        )}
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-1">
        {/* Position switcher */}
        <div className="flex items-center rounded-md border border-border">
          {positions.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setPosition(value)}
              title={label}
              className={cn(
                'p-2 transition-colors first:rounded-l-md last:rounded-r-md',
                'text-muted-foreground hover:bg-muted',
                position === value && 'bg-muted text-foreground',
              )}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        {/* Language switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center rounded px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors min-w-[3rem]">
            {locale.toUpperCase()}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(['es', 'en'] as Locale[]).map((l) => (
              <DropdownMenuItem
                key={l}
                onClick={() => setLocale(l)}
                className={cn(locale === l && 'font-semibold')}
              >
                {l.toUpperCase()}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger
            title={t('header.theme')}
            className="flex items-center justify-center rounded p-2 hover:bg-muted transition-colors"
          >
            {theme === 'dark' ? (
              <Moon size={18} />
            ) : theme === 'semi-dark' ? (
              <Monitor size={18} />
            ) : (
              <Sun size={18} />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {themes.map(({ value, icon: Icon, labelKey }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setTheme(value)}
                className={cn('flex items-center gap-2', theme === value && 'font-semibold')}
              >
                <Icon size={16} />
                {themeLabels[labelKey]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User button */}
        <div className="ml-2">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
